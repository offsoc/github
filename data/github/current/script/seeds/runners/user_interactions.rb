# frozen_string_literal: true

require_relative "../runner"
# Do not require anything else here. If you need something for your runner, put that in `self.run`.
# This makes sure the boot time of our seeds stays low.

module Seeds
  class Runner
    class UserInteractions < Seeds::Runner
      def self.help
        <<~HELP
        Seeds some user blocks and follows.
        HELP
      end

      def self.run(options = {})
        require_relative "../factory_bot_loader"

        new.run(options)
      end

      def run(options)
        create_users
        create_profiles
        create_orgs
        block_users
        follow_users
        puts "\nFinished seeding user interactions!"
      end

      private

      def create_users
        puts "Seeding users"
        annoying_user
        annoying_and_annoyed_user
        innocent_user
        fan_user
      end

      def create_profiles
        puts "Seeding user profiles"
        ensure_user_profile(user: celebrity_user, name: "Celeb User")
        ensure_user_profile(user: monalisa, name: "Mona Lisa Octocat")
        ensure_user_profile(user: fan_user, name: "#1 Fan")
        ensure_user_profile(user: innocent_user, name: "Hello World")
        ensure_user_profile(user: annoying_user, name: "Let me help you with your car's extended warranty")
      end

      def create_orgs
        puts "\nSeeding organizations"
        some_org
      end

      def block_users
        puts "\nSeeding blocks between users"
        ensure_user_block(blocker: innocent_user, blockee: annoying_user)
        ensure_user_block(blocker: innocent_user, blockee: annoying_and_annoyed_user)
        ensure_user_block(blocker: annoying_and_annoyed_user, blockee: annoying_user)
        ensure_user_block(blocker: some_org, blockee: annoying_user)
        ensure_user_block(blocker: some_org, blockee: annoying_and_annoyed_user)
        ensure_user_block(blocker: monalisa, blockee: annoying_user)
        ensure_user_block(blocker: monalisa, blockee: annoying_and_annoyed_user)
      end

      def follow_users
        puts "\nSeeding follows between users"
        ensure_user_follow(follower: fan_user, followee: celebrity_user)
        ensure_user_follow(follower: fan_user, followee: innocent_user)
        ensure_user_follow(follower: fan_user, followee: monalisa)
        ensure_user_follow(follower: innocent_user, followee: celebrity_user)
        ensure_user_follow(follower: monalisa, followee: celebrity_user)
        ensure_user_follow(follower: annoying_and_annoyed_user, followee: celebrity_user)

        update_user_profile_metadata(celebrity_user)
        update_user_profile_metadata(fan_user)
        update_user_profile_metadata(innocent_user)
        update_user_profile_metadata(monalisa)
      end

      def monalisa
        @monalisa ||= Seeds::Objects::User.monalisa
      end

      def annoying_user
        @annoying_user ||= ensure_user_exists(login: "annoying-user")
      end

      def annoying_and_annoyed_user
        @annoying_and_annoyed_user ||= ensure_user_exists(login: "annoyingAndAnnoyedUser")
      end

      def innocent_user
        @innocent_user ||= ensure_user_exists(login: "innocent-user")
      end

      def fan_user
        @fan_user ||= ensure_user_exists(login: "NumberOneFan")
      end

      def celebrity_user
        @celebrity_user ||= ensure_user_exists(login: "celebrity-user")
      end

      def some_org
        @some_org ||= ensure_user_exists(login: "some-org", factory: :organization)
      end

      def ensure_user_block(blocker:, blockee:)
        unless blocker.blocking?(blockee)
          puts "Blocking #{blockee} as #{blocker}"
          blocker.block(blockee)
        end
      end

      def ensure_user_follow(follower:, followee:)
        unless followee.followed_by?(follower)
          puts "Following #{followee} as #{follower}"
          follower.follow(followee)
        end
      end

      def ensure_user_exists(login:, factory: :user)
        user = User.find_by(login: login)
        unless user
          puts "Creating #{login}"
          user = FactoryBot.create(factory, login: login)
        end
        user
      end

      def ensure_user_profile(user:, name:)
        profile = user.reload_profile
        unless profile
          puts "Creating profile for #{user}"
          profile = FactoryBot.create(:profile, user: user, name: name)
        end
        unless profile.name == name
          puts "Setting #{user}'s profile name to #{name}"
          profile.update!(name: name)
        end
        profile
      end

      def update_user_profile_metadata(user)
        user_metadata = user.reload_user_metadata

        followers_count = user.followers_count!
        following_count = user.following_count!

        unless user_metadata
          puts "Creating user metadata record for #{user}"
          user_metadata = FactoryBot.create(:user_metadata, user: user, followers_count: followers_count,
            following_count: following_count)
        end

        metadata_updates = {}
        metadata_updates[:followers_count] = followers_count unless user_metadata.followers_count == followers_count
        metadata_updates[:following_count] = following_count unless user_metadata.following_count == following_count

        if metadata_updates.any?
          puts "Updating user metadata record for #{user}"
          user_metadata.update!(metadata_updates)
        end
      end
    end
  end
end
