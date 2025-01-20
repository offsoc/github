# typed: true
# frozen_string_literal: true

# Do not require anything here. If you need something else, require it in the method that needs it.
# This makes sure the boot time of our seeds stays low.

module Seeds
  module Objects
    class Team
      extend T::Sig

      sig { params(org: ::Organization, name: String, parent_team: T.nilable(::Team), description: String, privacy: T.any(String, Symbol, Integer)).returns(T.nilable(::Team)) }
      def self.create!(org:, name: "#{Faker::Team.name.parameterize}-#{T.must(::Team.last&.id) + 1}", parent_team: nil, description: Faker::Lorem.sentence, privacy: :closed)
        team = ::Team.find_by(name: name, organization: org) || ::Team.new(name: name, organization: org)
        team.organization = org
        team.parent_team = parent_team if parent_team
        team.name = name
        team.description = description
        team.privacy = privacy
        team.save!
        team
      end
    end
  end
end
