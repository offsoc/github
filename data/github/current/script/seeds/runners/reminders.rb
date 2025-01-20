# frozen_string_literal: true

require_relative "../runner"
# Do not require anything else here. If you need something for your runner, put that in `self.run`.
# This makes sure the boot time of our seeds stays low.

module Seeds
  class Runner
    class Reminders < Seeds::Runner
      def self.help
        <<~EOF
        Seed reminders for local development

        Seeding
        - Enables the feature flag
        - Ensures github org exists
        - Adds a Fake Slack Workspace
        - Adds a reminder to the github org
        - Adds a personal reminder to monalisa
        EOF
      end

      def self.run(options = {})
        Seeds::Objects::FeatureFlag.toggle(action: "enable", feature_flag: "scheduled_reminders")

        mona = Seeds::Objects::User.monalisa
        hub_repo = Seeds::Objects::Repository.hub_repo
        org = Seeds::Objects::Organization.github(admin: mona)

        workspace = Seeds::Objects::ReminderSlackWorkspace.create!(remindable: org, users: [mona])
        puts "Created fake workspace #{workspace.name}"

        Seeds::Objects::Reminder.create!(remindable: org, slack_workspace: workspace, repos: [hub_repo], user: org.admin)
        puts "Created reminder on github org for workspace #{workspace.name}"

        if ::PersonalReminder.exists?(user: mona, remindable: org)
          puts "Personal reminder already existed for #{mona.login} on #{org}, did not create a new one"
        else
          Seeds::Objects::PersonalReminder.create!(user: mona, remindable: org, slack_workspace: workspace)
          puts "Created personal reminder for user #{mona.login} on workspace #{workspace.name}"
        end
      end
    end
  end
end
