# frozen_string_literal: true

namespace :enterprise do
  namespace :security_center do
    # Update security center statuses
    task :recalculate_statuses => :environment do
      if GitHub.enterprise?
        SecurityCenter::BusinessReconciliationJob.perform_later(business_id: GitHub.global_business.id)
      end
    end
    # Run maintenance tasks for security overview analytics warehouse
    # This can be run manually or from github/enterprise2 GHES after upgrade
    task :analytics_maintenance => :environment do
      if GitHub.enterprise?
        # Perform calendar population job synchronously to avoid potential racing conditions.
        # `soa_dates` data is required when query any data that gets populated on the other SOA revision tables.
        SecurityOverviewAnalytics::Helpers.calendar_population_job_class.perform_now
        SecurityOverviewAnalytics::Helpers.initialization_business_job_class.perform_later(business_id: GitHub.global_business.id, type: "organizations")
        SecurityOverviewAnalytics::Helpers.initialization_business_job_class.perform_later(business_id: GitHub.global_business.id, type: "users")
        SecurityOverviewAnalytics::FanoutScheduler.initialize_for(GitHub.global_business)
      end
    end
  end
end
