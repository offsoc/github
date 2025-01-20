# typed: true
# frozen_string_literal: true

require_relative "../runner"
# Do not require anything else here. If you need something for your runner, put that in `self.run`.
# This makes sure the boot time of our seeds stays low.

module Seeds
  class Runner
    class GhasCommitters < Seeds::Runner
      def self.help
        <<~HELP
        Creates a business and organizations with different Advanced Security configurations and committer counts.

        HELP
      end

      def self.run(options = {})
        require_relative "../factory_bot_loader"

        require_relative "../runners/billing_product_uuids"
        Seeds::Runner::BillingProductUUIDs::PRODUCT_TYPES.values.each do |product_type|
          Seeds::Runner::BillingProductUUIDs.run(product_type: product_type)
        end

        committers = create_committers(login_prefix: "ghas-committer", options: options)

        if GitHub.enterprise?
          puts "Enterprise: creating organization and repos..."
          orgs = 2.times.map do |i|
            login = "ghas-committers-org-#{i}"
            Organization.find_by(login: login)&.destroy if options[:reset]
            ReservedLogin.untombstone!(login)
            org = Objects::Organization.create(login: login, admin: Objects::User.monalisa)

            committers.each { |user| org.add_member(user) }
            org.update!(business: GitHub.global_business)

            org
          end

          GhasCommitters.create_repo(owner: orgs.first, committers: committers, repo_name: "ghas-committers-1") unless options[:skip_repos]
          GhasCommitters.create_repo(owner: orgs.first, committers: committers[..1], repo_name: "ghas-committers-2") unless options[:skip_repos]
          GhasCommitters.create_repo(owner: orgs.second, committers: committers[..1], repo_name: "ghas-committers-2") unless options[:skip_repos]
        else
          puts "Creating sales-serve Advanced Security organization..."
          create_organization(login: "ghas-sales-serve-org", committers: committers, options: options)
          puts "Creating sales-serve Advanced Security business..."
          create_business(name: "GHAS Sales Serve Business", org_prefix: "ghas-sales-serve-business-org", committers: committers, options: options, type: :sales_purchased)
          puts "Creating self-serve Advanced Security business...."
          create_business(name: "GHAS Self Serve Business", org_prefix: "ghas-self-serve-business-org", committers: committers, options: options, type: :self_serve_purchased)
          puts "Creating self-serve Advanced Security trial business...."
          create_business(name: "GHAS Self Serve Trial Business", org_prefix: "ghas-self-serve-trial-business-org", committers: committers, options: options, type: :self_serve_trial)
        end
      end

      def self.create_committers(login_prefix:, options:)
        1.upto(20).map do |i|
          login = "#{login_prefix}#{i + 1}"
          User.find_by(login: login)&.destroy if options[:reset]
          ReservedLogin.untombstone!(login)
          user = Objects::User.create(login: login)
        end
      end

      def self.create_organization(login:, committers:, options:)
        Organization.find_by(login: login)&.destroy if options[:reset]
        ReservedLogin.untombstone!(login)
        org = Objects::Organization.create(login: login, admin: Objects::User.monalisa, plan: "business_plus")
        org.save!

        GitHub.flipper[:ghas_api].enable(org)

        unless org.customer_account
          org.update!(billing_type: "card", customer_account: FactoryBot.create(:credit_card_customer_account, user: org))
        end

        committers.each { |user| org.add_member(user) }

        org.mark_advanced_security_as_purchased_for_entity(actor: Objects::User.monalisa)
        org.set_advanced_security_seats_for_entity(seats: options[:seats], actor: Objects::User.monalisa)

        unless options[:skip_repos]
          GhasCommitters.create_repo(owner: org, committers: committers, repo_name: "ghas-committers-1")
          GhasCommitters.create_repo(owner: org, committers: committers[..1], repo_name: "ghas-committers-2")
        end

        org.update!(billed_on: 10.days.from_now.to_date)

        org
      end

      def self.create_repo(owner:, committers:, repo_name:)
        repo = Seeds::Objects::Repository.create(
          setup_master: true,
          owner_name: owner.login,
          repo_name: repo_name,
          is_public: false,
        )
        repo.reload
        branch = repo.default_branch

        # enable advanced security before creating commits
        # this is for TurboGHAS' benefit as it doesn't know GHAS has been enabled (yet)
        repo.enable_advanced_security!(actor: Objects::User.monalisa)

        committers.each do |committer|
          Seeds::Objects::Commit.create(
            repo: repo,
            committer: committer,
            message: "test message",
            files: { "File.md" => Faker::Lorem.sentence }
          )
        end
        Seeds::Objects::Commit.random_create(
          repo: repo,
          users: owner.members,
          count: 5,
          branch: branch,
        )
      end

      def self.create_business(name:, org_prefix:, committers:, options:, type:)
        Business.find_by(name: name)&.destroy if options[:reset]

        is_self_serve = type != :sales_purchased

        business = FactoryBot.create(
          :business,
          (:with_self_serve_payment if is_self_serve),
          name: name,
          owners: [Objects::User.monalisa],
        )
        FactoryBot.create(:billing_plan_subscription, customer: business.customer) if is_self_serve

        business.save!

        GitHub.flipper[:ghas_api].enable(business)

        orgs = 2.times.map do |i|
          login = "#{org_prefix}-#{i}"
          Organization.find_by(login: login)&.destroy if options[:reset]
          ReservedLogin.untombstone!(login)
          org = Objects::Organization.create(login: login, admin: Objects::User.monalisa)
          org.update!(business: business)

          committers.each { |user| org.add_member(user) }

          org
        end

        case type
        when :self_serve_purchased
          business.subscribe_to_advanced_security(seats: options[:seats], actor: Objects::User.monalisa, billing_cycle: Billing::Public::SubscriptionItems::BillingCycle::Month)
        when :self_serve_trial
          business.update_attribute(:trial_expires_at, Billing::EnterpriseCloudTrial.trial_length.from_now)
          business.subscribe_to_advanced_security_trial(actor: Objects::User.monalisa, billing_cycle: Billing::Public::SubscriptionItems::BillingCycle::Month)
        when :sales_purchased
          business.mark_advanced_security_as_purchased_for_entity(actor: Objects::User.monalisa)
          business.set_advanced_security_seats_for_entity(seats: options[:seats], actor: Objects::User.monalisa)
        end
        business.save!

        GhasCommitters.create_repo(owner: orgs.first, committers: committers, repo_name: "ghas-committers-1") unless options[:skip_repos]
        GhasCommitters.create_repo(owner: orgs.first, committers: committers[..1], repo_name: "ghas-committers-2") unless options[:skip_repos]
        GhasCommitters.create_repo(owner: orgs.second, committers: committers[..1], repo_name: "ghas-committers-2") unless options[:skip_repos]

        business
      end
    end
  end
end
