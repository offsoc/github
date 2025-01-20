# typed: true
# frozen_string_literal: true

# FIXME: This is necessary because SECRET_KEY_BASE in the environment takes
# precedence over any configuration
if secret_key = ENV["NEW_SECRET_KEY_BASE"]
  ENV["SECRET_KEY_BASE"] = secret_key
end

require File.expand_path("../boot", __FILE__)

require "rails"
require "trilogy"
require "github-trilogy-adapter"
require "active_record/railtie"
require "action_controller/railtie"
require "action_mailer/railtie"
require "will_paginate/railtie"
require "view_component"
require "view_precompiler"
if Rails.env.development? && !ENV["FASTDEV"] && !ENV["PRELOAD"] && !ENV["SKIP_LOOKBOOK"]
  require "lookbook"
end
require "rails/test_unit/railtie" if Rails.env.test?
require "inline_svg"
require_relative "initializer_instrumentation"
require_relative "github_middleware"
require "api_schema"
require "github/middleware/database_selection"
require "active_job/queue_adapters/aqueduct_adapter"
require "permission_cache"
require "forgery_protection_strategies/allow_verified_fetch"
require "graphql"
require "typhoeus"
require "opentelemetry-instrumentation-excon"
require "opentelemetry-instrumentation-ethon"
require "opentelemetry-instrumentation-faraday"
require "opentelemetry-instrumentation-graphql"
require "opentelemetry-instrumentation-net_http"
require "opentelemetry-instrumentation-rack"
require "opentelemetry-instrumentation-ruby_kafka"
require "opentelemetry-instrumentation-trilogy"
require "feature_flag/vexi"
require "feature_flag/middleware/memoizer"
require "github/middleware/tenant_selection"
require_relative "../packages/management_tools/app/models/experiment_cache"
require_relative "../lib/search/aggregator"
require_relative "instrumentation/gitrpc"
require_relative "instrumentation/redis"
require_relative "./query_warnings_action"
require "rack/request_logger"
require "rack/malformed_request_handler"
require "rack/request_id"
require "rack/server_id"
require "flipper/middleware/setup_env"
require "flipper/middleware/memoizer"
require "flipper/middleware/overrider"
require_relative "../app/platform/middleware/batch_loading"
require "rack/process_utilization"
require "github/middleware/cluster_disabler"
require "github/middleware/force_open_breaker"
require "github/middleware/after_response"
require "iopromise/rack/context_middleware"
require "failbot/middleware"

# Requiring SecureHeaders automatically inserts the middleware via SecureHeaders::Railtie
require "secure_headers"

require "github-telemetry"
require "github/telemetry/railtie"
require "github/telemetry/hacks"

require "github/runtime_code_coverage"

