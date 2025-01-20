# frozen_string_literal: true

# Used by enterprise CI suite
# https://github.com/github/enterprise2/blob/dc0fa814f842b18cda3f96610c218e849be2db74/test/test-vulnerability-alerts.sh#L120
namespace :vulnerabilities_sync do
  task :run => :environment do
    gh_connect_dotcom_hostname = ENV.fetch("ENTERPRISE_DOTCOM_API_HOST_NAME", "")
    if !gh_connect_dotcom_hostname.blank?
      GitHub.logger.info(
        "Setting GitHub.dotcom_api_host_name to",
        "gh.security_alerts.sync.connect_dotcom_hostname": gh_connect_dotcom_hostname,
        "code.function": "vulnerabilities_sync:run",
      )
      GitHub.dotcom_api_host_name = gh_connect_dotcom_hostname
    end

    gh_connect_dotcom_protocol = ENV.fetch("ENTERPRISE_DOTCOM_HOST_PROTOCOL", "")
    if !gh_connect_dotcom_protocol.blank?
      GitHub.logger.info(
        "Setting GitHub.dotcom_host_protocol to",
        "gh.security_alerts.sync.gh_connect_dotcom_protocol": gh_connect_dotcom_protocol,
        "code.function": "vulnerabilities_sync:run",
      )
      GitHub.dotcom_host_protocol = gh_connect_dotcom_protocol
    end

    EnterpriseAdvisoryDatabaseSyncJob.perform_now
  end
end
