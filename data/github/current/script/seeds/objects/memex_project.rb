# frozen_string_literal: true

# Do not require anything here. If you need something else, require it in the method that needs it.
# This makes sure the boot time of our seeds stays low.

module Seeds
  module Objects
    class MemexProject
      def self.create(
        owner: Seeds::Objects::Organization.github,
        creator: Seeds::Objects::User.monalisa,
        title: Faker::Lorem.sentence(word_count: 3, supplemental: false, random_words_to_add: 4),
        public: false
      )

        memex_project = ::MemexProject.create_with_associations(
          owner: owner,
          creator: creator,
          title: title,
          public: public
        )

        raise Objects::CreateFailed, memex_project.errors.full_messages.to_sentence unless memex_project.valid?
        memex_project
      end
    end
  end
end
