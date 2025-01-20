# frozen_string_literal: true

namespace :enterprise do
  namespace :memex_automation do
    # Create the Memex Automation internal app on an instance of GitHub running inside GHES.
    task :create => :environment do
      return unless GitHub.enterprise?

      Apps::Internal::MemexAutomation.seed_database!
    end
  end
end
