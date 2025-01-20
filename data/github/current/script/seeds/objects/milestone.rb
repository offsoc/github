# typed: true
# frozen_string_literal: true

# Do not require anything here. If you need something else, require it in the method that needs it.
# This makes sure the boot time of our seeds stays low.

module Seeds
  module Objects
    class Milestone
      def self.create(
        created_by: Seeds::Objects::User.monalisa,
        repository: Seeds::Objects::Repository.hub_repo,
        title: Faker::Lorem.sentence(word_count: 3, supplemental: false, random_words_to_add: 4),
        description: Faker::Lorem.paragraph(sentence_count: 2, supplemental: false, random_sentences_to_add: 4),
        due_on: Faker::Date.forward(days: 365),
        state: %w[open closed].sample
      )

        milestone = ::Milestone.create(created_by:, repository:, title:, description:, due_on:, state:)
        raise Objects::CreateFailed, milestone.errors.full_messages.to_sentence unless milestone.valid?
        milestone
      end
    end
  end
end
