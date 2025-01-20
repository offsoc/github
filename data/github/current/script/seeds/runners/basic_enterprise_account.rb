# typed: true
# frozen_string_literal: true

require_relative "../runner"

module Seeds
  class Runner
    class BasicEnterpriseAccount < Seeds::Runner
      def self.help
        <<~HELP
        Seed enterprise accounts with seats_plan_type set to basic.
        HELP
      end

      def self.run(options = {})
        name = Faker::Company.name.first(30)
        slug = name.parameterize
        owner = Seeds::Objects::User.monalisa

        business = ::Business.create!(
          name: name,
          slug: slug,
          seats_plan_type: :basic,
          owners: [owner]
        )
        puts "Created enterprise account with slug #{business.slug}"
      end
    end
  end
end
