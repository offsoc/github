# frozen_string_literal: true

# Do not require anything here. If you need something else, require it in the method that needs it.
# This makes sure the boot time of our seeds stays low.

module Seeds
  module Objects
    class DiscussionPost
      def self.create(user:, team:, title: " #{Faker::Lorem.sentence}", body: " #{Faker::Lorem.sentence}")
        ::DiscussionPost.create!(user: user, team: team, title: title, body: body)
      end
    end
  end
end
