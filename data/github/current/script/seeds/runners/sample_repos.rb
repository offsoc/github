# typed: true
# frozen_string_literal: true

require_relative "../runner"
# Do not require anything else here. If you need something for your runner, put that in `self.run`.
# This makes sure the boot time of our seeds stays low.

module Seeds
  class Runner
    class SampleRepos < Seeds::Runner
      def self.help
        <<~HELP
        Create a number of repos defined by the count option (default: 10) in the organization defined by the org option (default: github)
        HELP
      end

      def self.run(options = {})
        count = options[:count] || 10
        org_name = options[:org] || "github"
        mona = Seeds::Objects::User.monalisa

        org = Seeds::Objects::Organization.create(login: org_name, admin: mona)
        org.add_member(mona)

        puts "Creating #{count} repos in #{org.display_login}"

        count.times do |i|
          Seeds::Objects::Repository.create(owner_name: org_name, repo_name: "#{Faker::Lorem.word}-#{i + 1}", setup_master: true)
        end

        puts "#{count} repos created in #{org.display_login}"
      end
    end
  end
end
