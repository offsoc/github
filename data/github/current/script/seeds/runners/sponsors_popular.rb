# typed: strict
# frozen_string_literal: true

require_relative "../runner"
# Do not require anything else here. If you need something for your runner, put that in `self.run`.
# This makes sure the boot time of our seeds stays low.

module Seeds
  class Runner
    class SponsorsPopular < Seeds::Runner
      extend T::Sig

      sig { returns String }
      def self.help
        <<~EOF
        Seed a sponsorable with many active & inactive sponsorships.

        - Creates sponsorable user "popular-user"
        - Creates many active sponsorships for "popular-user"
        - Creates many past sponsorships for "popular-user"
        - Creates many blocked sponsorships for "popular-user"
        EOF
      end

      sig { params(options: T::Hash[T.any(String, Symbol), T.untyped]).void }
      def self.run(options = {})
        require_relative "../factory_bot_loader"

        new.run(options)
      end

      sig { params(options: T::Hash[T.any(String, Symbol), T.untyped]).void }
      def run(options)
        create_all(options)
      end

      private

      sig { params(options: T::Hash[T.any(String, Symbol), T.untyped]).void }
      def create_all(options = {})
        create_sponsorable_user

        active_sponsorship_count = options[:active_sponsorships] || 65
        create_active_sponsorships(active_sponsorship_count)

        inactive_sponsorship_count = options[:past_sponsorships] || 90
        create_past_sponsorships(inactive_sponsorship_count)

        blocked_sponsorship_count = options[:blocked_sponsorships] || 7
        create_blocked_sponsorships(blocked_sponsorship_count)

        create_popular_user_profile
        create_user_metadata
      end

      sig { void }
      def create_sponsorable_user
        listing_args = [:approved, :with_tiers, :with_one_time_tiers]
        listing_options = { sponsorable_login: "popular-user" }
        sponsorable = popular_sponsorable
        unless sponsorable
          puts "Creating sponsorable user #{listing_options[:sponsorable_login]}"
          sponsorable = FactoryBot.create(:sponsors_listing, *listing_args, **listing_options).sponsorable
        end

        listing = sponsorable.reload_sponsors_listing
        existing_tiers = listing.published_sponsors_tiers.to_a

        if existing_tiers.select(&:recurring?).empty?
          tier1, tier2 = FactoryBot.create_pair(:sponsors_tier, :published, sponsors_listing: listing)
          puts "Created #{tier1.name}, #{tier2.name} tiers for @#{sponsorable}"
        end

        if existing_tiers.select(&:one_time?).empty?
          tier1, tier2 = FactoryBot.create_pair(:sponsors_tier, :published, :one_time, sponsors_listing: listing)
          puts "Created #{tier1.name}, #{tier2.name} tiers for @#{sponsorable}"
        end

        # Make sure the sponsorable has a payment method so we can create sponsorships from them as well:
        sponsorable.update!(billing_type: "card") unless sponsorable.billing_type == "card"
        FactoryBot.create(:credit_card_customer_account, user: sponsorable) unless sponsorable.reload_customer_account
        FactoryBot.create(:billing_plan_subscription, user: sponsorable) unless sponsorable.reload_plan_subscription

        sponsorable.sponsorships_as_sponsorable.destroy_all
      end

      sig { returns T.nilable(GitHubSponsors::Types::Sponsorable) }
      def popular_sponsorable
        @popular_sponsorable ||= T.let(User.find_by(login: "popular-user"),
          T.nilable(GitHubSponsors::Types::Sponsorable))
      end

      sig { params(count: Integer).void }
      def create_active_sponsorships(count)
        puts "------------"
        puts "Creating active sponsorships"
        count.times do |i|
          FactoryBot.create(:sponsorship, sponsorable: popular_sponsorable)
          log_sponsorships_created(count: i + 1, total: count, type: "active")
        end
      end

      sig { params(count: Integer).void }
      def create_past_sponsorships(count)
        puts "------------"
        puts "Creating past sponsorships"
        count.times do |i|
          FactoryBot.create(:sponsorship, :inactive, sponsorable: popular_sponsorable)
          log_sponsorships_created(count: i + 1, total: count, type: "past")
        end
      end

      sig { params(count: Integer).void }
      def create_blocked_sponsorships(count)
        puts "------------"
        puts "Creating blocked sponsorships"
        user_or_org = popular_sponsorable
        raise "No popular sponsorable exists to block sponsors" unless user_or_org
        count.times do |i|
          sponsorship = FactoryBot.create(:sponsorship, :inactive, sponsorable: user_or_org)
          user_or_org.block(sponsorship.sponsor)
          log_sponsorships_created(count: i + 1, total: count, type: "blocked")
        end
      end

      sig { params(count: Integer, total: Integer, type: T.any(String, Symbol)).void }
      def log_sponsorships_created(count:, total:, type:)
        puts "Created #{count} of #{total} #{type} sponsorships" if count % 10 == 0 || count == total
      end

      sig { returns Profile }
      def create_popular_user_profile
        user_or_org = popular_sponsorable
        raise "No popular sponsorable exists to create a profile for" unless user_or_org
        create_user_profile(user_or_org, name: Faker::Fantasy::Tolkien.character,
          bio: Faker::Fantasy::Tolkien.poem,
          twitter_username: "twitterUsername",)
      end

      sig do
        params(
          user: GitHubSponsors::Types::Sponsorable,
          name: T.nilable(String),
          bio: T.nilable(String),
          twitter_username: T.nilable(String),
          company: T.nilable(String),
          blog: T.nilable(String),
          location: T.nilable(String)
        ).returns(Profile)
      end
      def create_user_profile(user, name: nil, bio: nil, twitter_username: nil, company: nil, blog: nil, location: nil)
        profile = user.profile

        unless profile
          puts "Creating profile for #{user}"
          profile = FactoryBot.create(:profile, user: user, name: name, bio: bio, twitter_username: twitter_username,
            location: location)
        end

        profile.assign_attributes(
          name: name,
          bio: bio,
          company: company,
          blog: blog,
          twitter_username: twitter_username,
          location: location,
        )
        profile.save! if profile.changed?

        profile
      end

      sig { void }
      def create_user_metadata
        user = popular_sponsorable
        raise "No popular sponsorable exists to create user metadata" unless user

        user_metadata = user.user_metadata
        repository_count = user.public_repositories.count
        repository_public_and_private_count = user.repositories.count
        sponsoring_count = user.public_sponsoring_count

        unless user_metadata
          puts "Creating user metadata record for #{user}"
          user_metadata = FactoryBot.create(:user_metadata, user: user, repository_count: repository_count,
            repository_public_and_private_count: repository_public_and_private_count,
            sponsoring_count: sponsoring_count)
        end

        metadata_updates = {}
        unless user_metadata.sponsoring_count == sponsoring_count
          metadata_updates[:sponsoring_count] = sponsoring_count
        end
        unless user_metadata.repository_count == repository_count
          metadata_updates[:repository_count] = repository_count
        end
        unless user_metadata.repository_public_and_private_count == repository_public_and_private_count
          metadata_updates[:repository_public_and_private_count] = repository_public_and_private_count
        end

        if metadata_updates.any?
          puts "Updating user metadata record for #{user}"
          user_metadata.update!(metadata_updates)
        end
      end
    end
  end
end
