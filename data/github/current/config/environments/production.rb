# typed: true
# frozen_string_literal: true

GitHub::Application.configure do
  # Settings specified here will take precedence over those in config/environment.rb
  #
  #  #########################################################
  #  #                                                     ##
  #  #   !!!!!!    DO NOT PUT SECRETS IN HERE    !!!!!!    ##
  #  #                                                     ##
  #  #     see docs/enterprise.md for more info.           ##
  #  #                                                     ##
  #  ########################################################
  #
  #
  T.bind(self, GitHub::Application)

  config.cache_classes = true
  config.eager_load = true

  config.consider_all_requests_local = false
  config.action_controller.perform_caching             = true
  config.action_mailer.raise_delivery_errors           = false
  config.action_mailer.delivery_method                 = :smtp
  config.serve_static_files                            = false

  # Raise in dev and test but log in production for strict loading violations
  config.active_record.action_on_strict_loading_violation = :log

  # Set the password computation costs to a reasonable setting
  GitHub.bcrypt_password_cost = 8
  GitHub.pbkdf2_iterations = 200_000
  GitHub.argon2_time_cost = 3
  GitHub.argon2_memory_cost = 14

  # Ensure default user password is not set
  GitHub.default_password = nil

  # Enable locale fallbacks for I18n (makes lookups for any locale fall back to
  # the I18n.default_locale when a translation can not be found)
  config.i18n.fallbacks = true

  # Emit ActiveSupport::Notification for deprecation warnings
  config.active_support.deprecation = :notify

  config.action_controller.action_on_unpermitted_parameters = :log

  # Number of voting replicas in production and staging-lab (except on
  # GHES where this is controlled by an environment variable.)
  #
  # N.B. In production the actual replication level is determined
  # by policies in spokesd, but this expected number of replicas
  # puts a floor of (dgit_copies/2)+1 on the quorum size for writes.
  if !GitHub.enterprise?
    GitHub.dgit_default_copies = 5
    GitHub.dgit_read_heavy_copies = 7
  end

  if GitHub.admin_host?
    # Render template filenames as comments in HTML
    config.action_view.annotate_rendered_view_with_filenames = true
  end

  GitHub.openapi_release = GitHub.enterprise? ? GitHub.enterprise_openapi_release : GitHub.default_openapi_release
  GitHub.openapi_merge_ghec_operations = GitHub.runtime.dotcom? ? true : false

  GitHub.codespaces_storage_accounts = {
    resource_group: "github-codespaces-storage-accounts",
    subscription: "b1b4499a-ba38-45d4-aec8-98f1cd1ef217",
    url_pattern: "https://%{account_name}.queue.core.windows.net"
  }

  # Gracefully handles, reports ActionController::UnknownHttpMethod exceptions
  add_github_middleware GitHub::Middleware::UnknownHttpMethod

  # Do not dump schema after migrations.
  config.active_record.dump_schema_after_migration = false

  GitRPC.max_request_size = 40 * 1024 * 1024 # 40 MiB
end
