# typed: true
# frozen_string_literal: true

# Do not require anything here. If you need something else, require it in the method that needs it.
# This makes sure the boot time of our seeds stays low.

module Seeds
  module Objects
    class Business
      def self.github(admin: Objects::User.monalisa)
        biz = create(name: "GitHub, Inc", owner: admin, organizations: [Seeds::Objects::Organization.github])
        biz
      end

      def self.avocado_gmbh
        biz = ::Business.find_by(slug: "avocado-gmbh")
      end

      def self.create(name: Faker::Company.name, owner: Objects::User.monalisa, organizations: [])
        biz = ::Business.find_by(name: name)
        return biz if biz

        require_relative "../data_helper"

        biz = ::Business.create(
          name: name,
          billing_email: Seeds::DataHelper.random_email,
          owners: [owner],
          organizations: organizations,
          seats: 100,
        )

        unless biz.valid? && biz.persisted?
          raise Objects::CreateFailed, "Business failed to create: #{biz.errors.full_messages.to_sentence}\n#{biz.inspect}"
        end

        biz
      end
    end
  end
end
