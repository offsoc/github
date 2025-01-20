# typed: strict
# frozen_string_literal: true

# Do not require anything here. If you need something else, require it in the method that needs it.
# This makes sure the boot time of our seeds stays low.

module Seeds
  module Objects
    class GhesLicense
      extend T::Sig

      sig { params(business: ::Business).void }
      def self.create(business:)
        ::Licensing::GhesLicense.create_metered_ghes_license(business: business)
      end
    end
  end
end
