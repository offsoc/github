# frozen_string_literal: true

# Do not require anything here. If you need something else, require it in the method that needs it.
# This makes sure the boot time of our seeds stays low.

module Seeds
  module Objects
    class ReminderSlackWorkspace
      def self.create!(remindable:, name: "Fake: #{Faker::Company.name}", slack_id: ::ReminderSlackWorkspace.maximum(:id).to_i.next, users: [])
        workspace = ::ReminderSlackWorkspace.create_or_update_workspace(
          name: name,
          remindable: remindable,
          slack_id: slack_id
        )
        if workspace.nil? || !workspace.persisted?
          raise Seeds::Objects::CreateFailed, "Workspace failed to create: #{workspace&.errors&.full_messages&.to_sentence}"
        end

        users.each do |user|
          ReminderSlackWorkspaceMembership.create_or_update_membership(
            user_id: user.id,
            reminder_slack_workspace_id: workspace.id,
          )
        end

        workspace
      end
    end
  end
end
