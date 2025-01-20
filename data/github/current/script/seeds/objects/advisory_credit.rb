# frozen_string_literal: true

# Do not require anything here. If you need something else, require it in the method that needs it.
# This makes sure the boot time of our seeds stays low.

module Seeds
  module Objects
    class AdvisoryCredit
      def self.create(recipient:, creator:, repository_advisory:)
        ::AdvisoryCredit.create!({
          recipient: recipient,
          creator: creator,
          repository_advisory: repository_advisory,
        })
      end
    end
  end
end
