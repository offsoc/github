# typed: true
# frozen_string_literal: true

require_relative "../runner"
# Do not require anything else here. If you need something for your runner, put that in `self.run`.
# This makes sure the boot time of our seeds stays low.

module Seeds
  class Runner
    class GenerateLabels < Seeds::Runner
      def self.help
        <<~HELP
        Generate a specified number of random labels for a given repository

        Example Usage:
          bin/seed generate_labels --nwo foo/bar --label_count 50
        HELP
      end

      def self.run(options = {})
        label_count = options[:label_count]
        nwo = options[:nwo]
        repository = Repository.nwo(nwo)
        abort "Repository not found: #{nwo}" unless repository.present?
        return if label_count.zero?

        puts "-> Creating labels for #{repository.name}"
        label_count.times do |n|
          Seeds::Objects::Label.create(name: Faker::Lorem.word + n.to_s, repo: repository)
        end
      end
    end
  end
end
