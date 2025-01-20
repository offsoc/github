# typed: true
# frozen_string_literal: true

require_relative "../runner"
# Do not require anything else here. If you need something for your runner, put that in `self.run`.
# This makes sure the boot time of our seeds stays low.

module Seeds
  class Runner
    class GhesLicenses < Seeds::Runner
      def self.help
        <<~HELP
        Create a GHES license for a business.
        HELP
      end

      def self.run(options = {})
        business_id = options[:business_id]

        puts "Setting up license."

        business = ::Business.find_by(id: business_id)
        if !business.present?
          puts "Couldn't find business with id #{business_id}"
          return
        end

        Seeds::Objects::GhesLicense.create(business: business)
      end
    end
  end
end