module GitHub
  class Application < Rails::Application
    include RailsApplicationInstrumentation
    include GitHubMiddleware
    extend GitHubMiddleware

    # Override Rails' default eager load, so we can eager load lib
    # (except for the paths in config.eager_ignore_paths), and graphql views.
    # Other files will have already been eager_loaded by Zeitwerk by this
    # point.
    def eager_load!
      Dir.glob("#{Rails.root.join("lib")}/**/*.rb").sort.each do |file|
        next if config.eager_ignore_paths.any? { |p| file.start_with?(p.to_s) }
        require file
      end

      # Eagerly loads GraphQL client views.
      Views.eager_load! if Rails.application.config.cache_classes
    end

    config.active_record.encryption.store_key_references = true

    config.autoloader = :zeitwerk
    Rails.autoloaders.log! if ENV["ZEITWERK_VERBOSE"] == "1"
    Rails.autoloaders.each do |autoloader|
      autoloader.ignore Rails.root.join("app/api/description")
      autoloader.inflector = GitHub::ZeitwerkInflector.new
    end

    # We don't follow Rails conventions for `app/api` (classes in this
    # directory are under the `Api` namespace), so we need to prevent
    # eager loading the api directory and let Zeitwerk know about the
    # namespace.
    module ::Api; end
    config.paths.add("app/api", eager_load: false)
    Rails.autoloaders.main.push_dir(Rails.root.join("app/api"), namespace: ::Api)

    # Although platform lives in `lib` we want to treat it like app code.
    module ::Platform; end
    Rails.autoloaders.main.push_dir(Rails.root.join("app/platform"), namespace: ::Platform)
    initializer(:load_platform, after: :setup_main_autoloader) do
      require_relative "../lib/platform"
    end

    # Autoload all subdirs of the app directory within a package.
    Dir["#{Rails.root}/packages/*/app/{*,*/concerns}"].each do |package_app_subdir|
      Rails.autoloaders.main.push_dir(package_app_subdir)
    end

    config.eager_ignore_paths = [
      # These are conditionally loaded based on the environment
      Rails.root.join("lib/github/config/environments").to_s,
      # These are used as git hooks
      Rails.root.join("lib/git-core").to_s,
      # These are run to transition data
      Rails.root.join("lib/github/transitions").to_s,
      # These are used to run audit log transitions
      Rails.root.join("lib/audit/transitions").to_s,
      # These are used only by the packwerk script
      Rails.root.join("lib/github/packwerk").to_s,
      # These are used only by script/report_code_stats.rb and sorbet-typed-level
      Rails.root.join("lib/code_stats").to_s,
      Rails.root.join("lib/github/sorbet").to_s,
      # Everything in gh/dev will not be eager loaded
      Rails.root.join("lib/gh/dev").to_s,
      # These is only used by script/service-endpoints
      Rails.root.join("lib/github/serviceowners/service_endpoints").to_s,
    ]

    config.paths["vendor"].skip_load_path!

    package_dirs = Dir.glob(File.join(Rails.root, "packages/*/app"))
    config.watchable_dirs.merge!(package_dirs.index_with(:rb))
    config.watchable_dirs["app/views"] = [:erb]

    # Use memcache as rails cache store
    require "github/config/memcache"
    GitHub.set_up_rails_cache_store

    config.after_initialize do
      # In order to avoid issues when lazy-loading, we need to reference
      # ApplicationRecord::Mysql1, which is our "primary abstract class".
      #
      # This means that it's responsible for defining the connections available
      # on ActiveRecord::Base, but since referencing ActiveRecord::Base doesn't
      # cause it to be autoloaded, we must do it here.
      #
      # All we are doing here is referencing the class so that its connected_to
      # declaration takes effect.
      ApplicationRecord::Mysql1

      # Preload
      if config.eager_load && !ENV["GITAUTH"] && GitHub.role != :fsworker && GitHub.role != :aqueduct
        # Eagerly load ActionView views.
        ViewPrecompiler.precompile

        GitHub::Markup.preload!
        begin
          # TODO: Remove this after project munich ships
          # it's only needed for the feature flag check in Plan.all
          if FlipperGate.table_exists?
            GitHub::Plan.all
          end
        rescue ActiveRecord::NoDatabaseError
          # No database created yet
        end

        # SERVICEOWNERS
        GitHub.serviceowners

        # Elastomer.
        # Remove this once https://github.com/github/elastomer-client/pull/285 is merged
        ElastomerClient::Client::RestApiSpec.api_spec("5.6")
        ElastomerClient::Client::RestApiSpec.api_spec("8.7")

        # Linguist samples
        # These are used to classify code by language. Ideally we'd only do
        # this in background jobs, but it currently (2023-12-05) happens on
        # frontends so we should eager load this. (~100k objects, 10MB)
        Linguist::Samples.cache

        # ActiveRecord
        ActiveRecord::Base.descendants.each do |model|
          table_exists = model.table_exists?
          next unless table_exists

          model.define_attribute_methods
        rescue ActiveRecord::NoDatabaseError
          # Likely no database
        end
      end

      # Ensure we use GitHub::JSON instead of ActiveSupport::JSON
      require "github/json/rational_patch"
      require "github/json/active_support_patch"
    end

    # Enable async queries. Must be used in combination with database configuration.
    config.active_record.async_query_executor = :multi_thread_pool

    # Ignore temporary tables when dumping the schema cache. These are tables
    # that begin with an underscore.
    config.active_record.schema_cache_ignored_tables = [/^_/]

    # Our current Rails version enforces a schema cache version check that we didn't have
    # before. This causes warnings in the following form:
    #   Ignoring db/schema/mysql1.dump because it has expired. The current schema version is abcv5, but the one in the schema cache file is defv5.
    #
    # This configuration setting prevents us from doing the this check, which is not necessary
    # in our environments since in production we generate a new schema cache on every deploy.
    config.active_record.check_schema_cache_dump_version = false
    # NOTE: there existing config.active_record.check_schema_cache_dump_version setting
    #   has a bug in Rails and it is not propagated internally, that's why we need to set
    #   this option directly in the ActiveRecord::ConnectionAdapters::SchemaReflection class
    #   here. This will be removed once the fix is done in upstream Rails
    ActiveRecord::ConnectionAdapters::SchemaReflection.check_schema_cache_dump_version = false

    config.active_record.lazily_load_schema_cache = true

    config.active_record.query_log_tags_enabled = true
    config.active_record.cache_query_log_tags = true

    config.active_record.automatic_scope_inversing = true
    config.active_record.automatically_invert_plural_associations = true

    # Configure classes which allow to be serialized to yaml
    config.active_record.yaml_column_permitted_classes = [
      Date,
      Time,
      Symbol,
      Set,
      ActiveModel::Errors,
      ActiveSupport::HashWithIndifferentAccess
    ]

    config.active_record.db_warnings_action = QueryWarningsAction.to_proc
    config.active_record.db_warnings_ignore = QueryWarningsAction::IGNORED_WARNINGS

    # adjust the logging level to whatever's set up on GitHub::Config. This is
    # usually :info (1) in production environments and :debug (0) elsewhere.
    config.log_level = GitHub.rails_log_level

    if GitHub.rails_log_stderr?
      $stderr.sync = true
      logger = ActiveSupport::Logger.new($stderr, level: config.log_level)
      logger.formatter = config.log_formatter
      config.logger = ActiveSupport::TaggedLogging.new(logger)
    end

    config.active_job.queue_adapter = :aqueduct
    # Rails 6.1 introduces "jitter" to ActiveJob retry timing.
    # We set to 0.0 to remove any randomness in retries
    config.active_job.retry_jitter = 0.0

    # Ensure that job arguments are not logged in case they contain senstive information
    config.active_job.log_arguments = false

    # Unshift GitHub::Routers::Api on to the stack to use as a placeholder for other GitHub middleware.
    config.middleware.unshift GitHub::Routers::Api

    # this goes before everything!
    config.middleware.unshift GitHub::RuntimeCodeCoverage::Middleware

    ########################################################################################
    # The following GitHub middleware is added before GitHub::Routers::Api so will be called
    # if the router sends the request to a different app.
    #
    # They will appear in the stack in the same order that they're insert_before'ed.
    ########################################################################################

    # This middleware resets `GitHub.context`, which stores global context for each
    # request. This should happen early in the chain to avoid wiping out any context
    # set by other middleware.
    add_github_middleware GitHub::ContextMiddleware

    # Wraps the request and any additional middleware below in an IOPromise cancel
    # context, which ensures that any IOPromises are cancelled if they are not
    # fully completed by the time the middlewhere finishes. This ensures that in
    # the case of an uncaught exception or similar that prevents an IOPromise from
    # ever being `#sync`ed, the promise chain will not execute outside the request.
    # See: https://github.com/iopromise-ruby/iopromise/pull/2
    add_github_middleware IOPromise::Rack::ContextMiddleware

    add_github_middleware GitHub::Middleware::AfterResponse

    # LazyCache middleware depends on the AfterResponse middleware
    config.middleware.insert_after GitHub::Middleware::AfterResponse, GitHub::LazyMemcache::Middleware, GitHub.cache

    # Tell Failbot not to include sensitive parameters from uncaught exceptions.
    # This needs to come *before* Failbot::Rescuer.
    add_github_middleware Rack::Config do |env|
      env["filter_words"] = GitHub.filtered_params
    end

    add_github_middleware Failbot::Rescuer, app: "github"

    add_github_middleware GitHub::Middleware::ClusterDisabler

    add_github_middleware GitHub::Middleware::ForceOpenBreaker

    # Records stats about each request. Keep this near the top of this file as
    # anything above it won't count toward our request timing metrics.
    add_github_middleware GitHub::Middleware::Stats

    # Enable and reset the local per-request cache
    add_github_middleware GitHub::Cache::ResetMiddleware

    add_github_middleware Platform::Middleware::BatchLoading

    # Enable turning features on/off via ?_features= for staff users
    flipper_block = lambda { GitHub.flipper }
    if Rails.env.development?
      staff_users_only = -> (_) { true }
    else
      staff_users_only = -> (request) { GitHub::StaffOnlyCookie.read(request.cookies) }
    end
    add_github_middleware Flipper::Middleware::Overrider, flipper_block, staff_users_only

    # Add flipper instance to the request environment
    add_github_middleware Flipper::Middleware::SetupEnv, flipper_block

    # Enable Flipper feature memoization - this uses the flipper instance that SetupEnv stores in the
    # request env, so make sure it's inserted after the SetupEnv middleware.
    config.middleware.insert_after Flipper::Middleware::SetupEnv, Flipper::Middleware::Memoizer, preload: false

    add_github_middleware GitHub::RequestTimerMiddleware

    # Create (but don't raise) GitHub::TimeoutMiddleware::RequestTimeout error
    # after the configured timeout and exit the process. Putting this here rather
    # than in config/environments/production.rb to ensure middleware order is preserved.
    add_github_middleware GitHub::TimeoutMiddleware

    # GitHub app middleware pipeline
    add_github_middleware Rack::MalformedRequestHandler

    add_github_middleware Rack::ServerId

    # Enable Rack middleware for capturing (or generating) request id's
    add_github_middleware Rack::RequestId

    # Enable Rack middleware for logging requests
    add_github_middleware Rack::RequestLogger

    # Middleware to set the business for the request (for use with multi-tenant GitHub)
    # This needs to run before router for APIs to make sure router is tenant aware
    # This needs to run before the Search Aggregator middleware to make sure the tenant is still available when jobs are enqueued
    add_github_middleware GitHub::Middleware::TenantSelection

    # Ensures that Hydro batching is enabled and logs the request.
    add_github_middleware GitHub::HydroMiddleware

    add_github_middleware Search::Aggregator::Middleware
    add_github_middleware ExperimentCache

    add_github_middleware GitHub::Limiters::Renderer

    ########################################################################################
    # The following GitHub middleware is added to a specific location in the stack for
    # performance measurement reasons. Metrics generated by Rack::ProcessUtilization are
    # used to trigger SLO alerts and can change in non-user-facing ways when other
    # middleware is/isn't included in those timing metrics.
    #
    # See https://github.com/github/github/issues/249161 for an example of a change in order
    # causing an SLO alarm.
    ########################################################################################

    # Records time each process spends actively processing a request vs. being idle
    # waiting on a request.
    dogstats_block = lambda { GitHub.dogstats }
    config.middleware.insert_before GitHub::Middleware::Stats, Rack::ProcessUtilization,
      GitHub.host_name, GitHub.current_sha[0, 7], stats: GitHub.stats, dogstats: dogstats_block

    config.middleware.insert_before Rack::ProcessUtilization, GitHub::BufferedStatsMiddleware if GitHub.enterprise?

    config.middleware.insert_before Rack::ProcessUtilization, GitHub::LineProfilerMiddleware, Rails.root

    config.middleware.insert_before Rack::ProcessUtilization, GitHub::FlamegraphMiddleware

    config.middleware.insert_before Rack::ProcessUtilization, GitHub::AllocationTracerMiddleware,
      Rails.root, Gem.dir if GitHub::AllocationTracerMiddleware.enabled?

    ########################################################################################
    # The following GitHub middleware is added after GitHub::Routers::Api so won't be called
    # if the router sends the request to a different app.
    ########################################################################################

    GitHub::Enterprise::Middleware.mount(config.middleware) if GitHub.enterprise?

    config.middleware.insert_after GitHub::Routers::Api, GitHub::Limiters::AppMiddleware,
      # always limit requests to this path:
      GitHub::Limiters::ByPath.new("/site/limittown"),
      # 1000 anonymous req by ip and path averaged over two minutes, violations
      # cause the IP to be blocked in GLB for five minutes.
      # NOTE(chriskirkland): this limiter needs to go before the CountAnonymousByIPAndPath
      # limiter or it will never trigger.
      GitHub::Limiters::DDoSAnonymousByIPAndPath.new(limit: 1000, ttl: 120),
      # 40 anonymous req/min by ip and path averaged over two minutes
      GitHub::Limiters::CountAnonymousByIPAndPath.new(limit: 40, ttl: 120)

    config.middleware.insert_after GitHub::Routers::Api, GitHub::ServerTimingMiddleware

    # Middleware for memoizing feature flags for the duration of a request to reduce latency of subsequent checks against the same flag.
    # This is inserted after the ActionDispatch::Callbacks middleware to ensure that it is anchored after ActionDispatch::Reloader
    # to ensure that any app constants that may be required for custom_gate evaluation are appropriately autoloaded/unloaded
    # Note: We cannot make it directly relative to ActionDispatch::Reloader, because that middleware is not always present (e.g. in tests and production)
    config.middleware.insert_after ActionDispatch::Callbacks, ::FeatureFlag::Middleware::Memoizer

    # Middleware for choosing which database connection to use.
    config.middleware.use GitHub::Middleware::DatabaseSelection

    config.middleware.use PermissionCache

    # This changes the trusted lookup method because we know that for both
    # .com and enterprise we never have private space ip's in this list. This
    # makes sure that we actually select those private ip's since we want
    # those in an enterprise context.
    trusted_proxies = /\A127\.0\.0\.1\z|\A::1\z|\Alocalhost\z/i
    Rack::Request.ip_filter = lambda { |ip|
      trusted_proxies.match(ip)
    }
    config.action_dispatch.trusted_proxies = [
      trusted_proxies
    ]

    # We have our own request id generation, so disable the standard Rails one
    config.middleware.delete(ActionDispatch::RequestId)

    config.middleware.insert_after ActionDispatch::Session::CookieStore,
      GitHub::Limiters::AppMiddleware,
      # Limit per-browser-session requests similarly to the API. Instead of 5k
      # requests per hour, allow 6k per hour but in two-minute increments of
      # 200 requests to allow fast recovery.
      #
      # Inserted after the session cookie store since it relies on
      # rack.session to operate.
      #
      # This request limiter was added specifically to help address
      # https://github.com/github/core-app/issues/192.
      GitHub::Limiters::CountByBrowserSession.new(limit: 300, ttl: 120),
      GitHub::Limiters::CountByBrowserSessionAbuse.new(name: "browser-session-abuse-count", limit: 10000, ttl: 120), # 10 000 per session per 2 minutes
      GitHub::Limiters::SearchCountAnonymousByIp.new(limit: 100, ttl: 3600), # 100 per hour per IP
      GitHub::Limiters::SearchCountAnonymousByIp.new(limit: 10,  ttl: 60),   # 10 per minute per IP
      GitHub::Limiters::SearchCountAnonymous.new(ttl: 60)                    # global limits

    # Disable rack-cache. We don't use machine-level page/response caching.
    config.action_dispatch.rack_cache = nil

    config.action_dispatch.default_headers.clear

    config.action_dispatch.use_authenticated_cookie_encryption = true
    config.action_dispatch.use_cookies_with_metadata = true
    config.active_support.use_authenticated_message_encryption = true

    config.active_support.hash_digest_class = OpenSSL::Digest::SHA256
    config.active_support.key_generator_hash_digest_class = OpenSSL::Digest::SHA256

    # We don't support old browsers that need this
    config.action_view.default_enforce_utf8 = false

    config.active_record.default_timezone = :local

    config.active_support.to_time_preserves_timezone = :zone

    # Set Time.zone default to the specified zone and make Active Record auto-convert to this zone.
    # Run "rake -D time" for a list of tasks for finding time zone names. Default is UTC.
    config.time_zone = "UTC"

    config.action_view.field_error_proc = proc do |html_tag, _instance|
      "<div class=\"field-with-errors\">#{html_tag}</div>".html_safe # rubocop:disable Rails/OutputSafety
    end

    # Use frozen_string_literal: true in all templates
    config.action_view.frozen_string_literal = true

    # Determines whether or not the `form_tag` and `button_to` helpers will produce HTML tags prepended with
    # HTML that guarantees their contents cannot be captured by any preceding unclosed tags.
    config.action_view.prepend_content_exfiltration_prevention = true

    # Configure the default encoding used in templates for Ruby 1.9.
    config.encoding = "utf-8"

    # Configure sensitive parameters which will be filtered from the log file.
    config.filter_parameters += GitHub.filtered_params
    config.filter_parameters << GitHub.filtered_params_proc

    if GitHub.enterprise?
      # enable external auth provider when configured
      GitHub.auth.add_middleware(config.middleware)
    end


    # Disable a deprecation warning that dumps to STDERR:
    I18n.enforce_available_locales = true

    # As of Rails 3.2, an accurate `tld_length` is required for `:subdomain`
    # routing conditions to work for domains with more than one `.`  (ex.
    # A.B.C.D.xip.io is used in GitHub Enterprise integration tests). Also, we
    # only set `tld_length` if `host_name` is set, since some enterprise rake
    # tasks load `config/application` before we have a valid host name.
    config.action_dispatch.tld_length = GitHub.host_name.count(".") if GitHub.host_name

    config.active_record.schema_format = :sql

    # Enterprise instances might be running behind a proxy so we disable checking
    # of the `Origin` header.
    config.action_controller.forgery_protection_origin_check = GitHub.origin_verification_enabled?

    # Enable per-form CSRF tokens.
    config.action_controller.per_form_csrf_tokens = true
    config.action_view.embed_authenticity_token_in_remote_forms = true

    config.generators do |g|
      # configure generators to use our preferred column type.  Here's an
      # example generator invocation that will use both features configured
      # below:
      #
      #   bin/rails generate migration CreateWidgets name:string user:belongs_to
      g.orm :active_record,  primary_key_type: %Q[bigint, unsigned: true, charset: "utf8mb4", collation: "utf8mb4_unicode_520_ci"],
                             foreign_key_type: "bigint, unsigned: true"
    end

    rake_tasks do
      # Extend ActiveRecord::Migration when loading rake tasks
      ActiveSupport.on_load(:active_record) do
        require "github/ghes/stats"
        ActiveRecord::Migration.include(GitHub::GHES::Stats)

        require "github/migration_extensions"
        ActiveRecord::Migration.include(GitHub::MigrationExtensions)
      end
    end

    config.telemetry.enable_rack_github_request_id = false

    def self.get_open_telemetry_graphql_options
      {
        # Prevent the tracer being injected to the base class, tracers are manually added at the app/platform/schema.rb level
        enabled: false,
        # Dont change to legacy tracing, we are using the new one
        legacy_tracing: false,
        enable_platform_field: !GitHub.shadow_lab? && GitHub.deploy_to_frontend_unicorn?,
        enable_platform_authorized: !GitHub.shadow_lab? && GitHub.deploy_to_frontend_unicorn?,
        enable_platform_resolve_type: !GitHub.shadow_lab? && GitHub.deploy_to_frontend_unicorn?,
      }
    end

    config.telemetry.instrumentation = {
      "OpenTelemetry::Instrumentation::GraphQL" => get_open_telemetry_graphql_options,
    }
    config.telemetry.statsd = ::GitHub.dogstats
    config.after_initialize do
      # The OTel SDK only supports well known HTTP methods that are checked by Faraday when creating HTTP requests.
      # This is a hack in place required to support our mutations of the faraday allowed HTTP methods added in initializers/http.rb
      ::OpenTelemetry::Instrumentation::Faraday::Middlewares::TracerMiddleware.extend(FaradayWithPurge)
    end
  end

end

require "primer/view_components"
