# typed: true
# frozen_string_literal: true

# Do not require anything here. If you need something else, require it in the method that needs it.
# This makes sure the boot time of our seeds stays low.

module Seeds
  module Objects
    class MarketplaceAgreement
      def self.create(signatory_type:)
        puts "> Creating #{signatory_type} Marketplace agreement"

        agreement_scope = Marketplace::Agreement.public_send(signatory_type)
        agreement = agreement_scope.find_by_version("v1") || agreement_scope.new(version: "v1")

        if agreement.new_record?
          agreement.body = Faker::Lorem.paragraphs(number: 3).join(" ")
          agreement.save!
        end

        agreement
      end
    end
  end
end
