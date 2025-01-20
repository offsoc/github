# frozen_string_literal: true

namespace :enterprise do
  namespace :security_configurations do
    task on_boot: :environment do
      unless GitHub.enterprise?
        puts "This task can only be run in GitHub Enterprise environments!"
        return
      end

      EnterpriseUpdateSecurityConfigurationApplicationsJob.perform_now
      puts "Successfully ran Security Configuration on-boot jobs!"
    end
  end
end
