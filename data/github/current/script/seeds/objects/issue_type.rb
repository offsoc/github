# frozen_string_literal: true

# Do not require anything here. If you need something else, require it in the method that needs it.
# This makes sure the boot time of our seeds stays low.

module Seeds
  module Objects
    class IssueType
      def self.create(owner: Seeds::Objects::Organization.github, name:, description:, color:)
        issue_type = owner.issue_types.create_with(description:, color:).find_or_create_by(name:)
        raise Objects::CreateFailed, issue_type.errors.full_messages.to_sentence unless issue_type.valid?
        issue_type
      end
    end
  end
end
