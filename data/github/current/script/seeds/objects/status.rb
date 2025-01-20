# typed: true
# frozen_string_literal: true

# Do not require anything here. If you need something else, require it in the method that needs it.
# This makes sure the boot time of our seeds stays low.

module Seeds
  module Objects
    class Status
      def self.create(sha:, repo:, state: nil, creator: nil, context: nil)
        creator ||= repo.owner
        # expected state is not allowed
        state ||= (::Status::States - [::Status::EXPECTED]).sample

        status_attrs = {
          sha: sha,
          repository: repo,
          creator: creator,
          state: state,
          description: Faker::TvShows::Simpsons.quote[0, 140],
          target_url: "http://example.com",
        }

        if context
          status_attrs[:context] = context
        end

        status = ::Status.create!(status_attrs)

        status
      end
    end
  end
end
