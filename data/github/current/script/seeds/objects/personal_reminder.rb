# frozen_string_literal: true

# Do not require anything here. If you need something else, require it in the method that needs it.
# This makes sure the boot time of our seeds stays low.

module Seeds
  module Objects
    class PersonalReminder
      def self.create!(
      user:,
      remindable:,
      slack_workspace: nil,
      time_zone_name: "Pacific Time (US & Canada)",
      days: ::ReminderDeliveryTime::WEEKDAYS.keys,
      times: ["9:00 AM"],
      params: {}
    )

        slack_workspace ||= Seeds::Objects::ReminderSlackWorkspace.create!(remindable: remindable)
        ReminderSlackWorkspaceMembership.create_or_update_membership(
          user_id: user.id,
          reminder_slack_workspace_id: slack_workspace.id
        )

        if (reminder = ::PersonalReminder.find_by(user: user, remindable: remindable)).present?
          if reminder.slack_workspace != slack_workspace
            raise Objects::CreateFailed, "Personal Reminder already exists for #{user.login} for #{remindable}, but not using the same Slack Workspace"
          end
        end

        reminder = ::PersonalReminder.find_by(user: user, remindable: remindable, slack_workspace: slack_workspace) || \
                   ::PersonalReminder.new(user: user, remindable: remindable, slack_workspace: slack_workspace)

        unless remindable.is_a?(::Organization)
          raise Seeds::Objects::ObjectError, "Remindable must be an Organization. Support for other objects has not been added"
        end

        reminder.time_zone_name = time_zone_name
        reminder.delivery_times_attributes = days.product(times).map { |day, time| { "day" => day, "time" => time } }
        reminder.assign_attributes(params)
        reminder.save!

        unless reminder.persisted?
          raise Seeds::Objects::CreateFailed, "Reminder failed to create: #{reminder.errors.full_messages.to_sentence}"
        end

        reminder
      end
    end
  end
end
