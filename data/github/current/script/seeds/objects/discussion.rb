# frozen_string_literal: true

# Do not require anything here. If you need something else, require it in the method that needs it.
# This makes sure the boot time of our seeds stays low.

module Seeds
  module Objects
    class Discussion
      def self.create(user:, repo:, title: " #{Faker::Lorem.sentence}", body: " #{Faker::Lorem.sentence}")
        discussion = ::Discussion.create!(
          repository: repo,
          user: user,
          title: title,
          body: body,
          category: repo.discussion_categories.last
        )
      end
    end
  end
end
