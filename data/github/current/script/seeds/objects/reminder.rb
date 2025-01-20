# frozen_string_literal: true

# Do not require anything here. If you need something else, require it in the method that needs it.
# This makes sure the boot time of our seeds stays low.

module Seeds
  module Objects
    class Reminder
      def self.create!(
        remindable:,
        user:,
        slack_channel: Faker::Company.name.downcase.gsub(/[^a-z]+/, "-")[0..79],
        slack_workspace: nil,
        time_zone_name: "Pacific Time (US & Canada)",
        teams: nil,
        days: ::ReminderDeliveryTime::WEEKDAYS.keys,
        repos: [],
        times: ["9:00 AM"],
        params: {}
        )
        slack_workspace ||= Seeds::Objects::ReminderSlackWorkspace.create!(remindable: remindable)
        reminder = ::Reminder.find_by(remindable: remindable, slack_workspace: slack_workspace, user: user) || \
                   ::Reminder.new(remindable: remindable, slack_workspace: slack_workspace, user: user)
        unless remindable.is_a?(::Organization)
          raise Seeds::Objects::ObjectError, "Remindable must be an Organization. Support for other objects has not been added"
        end

        teams ||= [Seeds::Objects::Team.create!(org: remindable, name: Faker::Company.name)]

        reminder.teams = teams
        reminder.slack_channel = slack_channel
        reminder.time_zone_name = time_zone_name
        reminder.delivery_times_attributes = days.product(times).map { |day, time| { "day" => day, "time" => time } }
        reminder.tracked_repository_ids = repos.map(&:id)
        reminder.assign_attributes(params)

        if reminder.integration_installation.nil?
          slack_integration = Seeds::Objects::Integration.create_slack_integration
          slack_installation = Seeds::Objects::Integration.install(
            integration: slack_integration,
            repo: repos,
            installer: reminder.remindable.admin,
            target: reminder.remindable
          )
        end

        if repos.empty? && reminder.accessible_repository_ids && reminder.accessible_repository_ids.empty?
          # At this point, we have an installation but the teams (perhaps) are preventing access to repos, so make one
          repos << Seeds::Objects::Repository.create(owner_name: reminder.remindable.login, setup_master: true)
        end

        teams.each do |team|
          repos.each do |repo|
            team.add_repository(repo, :pull)
          end
        end

        reminder.save!

        unless reminder.persisted?
          raise Seeds::Objects::CreateFailed, "Reminder failed to create: #{reminder.errors.full_messages.to_sentence}"
        end
        reminder
      end
    end
  end
end
