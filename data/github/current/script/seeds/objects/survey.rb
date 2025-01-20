# typed: true
# frozen_string_literal: true

# Do not require anything here. If you need something else, require it in the method that needs it.
# This makes sure the boot time of our seeds stays low.

module Seeds
  module Objects
    class Survey
      def self.rand_feature_slug
        adjectives = ::Repository::SuggestedName::ADJECTIVES
        nouns = ::Repository::SuggestedName::NOUNS
        "#{adjectives.sample}_#{nouns.sample}"
      end

      def self.feature_flag(slug)
        FlipperFeature.retry_on_find_or_create_error do
          FlipperFeature.find_by(name: slug) ||
            FlipperFeature.create(
              name: slug,
              tracking_issue_url: "https://github.com/github/github/issues/1",
              stale_at: 1.month.from_now,
            )
        end
      end

      def self.create_filled(title: nil, slug: nil, count: 1, user_count: 0)
        slug = rand_feature_slug if slug.nil?
        title = slug.titleize if title.nil?

        if user_count == 0
          user_count = ::User.count
        else
          # if user_count is not 0, then we want to create that many users but not more than the total number of users
          user_count = [user_count, ::User.count].min
        end

        flag = feature_flag(slug)

        survey = ::Survey.find_by(slug: slug)
        return survey if survey

        survey = ::Survey.new(title: title, slug: flag.name)
        survey.save!

        questions = []
        # question generation
        (1..count).each do |q|
          question = survey.questions.build(
            text: "Question ##{q}",
            short_text: "#{q}",
            display_order: q,
          )
          question.save!

          choice1 = question.choices.build(
            text: "test_answer1",
            short_text: "1"
          )
          choice1.save!

          choice2 = question.choices.build(
            text: "test_answer2",
            short_text: "2"
          )
          choice2.save!

          questions << question
        end

        # build answers
        (1..user_count).each do |u|
          questions.each do |question|
            rand_choice = rand(0..1)

            SurveyAnswer.create!({
              user_id: u,
              survey_id: survey.id,
              question_id: question.id,
              choice_id: question.choice_ids[rand_choice]
            })
          end
        end
        survey
      end

      def self.create(title: nil, slug: nil)
        slug = rand_feature_slug if slug.nil?
        title = slug.titleize if title.nil?

        survey = ::Survey.find_by(slug: slug)
        return survey if survey

        flag = feature_flag(slug)

        survey = ::Survey.new(title: title, slug: flag.name)
        survey.save!
        # Add optional questions

        # Each question should have at least one choice associated to it
        question = survey.questions.build(
          text: "What is your GitHub login?",
          short_text: "github_login",
          display_order: 1,
        )
        question.save!

        choice = question.choices.build(
          text: "GitHub login",
          short_text: "github_login",
        )
        choice.save!

        multiple_choice_question = survey.questions.build(
          text: "Do you prefer coffee or tea?",
          short_text: "coffee_or_tea",
          display_order: 2,
        )
        multiple_choice_question.save!

        choice = multiple_choice_question.choices.build(
          text: "Coffee please",
          short_text: "coffee",
          display_order: 1,
        )
        choice.save!

        choice = multiple_choice_question.choices.build(
          text: "Mmm tea",
          short_text: "tea",
          display_order: 2,
        )
        choice.save!
        survey
      end
    end
  end
end
