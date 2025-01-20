# frozen_string_literal: true

# Do not require anything here. If you need something else, require it in the method that needs it.
# This makes sure the boot time of our seeds stays low.

module Seeds
  module Objects
    class SsoIdentityCodespaceData
      # Public: Loads the seed data from the file.
      #
      # Returns Seeds::Objects::SsoIdentityCodespaceData
      def self.load
        puts "Reading seed data from db/identity_seed_data.yml"
        new(YAML.safe_load(File.read("db/identity_seed_data.yml")).with_indifferent_access)
      end

      def initialize(seed_data)
        @seed_data = seed_data
      end

      def businesses_data
        @seed_data[:businesses]
      end

      def organizations_data
        @seed_data[:organizations]
      end

      def users_data
        @seed_data[:users]
      end

      def external_groups_data
        @seed_data[:external_groups]
      end

      def email_suffix(slug)
        @seed_data[:businesses][slug][:email_suffix]
      end
    end
  end
end
