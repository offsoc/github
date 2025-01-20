# frozen_string_literal: true

# Do not require anything here. If you need something else, require it in the method that needs it.
# This makes sure the boot time of our seeds stays low.

module Seeds
  module Data
    class MemexSeedData
      # Public: Loads the seed data from the file.
      #
      # Returns Seeds::Data::MemexSeedData
      def self.load
        puts "Reading seed data from script/seeds/data/memex/seed_data.yml"
        new(YAML.safe_load(File.read("script/seeds/data/memex/seed_data.yml")).with_indifferent_access)
      end

      def initialize(seed_data)
        @seed_data = seed_data
      end

      def users_data
        @seed_data[:users]
      end
    end
  end
end
