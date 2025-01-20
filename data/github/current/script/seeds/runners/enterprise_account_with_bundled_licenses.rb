# typed: strict
# frozen_string_literal: true

require_relative "../runner"
# Do not require anything else here. If you need something for your runner, put that in `self.run`.
# This makes sure the boot time of our seeds stays low.

module Seeds
  class Runner
    class EnterpriseAccountWithBundledLicenses < Seeds::Runner
      extend T::Sig

      sig { returns(String) }
      def self.help
        <<~HELP
        Seed Enterprise Accounts with Volume Licensing Enterprise Agreements.

        If an administrator login is provided it ensures that it exists, creating if not.
        This user is then assigned as an owner on an enterprise account with a volume licensing
        enterprise agreement.
        HELP
      end

      sig { params(options: T::Hash[String, T.untyped]).void }
      def self.run(options = {})
        business_name = Faker::Company.name.first(30)
        business_slug = business_name.parameterize
        admin_login = options["administrator_login"] || "#{business_slug}-admin"
        admin = Seeds::Objects::User.create(login: admin_login)
        puts "Ensured admin (#{admin_login}) exists"

        business = ::Business.create!(
          name: business_name,
          slug: business_slug,
          seats: 10,
          owners: [admin]
        )
        puts "Created enterprise account with slug #{business.slug}"
        ::Licensing::EnterpriseAgreement.create!(
          agreement_id: rand(1_000_000),
          status: :active,
          category: :visual_studio_bundle,
          seats: 50,
          business: business
        )
        puts "Created enterprise aggreement for #{business.slug} enterprise account"
        organization = Seeds::Objects::Organization.create(login: "#{business_slug}-org", admin: admin)
        puts "Created organization (#{organization.login}) in the #{business_slug} enterprise account"
      end
    end
  end
end
