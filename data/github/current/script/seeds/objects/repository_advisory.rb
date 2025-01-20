# frozen_string_literal: true

# Do not require anything here. If you need something else, require it in the method that needs it.
# This makes sure the boot time of our seeds stays low.

module Seeds
  module Objects
    class RepositoryAdvisory
      def self.create(user:, repo:, title: " #{Faker::Lorem.sentence}", body: " #{Faker::Lorem.sentence}")
        ::RepositoryAdvisory.create!({
          repository: repo,
          author: user,
          body: body,
          description: body,
          title: title,
          severity: :moderate,
        })
      end
    end
  end
end
