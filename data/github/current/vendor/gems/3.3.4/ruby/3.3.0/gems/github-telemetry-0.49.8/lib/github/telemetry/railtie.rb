# frozen_string_literal: true

module GitHub
  module Telemetry
    # Provides a Railtie to ease OpenTelemetry configuration in Rails environments. Configuration should be
    # done under `Rails.appplication.config.telemetry`.
    #
    # Accepted configuration options:
    #
    # - `config.telemetry.logger` allows you to pass a custom Logger-compatible class, which will be used for the OpenTelemetry logger. Defaults to `Rails.logger`.
    # - `config.telemetry.exporter` allows you to set a custom exporter. If not set, then:
    #   - In the Rails console, a {https://open-telemetry.github.io/opentelemetry-ruby/opentelemetry-sdk/latest/OpenTelemetry/SDK/Trace/Export/InMemorySpanExporter.html InMemorySpanExporter} will be used.
    #   - In development, our {GitHub::Telemetry::Traces::Export::LogSpanExporter LogSpanExporter} will be used.
    #   - In test, an {https://open-telemetry.github.io/opentelemetry-ruby/opentelemetry-sdk/latest/OpenTelemetry/SDK/Trace/Export/InMemorySpanExporter.html InMemorySpanExporter} will be used.
    #   - In all other environments, the {GitHub::Telemetry} defaults will be used.
    # - `config.telemetry.instrumentation` allows you to select which of the registered {https://github.com/open-telemetry/opentelemetry-ruby/tree/main/instrumentation instrumentation libraries}
    #   will be used. Accepts an array of instrumentation class names, or a hash of instrumentation class names to configuration options. Rack and Rails instrumentation will always be added for you.
    #
    # @note No configuration is required, by default (if you have an OpenTelemetry collector running on `localhost`). This railtie will be automatically
    #   detected and loaded by Bundler when running as part of Rails. The following is provided for more advanced configuration needs!
    #
    # @note By default, if you have included the Mysql2 instrumentation, we enforce SQL obfuscation in the Rails production env.. You may pass an option to the instrumentation to disable it, if you must.
    # @note By default, if you have included the ActiveJob instrumentation, we configure the span_name option and force_flush options for you. You may override if needed.
    #
    # @example Configuring a list of custom instrumentation:
    #
    #   module MyRailsApp
    #     class Application < Rails::Application
    #       config.telemetry.instrumentation = {
    #         'OpenTelemetry::Instrumentation::Mysql2' => {
    #           # relevant options go here
    #         },
    #         # pass an empty hash if there are no options to configure, or you don't need to configure anything.
    #         'OpenTelemetry::Instrumentation::Redis' => {},
    #       }
    #     end
    #   end
    #
    # @example Overriding a logger
    #   module MyRailsApp
    #     class Application < Rails::Application
    #       config.telemetry.logger = SemanticLogger[MyRailsApp] # `Rails.logger` would have been used, by default.
    #     end
    #   end
    class Railtie < Rails::Railtie
      railtie_name :github_telemetry

      def self.reset_telemetry_config
        config.telemetry = GitHub::Telemetry::Config.new
      end

      reset_telemetry_config

      initializer "github-telemetry.configure", before: :initialize_logger, group: :all do |app|
        if config.telemetry.logger.nil?
          ENV[GitHub::Telemetry::Logs::LEVEL] ||= "info"
          ENV[GitHub::Telemetry::Logs::LIB_LEVEL] ||= Rails.env.production? ? "fatal" : "debug"
          ENV[GitHub::Telemetry::Logs::LOG_TO_STDOUT] ||= Rails.env.production?.to_s
          ENV[GitHub::Telemetry::Logs::LOG_TO_FILE] ||= (!Rails.env.production?).to_s

          if app.config.respond_to?(:rails_semantic_logger)
            # Rails::SemanticLogger gem is installed and we have to override the defaults
            app.config.log_level = ENV.fetch(::GitHub::Telemetry::Logs::LIB_LEVEL).to_sym

            # Suppresses STDERR logger in Rails console
            app.config.rails_semantic_logger.console_logger = false

            # Sets up logging subscribers for Rails framework to use semantic log keys
            app.config.rails_semantic_logger.semantic = true
            app.config.rails_semantic_logger.started = false
            app.config.rails_semantic_logger.rendered = false

            # Disables the default log appender you would usually find in`logs/${RAILS_ENV}.log`
            # Enabling this value causes an error that disables the logfmt logger in development mode
            # It is manually set below:
            app.config.rails_semantic_logger.add_file_appender = false
          end

          # OTel SDK Spec defines rules for how to set the log levels, so we are using a separate ENV variable to conform to the spec
          # https://opentelemetry.io/docs/reference/specification/sdk-environment-variables/#general-sdk-configuration
          config.telemetry.logger = ::GitHub::Telemetry::Logs.lib_logger(OpenTelemetry).tap { |l| l.level = ENV.fetch("OTEL_LOG_LEVEL", "fatal") }

          GitHub::Telemetry::Logs.enable
          if ENV.fetch(GitHub::Telemetry::Logs::LOG_TO_FILE) == "true"
            GitHub::Telemetry::Logs.add_file_appender(
              app.config.default_log_file.path,
              app.config.colorize_logging ? :color : :default
            )
          end
        end

        GitHub::Telemetry.configure(config.telemetry)
      end

      initializer "github-telemetry.configure.rack", after: "github-telemetry.configure", before: :build_middleware_stack do |app|
        # Auto install the rack middleware and configure action_dispatch to user our request-id unless explicitly disabled
        if config.telemetry.enable_rack_github_request_id? && defined?(OpenTelemetry::Instrumentation::Rack::Instrumentation) && OpenTelemetry::Instrumentation::Rack::Instrumentation.instance.installed?
          # Install our middleware as the first one so that everything is wrapped in our OpenTelemetry::Context
          app.middleware.use(GitHub::Telemetry::Rack::RequestId)
          app.middleware.delete(ActionDispatch::RequestId)
        end
      end

      initializer "github-telemetry.active_job.logger", after: "github-telemetry.configure" do |app|
        if app.config.respond_to?(:rails_semantic_logger) && app.config.respond_to?(:active_job)
          app.config.active_job.log_arguments = false
        end

        if config.telemetry.logs.active_job.enabled?
          require_relative "logs/active_job"

          ActiveSupport.on_load(:active_job) do
            include GitHub::Telemetry::Logs::Loggable
          end

          app.config.after_initialize do
            GitHub::Telemetry::Logs::ActiveJob::Subscriber.install(config.telemetry.logs.active_job)
          end
        end
      end

      # Ensures log appender i/o devices are reopened after forking
      initializer "github-telemetry.process.forking", after: "github-telemetry.configure" do |_app|
        if defined?(ActiveSupport::ForkTracker)
          ActiveSupport::ForkTracker.after_fork do
            GitHub::Telemetry::Logs.reopen
            config&.telemetry&.statsd&.increment("gh.telemetry.logs.reopened")
          end
        end
      end
    end
  end
end
