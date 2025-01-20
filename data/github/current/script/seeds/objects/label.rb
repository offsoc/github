# typed: true
# frozen_string_literal: true

# Do not require anything here. If you need something else, require it in the method that needs it.
# This makes sure the boot time of our seeds stays low.

module Seeds
  module Objects
    class Label
      def self.create(repo: Seeds::Objects::Repository.hub_repo, name: "My Label", color: "000000", description: "An arbitrary label")
        label = ::Label.create(repository: repo, name:, color:, description:)
        raise Objects::CreateFailed, label.errors.full_messages.to_sentence unless label.valid?
        label
      end
    end
  end
end
