# typed: true
# frozen_string_literal: true

require_relative "../runner"
# Do not require anything else here. If you need something for your runner, put that in `self.run`.
# This makes sure the boot time of our seeds stays low.

module Seeds
  class Runner
    class Sponsors < Seeds::Runner
      extend T::Sig

      sig { returns String }
      def self.help
        <<~EOF
        Seed Sponsors for local development

        Seeding

        - Creates users with billing info for creating sponsorships

        - Creates org with billing info for creating sponsorships

        - Creates users and organizations with Sponsors profiles, some publicly visible

        - Creates a fiscal host with child orgs in waitlisted, draft, and approved states

        - Creates Stripe Connect accounts for Sponsors listings

        - Creates potential sponsorships

        - Creates UserMetadata records so user profile sponsorship counts are accurate
        EOF
      end

      sig { params(options: T::Hash[T.any(String, Symbol), T.untyped]).void }
      def self.run(options = {})
        require_relative "../factory_bot_loader"
        require "timecop"

        new.run(options)
      end

      sig { params(options: T::Hash[T.any(String, Symbol), T.untyped]).void }
      def run(options)
        if options.key?(:add_sponsorships_to)
          sponsorable = User.find_by!(login: options[:add_sponsorships_to])
          add_sponsorships_to(sponsorable, options[:count], options[:type])
        elsif options.key?(:add_sponsorships_from)
          sponsor = User.find_by!(login: options[:add_sponsorships_from])
          add_sponsorships_from(sponsor, options[:count], options[:type])
        else
          create_all
        end
      end

      sig { void }
      def create_all
        enable_feature_flags
        create_users
        create_org_sponsor
        create_sponsorable_users
        create_sponsorable_orgs
        create_pending_approval_listings
        create_linked_organization
        create_fiscal_host
        create_sponsors_activities
        create_stripe_accounts
        create_agreements
        create_invoiced_orgs_with_sponsors_zuora_account
        create_invoiced_org_without_sponsors_zuora_account
        create_billing_line_items_for_invoiced_orgs
        create_billing_transactions
        create_premium_sponsorships
        create_patreon_sponsorship
        create_self_serve_enterprise_member_org_sponsorship
        create_public_repos_for_sponsorables
        create_potential_sponsorships
        create_abuse_reports
        create_fraud_reviews
        create_user_profiles
        create_user_metadata # do this last so sponsorship and repo counts are accurate
      end

      sig { void }
      def enable_feature_flags
        [
          :sponsors_pending_sponsorships,
          :sponsors_enforce_trust_system,
          :sponsors_indirect_sponsorships_loader,
          :sponsors_patreon,
        ].each do |feature_flag|
          puts "Enabling #{feature_flag} feature..."
          GitHub.flipper[feature_flag].enable
        end
      end

      sig { returns User }
      def monthly_billed_sponsor
        return @monthly_billed_sponsor if @monthly_billed_sponsor
        login = "sponsoring-user"
        @monthly_billed_sponsor = User.find_by(login: login) ||
          FactoryBot.create(:credit_card_user, :verified,
            plan_subscription: FactoryBot.create(:billing_plan_subscription,
              zuora_subscription_number: SecureRandom.hex),
            plan: GitHub::Plan.free_with_addons,
            billed_on: 2.days.from_now.to_date,
            login: login
          )
        if !@monthly_billed_sponsor.has_saved_trade_screening_record?
          FactoryBot.create(:account_screening_profile, :no_hit, owner: @monthly_billed_sponsor)
        end
        @monthly_billed_sponsor
      end

      sig { returns User }
      def paypal_sponsor
        return @paypal_sponsor if @paypal_sponsor
        login = "paypal-sponsor"
        @paypal_sponsor = User.find_by(login: login) ||
          FactoryBot.create(:paypal_user, :verified,
            plan_subscription: FactoryBot.create(:billing_plan_subscription,
              zuora_subscription_number: SecureRandom.hex),
            plan: GitHub::Plan.free_with_addons,
            billed_on: 2.days.from_now.to_date,
            login: login,
          )
        if !@paypal_sponsor.has_saved_trade_screening_record?
          FactoryBot.create(:account_screening_profile, :no_hit, owner: @paypal_sponsor)
        end
        @paypal_sponsor
      end

      sig { returns User }
      def patreon_sponsor
        return @patreon_sponsor if @patreon_sponsor
        login = "patreon-sponsor"
        @patreon_sponsor = User.find_by(login: login) || FactoryBot.create(:user, :verified, login: login)

        if !@patreon_sponsor.has_saved_trade_screening_record?
          FactoryBot.create(:account_screening_profile, :no_hit, owner: @patreon_sponsor)
        end

        @patreon_sponsor.sponsors_patreon_user ||= FactoryBot.create(:sponsors_patreon_user, user: @patreon_sponsor)

        @patreon_sponsor
      end

      sig { returns Organization }
      def linked_org_sponsor
        return @linked_org_sponsor if @linked_org_sponsor
        org_that_pays_login = "mr-moneybags-org"
        @linked_org_sponsor = Organization.find_by(login: org_that_pays_login) ||
          FactoryBot.create(:credit_card_org, login: org_that_pays_login,
            plan_subscription: FactoryBot.create(:billing_plan_subscription))
      end

      sig { returns Organization }
      def org_sponsor
        return @org_sponsor if @org_sponsor
        login = "sponsoring-org"
        @org_sponsor = User.find_by(login: login) || FactoryBot.create(:credit_card_org,
          plan_subscription: FactoryBot.create(:billing_plan_subscription,
            zuora_subscription_number: SecureRandom.hex),
          plan: GitHub::Plan.free_with_addons,
          billed_on: 2.days.from_now.to_date,
          login: login,
        )
      end

      sig { returns User }
      def yearly_billed_sponsor
        return @yearly_billed_sponsor if @yearly_billed_sponsor
        login = "sponsors-user-yearly"
        @yearly_billed_sponsor = User.find_by(login: login) ||
          FactoryBot.create(:credit_card_user, :verified,
            plan_subscription: FactoryBot.create(:billing_plan_subscription,
              zuora_subscription_number: SecureRandom.hex),
            plan: GitHub::Plan.free_with_addons,
            plan_duration: User::BillingDependency::YEARLY_PLAN,
            billed_on: 60.days.from_now.to_date,
            login: login
          )
      end

      sig { returns User }
      def monthly_billed_sponsor_zuora_sandbox
        return @monthly_billed_sponsor_zuora_sandbox if @monthly_billed_sponsor_zuora_sandbox
        login = "sponsoring-user-zuora"
        @monthly_billed_sponsor_zuora_sandbox = User.find_by(login: login) ||
          FactoryBot.create(:credit_card_user, :verified,
            plan_subscription: FactoryBot.create(:billing_plan_subscription,
              zuora_subscription_number: "A-S00094960",
              zuora_subscription_id: "2c92c0fb7a5b3ac8017a5ba218be1848",
            ),
            plan: GitHub::Plan.free_with_addons,
            billed_on: 15.days.from_now.to_date,
            login: login
          )
      end

      sig { void }
      def create_users
        puts "Creating monthly and yearly billed sponsors"
        puts "------"
        puts "Login for #{monthly_billed_sponsor}: #{login_url_for(monthly_billed_sponsor)}"
        puts "Login for #{yearly_billed_sponsor}: #{login_url_for(yearly_billed_sponsor)}"
        puts "Login for #{monthly_billed_sponsor_zuora_sandbox}: " \
          "#{login_url_for(monthly_billed_sponsor_zuora_sandbox)}"
        puts "Login for #{paypal_sponsor}: #{login_url_for(paypal_sponsor)}"
        puts "Login for #{patreon_sponsor}: #{login_url_for(patreon_sponsor)}"
        puts "\n\n"
      end

      sig { returns User }
      def org_billing_manager
        return @org_billing_manager if @org_billing_manager
        user = User.find_by(login: "billing-manager") || FactoryBot.create(:user, login: "billing-manager")
        email = user.emails.first
        email.verify! if email && !email.verified?
        @org_billing_manager = user
      end

      sig { void }
      def create_org_sponsor
        puts "Creating org for creating sponsorships"
        puts "------"
        org = org_sponsor
        admin = org.admins.first
        admin.emails.first.verify!
        puts "Login for #{org} admin: #{login_url_for(admin)}"

        unless org.adminable_by?(monalisa)
          puts "Setting #{monalisa} as org admin of #{org}"
          org.add_admin(monalisa)
        end

        unless org.billing_manager?(org_billing_manager)
          puts "Setting #{org_billing_manager} as billing manager of #{org}"
          org.billing.add_manager(org_billing_manager, actor: admin)
        end

        puts "\n\n"
      end

      sig { returns User }
      def monalisa
        @monalisa ||= Seeds::Objects::User.monalisa
      end

      POSITIVE_CREDIT_BALANCE_ZUORA_ACCOUNT_ID = "2c92c0f96e63a4ee016e688d1cd53f7b"
      POSITIVE_CREDIT_BALANCE_ZUORA_ACCOUNT_NUMBER = "A0100394109"

      sig { returns Organization }
      def invoiced_org1
        return @invoiced_org1 if @invoiced_org1
        login = "invoiced-sponsors-org"
        @invoiced_org1 = Organization.find_by(login: login)
        unless @invoiced_org1
          @invoiced_org1 = FactoryBot.create(:invoiced_organization, :sponsors_invoiced, admin: monalisa,
            login: login)
          setup_invoiced_organization(@invoiced_org1,
            zuora_account_number: POSITIVE_CREDIT_BALANCE_ZUORA_ACCOUNT_NUMBER,
            zuora_account_id: POSITIVE_CREDIT_BALANCE_ZUORA_ACCOUNT_ID)
        end
        @invoiced_org1
      end

      ZERO_CREDIT_BALANCE_ZUORA_ACCOUNT_ID = "2c92c0fb72ff6f03017301e43ee53fe2"
      ZERO_CREDIT_BALANCE_ZUORA_ACCOUNT_NUMBER = "A0101275073"

      sig { returns Organization }
      def invoiced_org2
        return @invoiced_org2 if @invoiced_org2
        login = "no-credit-invoiced-org"
        @invoiced_org2 = Organization.find_by(login: login)
        unless @invoiced_org2
          @invoiced_org2 = FactoryBot.create(:invoiced_organization, :sponsors_invoiced, admin: monalisa, login: login)
          setup_invoiced_organization(@invoiced_org2,
            zuora_account_number: ZERO_CREDIT_BALANCE_ZUORA_ACCOUNT_NUMBER,
            zuora_account_id: ZERO_CREDIT_BALANCE_ZUORA_ACCOUNT_ID)
        end
        @invoiced_org2
      end

      # See https://dashboard.stripe.com/test/customers
      STRIPE_CUSTOMER_IDS = %w(cus_NWHTE7nqw3aEcZ cus_NPBOAI0H44lys6 cus_NWI0JQyjjgqxJk cus_MB8i2CplSvCskn
        cus_N7EPJDM0BUvm7t cus_M6eIl1vXtHueCD).freeze

      sig { returns String }
      def unused_stripe_customer_id
        used_stripe_customer_ids = OrganizationProfile.where.not(stripe_customer_id: nil).pluck(:stripe_customer_id)
        (STRIPE_CUSTOMER_IDS - used_stripe_customer_ids).sample
      end

      sig { void }
      def create_invoiced_orgs_with_sponsors_zuora_account
        puts "Creating invoiced organizations with Sponsors-specific Zuora account"
        puts "------"

        invoiced_org1
        invoiced_org2

        invoiced_org1_org_profile = invoiced_org1.organization_profile || FactoryBot.create(:organization_profile,
          organization: invoiced_org1)
        stripe_customer_id = unused_stripe_customer_id
        if stripe_customer_id.present? && invoiced_org1_org_profile.stripe_customer_id != stripe_customer_id
          puts "Setting Stripe customer ID for #{invoiced_org1}"
          invoiced_org1_org_profile.update!(stripe_customer_id: stripe_customer_id)
        end

        invoiced_org2_org_profile = invoiced_org2.organization_profile || FactoryBot.create(:organization_profile,
          organization: invoiced_org2)
        stripe_customer_id = unused_stripe_customer_id
        if stripe_customer_id.present? && invoiced_org2_org_profile.stripe_customer_id != stripe_customer_id
          puts "Setting Stripe customer ID for #{invoiced_org2}"
          invoiced_org2_org_profile.update!(stripe_customer_id: stripe_customer_id)
        end

        puts "\n\n"
      end

      sig { void }
      def create_invoiced_org_without_sponsors_zuora_account
        puts "Creating invoiced organization without Sponsors-specific Zuora account"
        puts "------"

        invoiced_org_login = "invoiced-org"
        invoiced_org = Organization.find_by(login: invoiced_org_login)
        if !invoiced_org
          FactoryBot.create(:invoiced_organization, admin: monalisa, login: invoiced_org_login)
        else
          puts "#{invoiced_org_login} already created"
        end

        puts "\n\n"
      end

      sig { params(invoiced_org: Organization, zuora_account_id: String, zuora_account_number: String).void }
      def setup_invoiced_organization(invoiced_org, zuora_account_id:, zuora_account_number:)
        has_signed_agreement = SponsorsInvoicedAgreementSignature.signed_for_org?(invoiced_org,
          version: invoiced_sponsor_agreement.version)
        unless has_signed_agreement
          puts "Creating invoiced sponsor agreement signature for @#{invoiced_org}"
          FactoryBot.create(:sponsors_invoiced_agreement_signature, organization: invoiced_org,
            agreement: invoiced_sponsor_agreement)
        end

        sponsors_customer = invoiced_org.sponsors_customer
        unless sponsors_customer
          sponsors_customer = FactoryBot.create(:no_credit_card_customer, :invoiced, :sponsors_invoiced,
            payment_method_user: invoiced_org, zuora_account_id: zuora_account_id,
            zuora_account_number: zuora_account_number)
          FactoryBot.create(:customer_account, :sponsors_invoiced, customer: sponsors_customer, user: invoiced_org)
        end

        sponsors_customer.assign_attributes(zuora_account_id: zuora_account_id,
          zuora_account_number: zuora_account_number)
        sponsors_customer.save! if sponsors_customer.changed?

        if invoiced_org.adminable_by?(monalisa)
          puts "#{invoiced_org} has admin #{monalisa}"
        else
          puts "Setting #{monalisa} as org admin of #{invoiced_org}"
          invoiced_org.add_admin(monalisa)
        end

        unless invoiced_org.billing_manager?(org_billing_manager)
          puts "Setting #{org_billing_manager} as billing manager of #{invoiced_org}"
          invoiced_org.billing.add_manager(org_billing_manager, actor: monalisa)
        end

        unless invoiced_org.sponsors_plan_subscription
          FactoryBot.create(:billing_plan_subscription, :sponsors_invoiced, :zuora,
            customer: invoiced_org.sponsors_customer, user: invoiced_org)
        end
      end

      sig { void }
      def create_billing_line_items_for_invoiced_orgs
        invoiced_org_login = "invoiced-sponsors-org"
        invoiced_org = Organization.find_by(login: invoiced_org_login)

        return unless invoiced_org

        puts "Creating billing line items for current year for #{invoiced_org_login}"

        org_tier = T.must(approved_sponsorable_org.sponsors_listing).default_tier
        user_tier = T.must(approved_sponsorable_user.sponsors_listing).default_tier

        billing_transaction = FactoryBot.create(:billing_transaction, user: invoiced_org,
          plan_subscription: invoiced_org.sponsors_plan_subscription, amount_in_cents: 1000_00)
        [org_tier, user_tier].each do |tier|
          FactoryBot.create(:billing_transaction_line_item, billing_transaction: billing_transaction,
            amount_in_cents: 500_00, subscribable: tier)
        end

        puts "Creating billing line items for previous year for #{invoiced_org_login}"
        puts "------"

        old_billing_transaction = FactoryBot.create(:billing_transaction,
          user: invoiced_org,
          plan_subscription: invoiced_org.sponsors_plan_subscription,
          created_at: 1.year.ago,
          updated_at: 1.year.ago,
          amount_in_cents: 1000_00,
        )
        [org_tier, user_tier].each do |tier|
          FactoryBot.create(:billing_transaction_line_item,
            billing_transaction: old_billing_transaction,
            amount_in_cents: 500_00,
            created_at: 1.year.ago,
            updated_at: 1.year.ago,
            subscribable: tier
          )
        end

        puts "\n\n"
      end

      sig { returns T::Hash[Symbol, T::Array[String]] }
      def country_codes_by_listing_state
        @country_codes_by_listing_state ||= {
          waitlisted: Billing::StripeConnect::Account.unsupported_countries,
          draft: Billing::StripeConnect::Account.supported_countries,
          spammy: Billing::StripeConnect::Account.supported_countries,
        }
      end

      sig { returns T::Hash[Symbol, T::Array[ActiveSupport::TimeWithZone]] }
      def user_signup_time_by_listing_state
        @user_signup_time_by_listing_state ||= {
          waitlisted: [1.month.ago, 3.months.ago, 14.months.ago],
          draft: [3.months.ago, 1.year.ago, 2.years.ago],
          pending_approval: [6.months.ago, 13.months.ago, 25.months.ago],
          approved: [1.year.ago, 2.years.ago, 3.years.ago],
          spammy: [1.hour.ago, 3.months.ago, 8.months.ago],
          disabled: [6.months.ago, 1.year.ago, 5.years.ago],
        }
      end

      sig { params(sponsorable: GitHubSponsors::Types::Sponsorable).void }
      def set_sponsorable_github_signup_time(sponsorable)
        listing = sponsorable.sponsors_listing
        raise "No listing found for #{sponsorable}" unless listing

        state = listing.current_state_name
        user_signup_time = user_signup_time_by_listing_state.fetch(state).sample || 1.second.ago
        if sponsorable.created_at && T.must(sponsorable.created_at).to_date != user_signup_time.to_date
          puts "Updating #{sponsorable}'s GitHub signup time to #{user_signup_time}"
          sponsorable.update_column(:created_at, user_signup_time)
          sponsorable.sponsors_listing_stafftools_metadata&.update_column(:sponsorable_created_at, user_signup_time)
        end
      end

      sig { void }
      def create_pending_approval_listings
        not_ready_to_approve_listing
        ready_to_approve_listing
      end

      sig { returns SponsorsListing }
      def not_ready_to_approve_listing
        return @not_ready_to_approve_listing if @not_ready_to_approve_listing

        @not_ready_to_approve_listing = SponsorsListing.with_pending_approval_state.not_stripe_verified.first

        unless @not_ready_to_approve_listing
          puts "Creating a pending_approval listing that will not be ready to approve"
          @not_ready_to_approve_listing = FactoryBot.create(:sponsors_listing, :pending_approval,
            :with_w8_or_w9_requested_but_unverified_stripe_account)
        end

        @not_ready_to_approve_listing
      end

      sig { returns GitHubSponsors::Types::Sponsorable }
      def not_ready_to_approve_maintainer
        return @not_ready_to_approve_maintainer if @not_ready_to_approve_maintainer
        @not_ready_to_approve_maintainer = T.must(not_ready_to_approve_listing.sponsorable)

        ensure_time_zone_for(user: @not_ready_to_approve_maintainer, country_code: "US")
        set_sponsorable_github_signup_time(@not_ready_to_approve_maintainer)

        @not_ready_to_approve_maintainer
      end

      sig { returns SponsorsListing }
      def ready_to_approve_listing
        return @ready_to_approve_listing if @ready_to_approve_listing

        @ready_to_approve_listing = SponsorsListing.with_pending_approval_state.stripe_verified.first

        unless @ready_to_approve_listing
          puts "Creating a pending_approval listing that will be ready to approve"
          @ready_to_approve_listing = FactoryBot.create(:sponsors_listing, :ready_for_approval)
        end

        @ready_to_approve_listing
      end

      sig { returns GitHubSponsors::Types::Sponsorable }
      def ready_to_approve_maintainer
        return @ready_to_approve_maintainer if @ready_to_approve_maintainer
        @ready_to_approve_maintainer = T.must(ready_to_approve_listing.sponsorable)

        ensure_time_zone_for(user: @ready_to_approve_maintainer, country_code: "US")
        set_sponsorable_github_signup_time(@ready_to_approve_maintainer)

        @ready_to_approve_maintainer
      end

      sig { void }
      def create_sponsorable_users
        %i[waitlisted draft approved spammy].each do |state|
          listing_options = { sponsorable_login: "#{state}-user" }
          if country_codes_by_listing_state.key?(state)
            listing_options[:country_of_residence] = country_codes_by_listing_state.fetch(state).sample
          end
          if [true, false].sample
            listing_options[:min_custom_tier_amount_in_cents] = (rand(50) + 2) * 100
          end
          sponsorable_with_listing(
            listing_state: state,
            listing_args: [:with_tiers, :with_one_time_tiers],
            listing_options: listing_options,
          )
        end
        sponsorable_with_listing(
          listing_state: :disabled,
          listing_options: { sponsorable_login: "IHaveDisabledMySponsorsProfile" },
        )
        patreon_maintainer = sponsorable_with_listing(
          listing_state: :approved,
          listing_options: { sponsorable_login: "patreon-maintainer" },
        )
        patreon_maintainer.sponsors_patreon_user ||= FactoryBot.create(:sponsors_patreon_user, user: patreon_maintainer)
        create_sponsors_patreon_tiers_for(patreon_maintainer)
        puts "\n\n"
      end

      sig { params(user: T.nilable(GitHubSponsors::Types::Sponsorable)).void }
      def create_sponsors_patreon_tiers_for(user)
        spu = user&.sponsors_patreon_user
        return unless spu

        if spu.sponsors_patreon_tiers.empty?
          puts "Seeding Patreon tiers for @#{user.display_login}..."
          campaign_id, amount_in_cents = SecureRandom.hex(10), 1_00
          FactoryBot.create(:sponsors_patreon_tier, sponsors_patreon_user: spu, campaign_id: campaign_id,
            amount_in_cents: amount_in_cents)
          FactoryBot.create(:sponsors_patreon_tier, sponsors_patreon_user: spu, campaign_id: campaign_id,
            amount_in_cents: amount_in_cents + 5_00)
        end
      end

      sig { void }
      def create_stripe_accounts
        approved_listing = T.must(approved_sponsorable_user.sponsors_listing)
        draft_listing = T.must(draft_sponsorable_user.sponsors_listing)
        approved_org_listing = T.must(approved_sponsorable_org.sponsors_listing)
        fiscal_host_listing = T.must(SponsorsListing.with_sponsorable_logins(fiscal_host_login).first)
        disabled_listing = T.must(disabled_sponsorable_user.sponsors_listing)

        # See Stripe dashboard with test data, https://dashboard.stripe.com/test/dashboard
        stripe_account = create_stripe_account(sponsors_listing: approved_listing,
          stripe_account_id: "acct_1IVNeG2QMcjPByBU", active: false)
        create_ledger_entries_for_sponsorship(stripe_account, transfer_id: "tr_1IWkNQEQsq43iHhXlhaLBYMR",
          dollar_amount: 1_200, time: Time.parse("2021-03-10 08:36:00"), transfer_group: "123")
        create_ledger_entries_for_sponsorship(stripe_account, transfer_id: "tr_1IVmUEEQsq43iHhXxDIyJqXf",
          dollar_amount: 2_700, time: Time.parse("2021-03-16 16:39:00"),
          transfer_group: "2c92a00d6ff0e96f0170168b81415536")
        create_ledger_entries_for_sponsorship(stripe_account, transfer_id: "tr_1IVOapEQsq43iHhXbiHJ8Z2Y",
          dollar_amount: 3_100, time: Time.parse("2021-03-15 15:08:00"),
          transfer_group: "2c92a00d6ff0e96f0170168b81415536")
        create_ledger_entries_for_sponsorship(stripe_account, transfer_id: "tr_1IVOQXEQsq43iHhXTdmjDoq2",
          dollar_amount: 2_500, time: Time.parse("2021-03-15 14:58:00"),
          transfer_group: "2c92a00d6ff0e96f0170168b81415536")
        create_ledger_entries_for_sponsorship(stripe_account, transfer_id: "tr_1IVOFTEQsq43iHhXXSQv8Atp",
          dollar_amount: 1_150, time: Time.parse("2021-03-15 14:46:00"),
          transfer_group: "2c92a00d6ff0e96f0170168b81415536")

        create_stripe_account(sponsors_listing: fiscal_host_listing, stripe_account_id: "acct_1JF5Yj2RZu2MJLmN",
          active: true)
        create_stripe_account(sponsors_listing: approved_listing, stripe_account_id: "acct_1Ij7or2RGYiPwfyv")
        create_stripe_account(sponsors_listing: draft_listing, stripe_account_id: "acct_1Jeh712Qk4G4AxFB",
          verified: false, requirements_eventually_due: true)
        create_stripe_account(sponsors_listing: disabled_listing, stripe_account_id: "acct_1Ep35IFxJZYbadPl",
          active: false)

        stripe_account = create_stripe_account(sponsors_listing: approved_org_listing,
          stripe_account_id: "acct_1IziWM2Q3WKZykUd")
        create_ledger_entries_for_sponsorship(stripe_account, transfer_id: "tr_1IzjSREQsq43iHhXCGBqgu1p",
          dollar_amount: 2_000, time: Time.parse("2021-06-07 07:29:00"),
          transfer_group: "2c92a00d6ff0e96f0170168b81415536")
        create_ledger_entries_for_sponsorship(stripe_account, transfer_id: "tr_1IzipFEQsq43iHhXqQ6OzE10",
          dollar_amount: 1_000, time: Time.parse("2021-06-07 06:49:00"),
          transfer_group: "2c92a00d6ff0e96f0170168b81415536")

        puts "\n\n"
      end

      sig { returns SponsorsAgreement }
      def invoiced_sponsor_agreement
        return @invoiced_sponsor_agreement if @invoiced_sponsor_agreement

        version = Date.current.to_s
        existing_agreement = SponsorsAgreement.invoiced_sponsor_kind.find_by(version: version)
        if existing_agreement
          @invoiced_sponsor_agreement = existing_agreement
          return @invoiced_sponsor_agreement
        end

        puts "Creating #{SponsorsAgreement::AGREEMENT_NAMES_BY_KIND[:invoiced_sponsor]}, version #{version}"
        @invoiced_sponsor_agreement = FactoryBot.create(:sponsors_agreement, :invoiced_sponsor, version: version)
      end

      sig { void }
      def create_agreements
        invoiced_sponsor_agreement
      end

      sig do
        params(
          sponsors_listing: SponsorsListing,
          stripe_account_id: String,
          verified: T::Boolean,
          active: T::Boolean,
          requirements_eventually_due: T::Boolean
        ).returns(Billing::StripeConnect::Account)
      end
      def create_stripe_account(sponsors_listing:, stripe_account_id:, verified: true, active: true, requirements_eventually_due: false)
        account = Billing::StripeConnect::Account.for_sponsors_listing(sponsors_listing)
          .find_by(stripe_account_id: stripe_account_id)

        if active && account.nil?
          account = sponsors_listing.active_stripe_connect_account
          if account
            puts "Changing active Stripe account for #{sponsors_listing.sponsorable_login} to #{stripe_account_id}"
            account.update_attribute(:stripe_account_id, stripe_account_id)
            sponsors_listing.update!(country_of_residence: account.country, billing_country: account.billing_country)
          end
        end

        unless account
          active_desc = active ? "active" : "inactive"
          verified_desc = verified ? "verified" : "unverified"
          puts "Creating #{active_desc}, #{verified_desc} Stripe account #{stripe_account_id} " \
            "for #{sponsors_listing.sponsorable_login}"
          traits = []
          traits << :inactive unless active
          if verified
            traits << :w8_or_w9_verified
          else
            traits << :unverified
          end
          account = FactoryBot.create(:stripe_connect_account, *traits, sponsors_listing: sponsors_listing,
            stripe_account_id: stripe_account_id)
        end

        if verified && !account.verified_verification_status?
          account.update_attribute(:verification_status,
            Billing::StripeConnect::Account.verification_statuses["verified"])
        elsif !verified && account.verified_verification_status?
          unverified_statuses = Billing::StripeConnect::Account.verification_statuses
            .reject { |k, _v| k == "verified" }.keys
          unverified_status = T.must(unverified_statuses.sample).to_s
          account.update_attribute(:verification_status,
            Billing::StripeConnect::Account.verification_statuses[unverified_status])
        end
        account.update_attribute(:active, active) unless active == account.active?
        unless requirements_eventually_due == account.requirements_eventually_due?
          account.update_attribute(:requirements_eventually_due, requirements_eventually_due)
        end

        account
      end

      sig do
        params(
          stripe_account: Billing::StripeConnect::Account,
          transfer_id: String,
          dollar_amount: Integer,
          time: T.any(Time, ActiveSupport::TimeWithZone),
          transfer_group: String
        ).void
      end
      def create_ledger_entries_for_sponsorship(stripe_account, transfer_id:, dollar_amount:, time:, transfer_group:)
        transfer_ledger_entry = create_transfer_ledger_entry(stripe_account, transfer_id: transfer_id,
          dollar_amount: dollar_amount, time: time, transfer_group: transfer_group)

        billing_transaction = T.must(transfer_ledger_entry.billing_transaction)
        unless billing_transaction.platform_transaction_id == transfer_group
          billing_transaction.update_attribute(:platform_transaction_id, transfer_group)
        end

        sponsor = billing_transaction.user
        sponsor.emails.first&.verify! if sponsor.no_verified_emails?
        ensure_time_zone_for(user: sponsor, country_code: all_country_codes.sample.to_s)

        sponsors_listing = stripe_account.sponsors_listing
        raise "No sponsors listing for Stripe account #{stripe_account.stripe_account_id}" unless sponsors_listing
        sponsorable = T.must(sponsors_listing.sponsorable)
        tier = sponsors_tier_for_amount(sponsors_listing, dollar_amount)

        sponsorship_for(sponsorable, sponsor, tier: tier, billing_transaction: billing_transaction)

        create_payment_ledger_entry(stripe_account, billing_transaction: billing_transaction,
          dollar_amount: dollar_amount, time: time)
      end

      sig { params(sponsors_listing: SponsorsListing, dollar_amount: Integer).returns(SponsorsTier) }
      def sponsors_tier_for_amount(sponsors_listing, dollar_amount)
        amount_in_cents = dollar_amount * 100
        tier = sponsors_listing.published_sponsors_tiers.find_by(monthly_price_in_cents: amount_in_cents)

        unless tier
          puts "Creating $#{dollar_amount} / month tier for #{sponsors_listing.sponsorable_login}"
          tier = FactoryBot.create(:sponsors_tier, :published, sponsors_listing: sponsors_listing,
            monthly_price_in_cents: amount_in_cents)
        end

        tier
      end

      sig do
        params(
          stripe_account: Billing::StripeConnect::Account,
          billing_transaction: Billing::BillingTransaction,
          dollar_amount: Integer,
          time: T.any(Time, ActiveSupport::TimeWithZone)
        ).returns(Billing::PayoutsLedgerEntry)
      end
      def create_payment_ledger_entry(stripe_account, billing_transaction:, dollar_amount:, time:)
        ledger_entry = Billing::PayoutsLedgerEntry.payment.for_stripe_account(stripe_account)
          .where(billing_transaction_id: billing_transaction).first
        sponsors_listing = stripe_account.sponsors_listing
        raise "No sponsors listing for Stripe account #{stripe_account.stripe_account_id}" unless sponsors_listing

        unless ledger_entry
          puts "Creating $#{dollar_amount} Stripe payment for #{sponsors_listing.sponsorable_login}"
          ledger_entry = Timecop.freeze(time) do
            FactoryBot.create(:payouts_ledger_entry, :payment, stripe_connect_account: stripe_account,
              amount_in_subunits: dollar_amount * -100, transaction_timestamp: time,
              billing_transaction: billing_transaction,
              primary_reference_id: billing_transaction.platform_transaction_id)
          end
        end

        unless ledger_entry.billing_transaction_id == billing_transaction.id
          ledger_entry.update_attribute(:billing_transaction_id, billing_transaction.id)
        end

        unless ledger_entry.primary_reference_id == billing_transaction.platform_transaction_id
          ledger_entry.update_attribute(:primary_reference_id, billing_transaction.platform_transaction_id)
        end

        ledger_entry
      end

      sig do
        params(
          stripe_account: Billing::StripeConnect::Account,
          transfer_id: String,
          dollar_amount: Integer,
          time: T.any(Time, ActiveSupport::TimeWithZone),
          transfer_group: String
        ).returns(Billing::PayoutsLedgerEntry)
      end
      def create_transfer_ledger_entry(stripe_account, transfer_id:, dollar_amount:, time:, transfer_group:)
        ledger_entry = Billing::PayoutsLedgerEntry.transfer.with_primary_reference_id(transfer_id)
          .for_stripe_account(stripe_account).first
        sponsors_listing = stripe_account.sponsors_listing
        raise "No sponsors listing for Stripe account #{stripe_account.stripe_account_id}" unless sponsors_listing

        unless ledger_entry
          puts "Creating $#{dollar_amount} Stripe transfer for #{sponsors_listing.sponsorable_login}"
          ledger_entry = Timecop.freeze(time) do
            FactoryBot.create(:payouts_ledger_entry, :transfer, stripe_connect_account: stripe_account,
              amount_in_subunits: dollar_amount * 100, primary_reference_id: transfer_id, transaction_timestamp: time)
          end
        end

        unless ledger_entry.billing_transaction
          sponsor = FactoryBot.create(:credit_card_user, :verified, login: "sponsor-#{SecureRandom.hex(12)}",
            plan_subscription: FactoryBot.create(:billing_plan_subscription))
          puts "Creating $#{dollar_amount} billing transaction from #{sponsor} => " \
            "#{sponsors_listing.sponsorable_login}"
          billing_transaction = FactoryBot.create(:billing_transaction, :zuora, user: sponsor,
            platform_transaction_id: transfer_group)
          ledger_entry.update_attribute(:billing_transaction_id, billing_transaction.id)
        end

        ledger_entry
      end

      sig { returns Organization }
      def approved_sponsorable_org
        @approved_sponsorable_org ||= Organization.find_by_login("approved-org")
      end

      sig { returns Organization }
      def org_with_featured
        @org_with_featured ||= Organization.find_by_login("with-featured-team-org")
      end

      sig { returns User }
      def approved_sponsorable_user
        return @approved_sponsorable_user if @approved_sponsorable_user

        login = "approved-user"
        user = User.find_by(login: login) || FactoryBot.create(:user, :verified, login: login)

        unless user.has_saved_trade_screening_record?
          FactoryBot.create(:account_screening_profile, :no_hit, owner: user)
        end

        if user.two_factor_credential.nil?
          FactoryBot.create(:two_factor_credential, recovery_codes_viewed: true, user: user)
        elsif !user.two_factor_credential.recovery_codes_viewed?
          user.two_factor_credential.update!(recovery_codes_viewed: true)
        end

        @approved_sponsorable_user = user
      end

      sig { returns User }
      def disabled_sponsorable_user
        @disabled_sponsorable_user ||= User.find_by(login: "IHaveDisabledMySponsorsProfile")
      end

      sig { returns User }
      def patreon_maintainer
        @patreon_sponsorable_user ||= User.find_by(login: "patreon-maintainer")
      end

      sig { returns User }
      def draft_sponsorable_user
        @draft_sponsorable_user ||= User.find_by(login: "draft-user")
      end

      sig { returns Organization }
      def approved_fiscal_host_member
        return @approved_fiscal_host_member if @approved_fiscal_host_member
        @approved_fiscal_host_member = Organization.find_by(login: "approved-fiscal-host-member")
        @approved_fiscal_host_member&.add_admin(monalisa)
        T.must(@approved_fiscal_host_member)
      end

      sig { returns User }
      def draft_fiscal_host_member
        @draft_fiscal_host_member ||= User.find_by(login: "draft-fiscal-host-member")
      end

      sig { void }
      def create_sponsorable_orgs
        %i[waitlisted draft approved].each do |state|
          org = sponsorable_with_listing(
            listing_state: state,
            listing_args: [:for_org, :with_tiers, :with_one_time_tiers, :with_repository_tier],
            listing_options: { sponsorable_login: "#{state}-org" },
          )
          T.must(org.admins.first).emails.first.verify!
        end

        puts "Setting #{monalisa} as an admin of #{approved_sponsorable_org}"
        approved_sponsorable_org.add_admin(monalisa)

        create_org_with_featured
        create_zuora_sandbox_org
        puts "\n\n"
      end

      sig { void }
      def create_org_with_featured
        login = "with-featured-team-org"
        org = T.cast(sponsorable_with_listing(
          listing_state: :approved,
          listing_args: [:for_org, :with_tiers, :with_one_time_tiers, :with_repository_tier],
          listing_options: { sponsorable_login: login },
        ), Organization)
        listing = T.must(org.sponsors_listing)

        unless listing.featured_users.count >= SponsorsListingFeaturedItem::FEATURED_USERS_LIMIT_PER_LISTING
          users = FactoryBot.create_list(:user, SponsorsListingFeaturedItem::FEATURED_USERS_LIMIT_PER_LISTING)
          users.each do |u|
            puts "Adding user @#{u.display_login} to org @#{org.display_login}..."
            org.add_member(u)

            puts "Featuring user @#{u.display_login} on Sponsors profile for org @#{org.display_login}..."
            FactoryBot.create(:sponsors_listing_featured_item, featureable: u, sponsors_listing: listing)
          end
        end

        users_with_profiles = listing.featured_users.includes(featureable: :profile).map(&:featureable)
          .select { |user| user.profile.present? }
        if users_with_profiles.empty?
          featured_users = listing.featured_users.includes(:featureable).map(&:featureable)
          users_to_add_profile_to = featured_users.sample(featured_users.size / 2)
          users_to_add_profile_to.each do |user|
            puts "Adding profile for featured user @#{user.display_login}..."
            FactoryBot.create(:profile, user: user, name: Faker::TvShows::TheExpanse.character,
              bio: Faker::Quote.famous_last_words)
          end
        end
      end

      sig { void }
      def create_patreon_sponsorship
        existing_patreon_sponsorship = Sponsorship.from_sponsor(patreon_sponsor)
          .with_user_or_org_sponsorable(patreon_maintainer).first
        patreon_tier = T.must(patreon_maintainer.sponsors_patreon_user).sponsors_patreon_tiers.sample

        if existing_patreon_sponsorship&.active? && existing_patreon_sponsorship.paid?
          puts "Patreon sponsorship from #{patreon_sponsor} to #{patreon_maintainer} already exists"
        elsif existing_patreon_sponsorship
          puts "Activating Patreon sponsorship from #{patreon_sponsor} to #{patreon_maintainer}"
          existing_patreon_sponsorship.update!(active: true, paid_at: Time.current)
        else
          puts "Creating Patreon sponsorship from #{patreon_sponsor} to #{patreon_maintainer}"
          FactoryBot.create(:sponsorship, :patreon, sponsor: patreon_sponsor,
            sponsorable: patreon_maintainer, monthly_price_in_cents: patreon_tier.amount_in_cents)
        end

        patreon_sponsorship_has_wrong_value = existing_patreon_sponsorship && patreon_tier &&
          existing_patreon_sponsorship.monthly_price_in_cents != patreon_tier.amount_in_cents
        if patreon_sponsorship_has_wrong_value
          money = Billing::Money.new(patreon_tier.amount_in_cents)
          puts "Updating existing Patreon sponsorship from #{patreon_sponsor} to #{patreon_maintainer} to be " \
            "for #{money.format}"
          sponsors_tier = FactoryBot.create(:sponsors_tier, :custom, creator: patreon_sponsor,
            monthly_price_in_cents: patreon_tier.amount_in_cents,
            sponsors_listing: patreon_maintainer.sponsors_listing)
          existing_patreon_sponsorship.update!(subscribable_id: sponsors_tier.id)
        end

        existing_patreon_sponsors_activity = SponsorsActivity.patreon.for_sponsorable_and_sponsor(patreon_maintainer, patreon_sponsor).last
        if existing_patreon_sponsors_activity.nil?
          puts "Creating Patreon SponsorsActivity from #{patreon_sponsor} to #{patreon_maintainer}"
          FactoryBot.create(:sponsors_activity, :patreon, sponsor: patreon_sponsor, sponsorable: patreon_maintainer)
        end

        puts "\n\n"
      end

      sig { void }
      def create_self_serve_enterprise_member_org_sponsorship
        business_slug = "sponsors-self-serve-enterprise"
        if Business.find_by(slug: business_slug)
          puts "Sponsors self-serve enterprise already exists!"
          return
        else
          puts "Creating self-serve enterprise with sponsoring member org"
        end
        business = FactoryBot.create(:business, :with_self_serve_payment,
          owners: [monalisa],
          name: business_slug,
          slug: business_slug
        )
        business.enable_feature(:sponsors_self_serve_enterprise)
        member_org = FactoryBot.create(:organization, business: business, login: "sponsors-enterprise-member-org")
        sub_item = FactoryBot.create(:sponsors_subscription_item,
          account: member_org
        )
        FactoryBot.create(:sponsorship,
          sponsor: member_org,
          tier: sub_item.subscribable,
          subscription_item: sub_item
        )
      end

      sig { void }
      def create_premium_sponsorships
        puts "Creating legacy invoiced sponsorships"
        FactoryBot.create_list(:invoiced_sponsorship_transfer, 3, :completed, actor: monalisa)

        puts "Creating Zuora-based invoiced sponsorships"
        sponsorships = FactoryBot.create_pair(:sponsorship, :sponsors_invoiced, sponsorable: approved_sponsorable_user)
        sponsorships << FactoryBot.create(:sponsorship, :sponsors_invoiced, :one_time,
          monthly_price_in_cents: (Sponsorship.count + 1) * 100, sponsorable: approved_sponsorable_org)
        sponsorships << FactoryBot.create(:sponsorship, :sponsors_invoiced, :one_time,
          monthly_price_in_cents: (Sponsorship.count + 1) * 100)
        sponsorships << FactoryBot.create(:sponsorship, :sponsors_invoiced, :private,
          monthly_price_in_cents: (Sponsorship.count + 1) * 100, sponsorable: approved_sponsorable_user)
        sponsorships << FactoryBot.create(:sponsorship, :sponsors_invoiced, :one_time,
          monthly_price_in_cents: (Sponsorship.count + 1) * 100, sponsorable: approved_sponsorable_user)
        sponsorships << FactoryBot.create(:sponsorship, :sponsors_invoiced, sponsor: invoiced_org1,
          monthly_price_in_cents: (Sponsorship.count + 1) * 100)

        invoiced_sponsors = sponsorships.map(&:sponsor)
        puts "Invoiced sponsors: #{invoiced_sponsors.map(&:login).join(', ')}"

        first_invoiced_sponsor = invoiced_sponsors.first
        org_profile = first_invoiced_sponsor.organization_profile || FactoryBot.create(:organization_profile,
          organization: first_invoiced_sponsor)
        stripe_customer_id = unused_stripe_customer_id
        if stripe_customer_id.present? && org_profile.stripe_customer_id != stripe_customer_id
          puts "Setting Stripe customer ID for #{first_invoiced_sponsor}"
          org_profile.update!(stripe_customer_id: stripe_customer_id)
        end

        sponsorships.each do |sponsorship|
          tier = sponsorship.tier
          sponsor = sponsorship.sponsor
          sponsors_plan_sub = sponsor.sponsors_plan_subscription
          3.times do |i|
            Timecop.freeze(i.months.ago) do
              puts "\tCreating transaction and line item on #{Time.now}"
              transaction = FactoryBot.create(:billing_transaction, :zuora, user: sponsor,
                amount_in_cents: tier.monthly_price_in_cents)
              FactoryBot.create(:billing_transaction_line_item, :sponsors,
                plan_subscription: sponsors_plan_sub, billing_transaction: transaction, subscribable: tier)

              via_bulk_sponsorship = if tier.one_time?
                [true, false].sample
              else
                false
              end
              puts "\tCreating new sponsorship activity#{via_bulk_sponsorship ? ' via bulk sponsorship' : ''}"
              FactoryBot.create(:sponsors_activity, :new_sponsorship, tier_frequency: tier.frequency,
                sponsorable: sponsorship.sponsorable, timestamp: Time.now, sponsor: sponsor,
                via_bulk_sponsorship: via_bulk_sponsorship)
            end
          end
        end

        puts "\n\n"
      end

      sig { void }
      def create_billing_transactions
        puts "Creating billing transactions for #{approved_sponsorable_org}"
        default_tier = T.must(approved_sponsorable_org.sponsors_listing).default_tier
        upper_limit = 10

        (0..upper_limit).each do
          FactoryBot.create(:transaction,
            :sp_added,
            current_subscribable: default_tier,
            timestamp: 1.day.ago
          )
          FactoryBot.create(:transaction,
            :sp_changed,
            current_subscribable: default_tier,
            timestamp: 1.day.ago
          )
          FactoryBot.create(:transaction,
            :sp_cancelled,
            current_subscribable: default_tier,
            timestamp: 1.day.ago
          )
        end

        puts "\n\n"
      end

      sig { void }
      def create_public_repos_for_sponsorables
        repo_owners = [
          approved_sponsorable_user,
          draft_sponsorable_user,
          approved_sponsorable_org,
          approved_fiscal_host_member,
          draft_fiscal_host_member,
          not_ready_to_approve_maintainer,
          ready_to_approve_maintainer,
          patreon_maintainer,
        ]

        names_with_owners = repo_owners.flat_map do |repo_owner|
          [
            "#{repo_owner}/awesome-open-source-repo",
            "#{repo_owner}/GreatLibrary",
            "#{repo_owner}/gem_for_the_people",
            "#{repo_owner}/Some-Useful-Package",
          ]
        end

        existing_repo_nwos = Repository.with_names_with_owners(names_with_owners).public_scope.map(&:name_with_owner)

        nwos_to_create = names_with_owners - existing_repo_nwos
        return unless nwos_to_create.present?

        nwos_to_create.each do |nwo|
          puts "Creating public repo #{nwo}"
          Seeds::Objects::Repository.create_with_nwo(nwo: nwo, setup_master: false, is_public: true)
        end

        puts "\n\n"
      end

      sig { void }
      def create_zuora_sandbox_org
        login = "sponsors-bananas"
        org_exists = User.find_by(login: login)
        org = sponsorable_with_listing(
          listing_state: :approved,
          listing_args: [:for_org, :with_tiers, :with_one_time_tiers, :with_repository_tier],
          listing_options: { sponsorable_login: login },
        )
        unless org_exists
          T.must(org.admins.first).emails.first.verify!
          create_zuora_product_uuids(sponsorable: org.reload)
        end
      end

      sig { params(sponsorable: GitHubSponsors::Types::Sponsorable).void }
      def create_zuora_product_uuids(sponsorable:)
        listing = sponsorable.sponsors_listing
        raise "No listing found for #{sponsorable}" unless listing
        rate_plans = [
          {
            id: "2c92c0f97ab2243c017ac10c28ca7968",
            product_key: "#{listing.id}-month",
            billing_cycle: User::BillingDependency::MONTHLY_PLAN,
            charges: %w[
              2c92c0f87ab20b92017ac10c2b7a4466
              2c92c0f87ab20b92017ac10c2c7c4471
            ],
          },
          {
            id: "2c92c0f87ab20b88017ac10c2ebb4608",
            product_key: "#{listing.id}-year",
            billing_cycle: User::BillingDependency::YEARLY_PLAN,
            charges: %w[
              2c92c0f87ab20b88017ac10c31cc460f
              2c92c0f87ab20b88017ac10c32be4616
            ],
          },
          {
            id: "2c92c0f87ab20bdd017ac10c2438779d",
            product_key: "#{listing.id}-one_time",
            billing_cycle: Billing::ProductUUID::ONE_TIME_BILLING_CYCLE,
            charges: %w[
              2c92c0f97ab2242f017ac10c263f0814
              2c92c0f97ab2242f017ac10c27120821
            ],
          },
        ]

        rate_plans.each do |rate_plan|
          Billing::ProductUUID.create!(
            product_type: "sponsorable.sponsors_listing",
            product_key: rate_plan[:product_key],
            billing_cycle: rate_plan[:billing_cycle],
            zuora_product_id: "2c92c0f97ab22454017ac10c22d234e6",
            zuora_product_rate_plan_id: rate_plan[:id],
            zuora_product_rate_plan_charge_ids: {
              flat: rate_plan[:charges][0],  # The base charge rate plan
              fee: rate_plan[:charges][1],   # The fee charge rate plan
            },
          )
        end
      end

      sig { void }
      def create_linked_organization
        puts "Creating linked organization"

        org_that_pays = linked_org_sponsor

        unless org_that_pays.adminable_by?(monalisa)
          puts "Setting #{monalisa} as admin of #{org_that_pays}"
          org_that_pays.add_admin(monalisa)
        end

        org_that_gets_credit_admin = monthly_billed_sponsor
        org_that_gets_credit_login = "do-gooder-org"
        org_that_gets_credit = Organization.find_by(login: org_that_gets_credit_login) ||
          FactoryBot.create(:organization, admin: org_that_gets_credit_admin, login: org_that_gets_credit_login)

        unless org_that_gets_credit.adminable_by?(org_that_gets_credit_admin)
          org_that_gets_credit.add_admin(org_that_gets_credit_admin)
        end

        unless org_that_gets_credit.billing_manager?(org_billing_manager)
          puts "Setting #{org_billing_manager} as billing manager of #{org_that_gets_credit}"
          org_that_gets_credit.billing.add_manager(org_billing_manager, actor: org_that_gets_credit_admin)
        end

        org_profile = OrganizationProfile.find_by(organization_id: org_that_gets_credit.id,
          sponsoring_linked_organization_id: org_that_pays.id)
        unless org_profile
          FactoryBot.create(:organization_profile, organization: org_that_gets_credit,
            sponsoring_linked_organization: org_that_pays)
        end

        puts "\n\n"
      end

      sig { returns String }
      def fiscal_host_login
        SponsorsListing::FiscalHostDependency::OPEN_SOURCE_COLLECTIVE_LOGIN
      end

      sig { void }
      def create_fiscal_host
        fiscal_host = T.cast(sponsorable_with_listing(
          listing_state: :approved,
          listing_args: %i[fiscal_host with_stripe_account],
          listing_options: { sponsorable_login: fiscal_host_login },
        ), Organization)
        fiscal_host.admins.first.emails.first.verify!
        fiscal_host.add_member(monalisa)

        %i[waitlisted draft approved].each do |state|
          sponsorable = sponsorable_with_listing(
            listing_state: state,
            listing_args: [:with_tiers, :with_one_time_tiers, :for_org],
            listing_options: {
              parent_listing: fiscal_host.sponsors_listing,
              sponsorable_login: "#{state}-fiscal-host-member",
              min_custom_tier_amount_in_cents: 5_00,
              suggested_custom_tier_amount_in_cents: 10_00,
            },
            quiet: true
          )
        end
      end

      sig { void }
      def create_sponsors_activities
        puts "------"

        user_sponsorable = approved_sponsorable_user
        org_sponsorable = approved_sponsorable_org

        sponsorables = [user_sponsorable, org_sponsorable, org_with_featured]
        sponsors = [monthly_billed_sponsor, yearly_billed_sponsor, org_sponsor, linked_org_sponsor,
          paypal_sponsor]

        sponsors.each do |sponsor|
          repo = first_org_owned_repository_for(org_sponsorable)
          tier = published_tier_with_repository(org_sponsorable, repo)
          org_sponsorship = sponsorship_for(org_sponsorable, sponsor, active: false, tier: tier)
          create_activities_for(org_sponsorship, starting_at: 2.months.ago,
            traits: [:new_sponsorship, :cancelled_sponsorship])

          user_sponsorship = sponsorship_for(user_sponsorable, sponsor, active: false)
          create_activities_for(user_sponsorship, starting_at: 14.days.ago,
            traits: [:new_sponsorship, :cancelled_sponsorship])

          sponsorables.each do |sponsorable|
            sponsorship = sponsorship_for(sponsorable, sponsor)
            create_activities_for(sponsorship, starting_at: 7.days.ago,
              traits: [:new_sponsorship])
          end

          create_activities_for(org_sponsorship, starting_at: 6.days.ago,
            traits: [:pending_downgrade, :downgrade])
          create_activities_for(user_sponsorship, starting_at: 4.days.ago,
            traits: [:pending_upgrade, :upgrade])
        end

        # Create some sponsorships where the sponsorable is acting as the sponsor:
        sponsorship = sponsorship_for(org_sponsorable, user_sponsorable)
        create_activities_for(sponsorship, starting_at: 1.month.ago,
          traits: [:new_sponsorship])

        sponsorship = sponsorship_for(user_sponsorable, org_sponsorable)
        create_activities_for(sponsorship, starting_at: 14.days.ago,
          traits: [:new_sponsorship])

        puts "\n\n"
      end

      sig { void }
      def create_potential_sponsorships
        puts "------"
        creator = monalisa

        puts "Creating pending potential sponsorship with custom message..."
        potential_sponsor = FactoryBot.create(:organization)
        FactoryBot.create(:profile, user: potential_sponsor,
          name: [Faker::Company.name, Faker::Company.suffix].join(" "))
        potential_sponsorship1 = FactoryBot.create(:potential_sponsorship, :with_profile, :with_message,
          created_by: creator, potential_sponsor: potential_sponsor)
        puts "Potential sponsorship from #{potential_sponsor} to " \
          "#{potential_sponsorship1.potential_sponsorable} created"

        puts "Verifying email address for pending potential sponsorable..."
        potential_sponsorship1.potential_sponsorable.emails.first&.verify!

        puts "Creating acknowledged potential sponsorship..."
        potential_sponsorship2 = FactoryBot.create(:potential_sponsorship, :acknowledged, :with_profile,
          created_by: creator)
        puts "Potential sponsorship from #{potential_sponsorship2.potential_sponsor} to " \
          "#{potential_sponsorship2.potential_sponsorable} created"

        puts "Creating potential sponsorship where the Sponsors listing was created..."
        potential_sponsorship3 = FactoryBot.create(:potential_sponsorship, :sponsors_listing_created, :with_profile,
          created_by: creator)
        puts "Potential sponsorship from #{potential_sponsorship3.potential_sponsor} to " \
          "#{potential_sponsorship3.potential_sponsorable} created"

        puts "Creating potential sponsorship where the sponsorship was created..."
        potential_sponsorship4 = FactoryBot.create(:potential_sponsorship, :sponsorship_created, :with_profile,
          created_by: creator)
        puts "Potential sponsorship from #{potential_sponsorship4.potential_sponsor} to " \
          "#{potential_sponsorship4.potential_sponsorable} created"

        potential_sponsorables = [potential_sponsorship1, potential_sponsorship2,
          potential_sponsorship3, potential_sponsorship4].map(&:potential_sponsorable)

        public_repos = Repository.public_scope.limit(10).to_a

        puts "Creating public repos and contributions from potential sponsorables..."
        potential_sponsorables.each do |potential_sponsorable|
          name_with_owner = "#{potential_sponsorable}/repo-#{SecureRandom.hex(10)}"
          Seeds::Objects::Repository.create_with_nwo(nwo: name_with_owner, setup_master: false, is_public: true)

          Seeds::Objects::Issue.create(repo: public_repos.sample, actor: potential_sponsorable)
        end

        puts "\n\n"
      end

      sig { void }
      def create_abuse_reports
        puts "------"
        users = [
          User.find_by(login: "waitlisted-user"),
          User.find_by(login: "spammy-user"),
        ].compact
        users.each do |user|
          if user.received_abuse_reports.none?
            puts "Creating abuse report for #{user}"
            FactoryBot.create(:abuse_report, :user_report, reported_user: user)
          end
        end
        puts "\n\n"
      end

      sig { void }
      def create_fraud_reviews
        spammy_listing = User.find_by(login: "spammy-user")&.sponsors_listing
        raise "Spammy listing not found" unless spammy_listing

        total_reviews_created = 0
        SponsorsFraudReview.states.keys.each do |state_key|
          create_fraud_review_for(sponsors_listing: spammy_listing, state: state_key)
          total_reviews_created += 1
        end

        # Create enough to enable pagination
        until total_reviews_created > Stafftools::Sponsors::FraudReviews::ListComponent::DISPLAY_EXPAND
          create_fraud_review_for(sponsors_listing: spammy_listing, state: "pending",
            with_fraud_flagged_sponsor: true)
          total_reviews_created += 1
        end

        puts "\n\n"
      end

      sig do
        params(
          sponsors_listing: SponsorsListing,
          state: T.any(Symbol, String),
          with_fraud_flagged_sponsor: T::Boolean
        ).void
      end
      def create_fraud_review_for(sponsors_listing:, state:, with_fraud_flagged_sponsor: false)
        if !SponsorsFraudReview.states[state]
          raise "Fraud review state #{state} is invalid"
        end

        puts "Creating #{state} fraud review for #{sponsors_listing.sponsorable_login}"

        review = if state == "pending"
          FactoryBot.create(:sponsors_fraud_review,
            state: SponsorsFraudReview.states[state],
            sponsors_listing: sponsors_listing,
          )
        else
          FactoryBot.create(:sponsors_fraud_review,
            state: SponsorsFraudReview.states[state],
            sponsors_listing: sponsors_listing,
            reviewer_id: monalisa.id,
            reviewed_at: Time.now
          )
        end

        if with_fraud_flagged_sponsor
          FactoryBot.create(:fraud_flagged_sponsor, :all_matching, sponsors_fraud_review: review)
        end
      end

      sig { void }
      def create_user_profiles
        create_profile_for(approved_sponsorable_user, name: Faker::Superhero.name,
          bio: "Writing open source while orbiting #{Faker::Space.star} :star:",
          twitter_username: "sampleTwitter")
        create_profile_for(approved_sponsorable_org, name: Faker::Kpop.boy_bands,
          blog: Faker::Internet.url(host: "example.com"))
        create_profile_for(draft_sponsorable_user, name: Faker::Superhero.name,
          bio: ":moon: b e s t . d e v . o n . *#{Faker::Space.moon}* :moon:", company: Faker::Kpop.girl_groups)
        create_profile_for(draft_fiscal_host_member, name: Faker::BossaNova.artist)
        create_profile_for(approved_fiscal_host_member, name: Faker::GreekPhilosophers.name,
          bio: Faker::GreekPhilosophers.quote)
        create_profile_for(not_ready_to_approve_maintainer, name: Faker::Kpop.girl_groups,
          bio: "My favorite band is #{Faker::Kpop.iii_groups}", twitter_username: "someTwitter")
        create_profile_for(ready_to_approve_maintainer, name: Faker::Kpop.ii_groups,
          blog: Faker::Internet.url(host: "example.com"), bio: Faker::GreekPhilosophers.quote)
        create_profile_for(disabled_sponsorable_user, name: Faker::TvShows::TheExpanse.character,
          location: Faker::Space.star_cluster)
        puts "\n\n"
      end

      sig do
        params(
          user: User,
          name: T.nilable(String),
          bio: T.nilable(String),
          twitter_username: T.nilable(String),
          company: T.nilable(String),
          blog: T.nilable(String),
          location: T.nilable(String)
        ).returns(Profile)
      end
      def create_profile_for(user, name: nil, bio: nil, twitter_username: nil, company: nil, blog: nil, location: nil)
        profile = user.profile

        unless profile
          puts "Creating profile for #{user}"
          profile = FactoryBot.create(:profile, user: user, name: name, bio: bio, twitter_username: twitter_username,
            location: location)
        end

        profile.assign_attributes(
          name: name,
          bio: bio,
          company: company,
          blog: blog,
          twitter_username: twitter_username,
          location: location,
        )
        profile.save! if profile.changed?

        profile
      end

      sig { void }
      def create_user_metadata
        users = [
          approved_sponsorable_user,
          approved_sponsorable_org,
          monthly_billed_sponsor,
          yearly_billed_sponsor,
          draft_fiscal_host_member,
          approved_fiscal_host_member,
          draft_sponsorable_user,
          not_ready_to_approve_maintainer,
          ready_to_approve_maintainer,
          patreon_maintainer,
          disabled_sponsorable_user,
          org_sponsor,
          paypal_sponsor,
          patreon_sponsor,
          invoiced_org1,
          invoiced_org2,
        ]

        users.each do |user|
          user_metadata = user.user_metadata
          metadata_attrs = {
            repository_count: user.public_repositories.count,
            repository_public_and_private_count: user.repositories.count,
            sponsors_count: user.public_sponsors_count,
            sponsors_public_and_private_count: user.public_and_private_sponsors_count,
            sponsoring_count: user.public_sponsoring_count,
            sponsoring_public_and_private_count: user.public_and_private_sponsoring_count,
            inactive_sponsors_count: user.inactive_public_sponsors_count,
            inactive_sponsors_public_and_private_count: user.inactive_public_and_private_sponsors_count,
            inactive_sponsoring_count: user.inactive_public_sponsoring_count,
            inactive_sponsoring_public_and_private_count: user.inactive_public_and_private_sponsoring_count,
          }

          unless user_metadata
            puts "Creating user metadata record for #{user}"
            user_metadata = FactoryBot.create(:user_metadata, metadata_attrs.merge(user: user))
          end

          metadata_updates = {}
          metadata_attrs.each do |field, value|
            unless user_metadata[field] == value
              metadata_updates[field] = value
            end
          end

          if metadata_updates.any?
            puts "Updating user metadata record for #{user}"
            user_metadata.update!(metadata_updates)
          end
        end
      end

      private

      sig do
        params(
          sponsorship: Sponsorship,
          starting_at: T.any(Time, ActiveSupport::TimeWithZone),
          traits: T::Array[Symbol]
        ).void
      end
      def create_activities_for(sponsorship, starting_at:, traits:)
        sponsor = T.must(sponsorship.sponsor)
        sponsorable = T.must(sponsorship.sponsorable)
        tier = T.must(sponsorship.tier)

        timestamp = T.let(starting_at, T.any(Time, ActiveSupport::TimeWithZone))
        traits.each do |trait|
          repo_id = repository_id_for(trait, tier)
          old_repo_id = old_repository_id_for(trait, tier)
          activity = sponsors_activity_for(sponsorable, sponsor, trait: trait)
          via_bulk_sponsorship = if trait == :new_sponsorship
            [true, false].sample
          else
            false
          end

          if activity && (activity.repository_id != repo_id || activity.old_repository_id != old_repo_id)
            puts "Updating #{trait} activity for #{sponsor} => #{sponsorable} to have repo and old repo IDs"
            activity.update!(repository_id: repo_id, old_repository_id: old_repo_id,
              via_bulk_sponsorship: via_bulk_sponsorship)
          elsif activity.nil?
            puts "Creating #{trait} activity for #{sponsor} => #{sponsorable}"
            FactoryBot.create(:sponsors_activity, trait, sponsorable: sponsorable,
              timestamp: timestamp, sponsor: sponsor, repository_id: repo_id, old_repository_id: old_repo_id,
              via_bulk_sponsorship: via_bulk_sponsorship)
          end

          timestamp += 1.day
        end
      end

      sig { params(trait: Symbol, tier: SponsorsTier).returns(T.nilable(Integer)) }
      def repository_id_for(trait, tier)
        actions_with_a_repo = [:new_sponsorship, :cancelled_sponsorship, :pending_downgrade, :pending_upgrade,
          :downgrade, :upgrade]
        tier.repository_id if actions_with_a_repo.include?(trait)
      end

      sig { returns Organization }
      def org_repo_owner
        return @org_repo_owner if defined?(@org_repo_owner)
        @org_repo_owner = Organization.find_by(login: "OrgWhoOwnsRepos")

        unless @org_repo_owner
          puts "Creating org OrgWhoOwnsRepos with admin #{monalisa}"
          @org_repo_owner = FactoryBot.create(:organization, login: "OrgWhoOwnsRepos", admin: monalisa)
        end

        unless @org_repo_owner.adminable_by?(monalisa)
          puts "Setting #{monalisa} as org admin of #{@org_repo_owner}"
          @org_repo_owner.add_admin(monalisa)
        end

        @org_repo_owner
      end

      sig { params(org: Organization).returns(Repository) }
      def first_org_owned_repository_for(org)
        org_owned_repository_for(org, repo_name: "superSecretRepo")
      end

      sig { params(org: Organization).returns(Repository) }
      def second_org_owned_repository_for(org)
        org_owned_repository_for(org, repo_name: "Fancy-Private-Demo")
      end

      sig { params(org: Organization, repo_name: String).returns(Repository) }
      def org_owned_repository_for(org, repo_name:)
        repo = org.private_repositories.find_by(name: repo_name)
        return repo if repo

        name_with_owner = "#{org}/#{repo_name}"
        puts "Creating private repository #{name_with_owner}"
        Seeds::Objects::Repository.create_with_nwo(
          nwo: name_with_owner,
          setup_master: false,
          is_public: false,
        )
      end

      sig { params(sponsorable: GitHubSponsors::Types::Sponsorable, repo: Repository).returns(SponsorsTier) }
      def published_tier_with_repository(sponsorable, repo)
        listing = sponsorable.sponsors_listing
        raise "No listing found for #{sponsorable}" unless listing
        SponsorsTier.with_published_state.find_by(sponsors_listing_id: listing.id, repository_id: repo.id) ||
          FactoryBot.create(:sponsors_tier, :published, sponsors_listing: listing, repository: repo)
      end

      sig { params(trait: Symbol, tier: SponsorsTier).returns(T.nilable(Integer)) }
      def old_repository_id_for(trait, tier)
        # Only tier changes can have an old repository that the sponsor might be losing access to:
        return unless [:pending_downgrade, :pending_upgrade, :downgrade, :upgrade].include?(trait)

        # Not all tier changes result in the sponsor losing repository access, so randomize it:
        if [true, false].sample
          sponsorable = T.must(tier.sponsorable)
          org = T.cast(sponsorable.organization? ? sponsorable : org_repo_owner, Organization)
          repo = second_org_owned_repository_for(org)

          if sponsorable.user? && !repo.adminable_by?(sponsorable)
            puts "Setting #{sponsorable} as admin of repo #{repo.nwo}"
            repo.add_member(sponsorable, action: :admin)
          end

          repo.id
        end
      end

      sig do
        params(
          sponsorable: GitHubSponsors::Types::Sponsorable,
          sponsor: GitHubSponsors::Types::Sponsor,
          trait: Symbol
        ).returns(T.nilable(SponsorsActivity))
      end
      def sponsors_activity_for(sponsorable, sponsor, trait:)
        action = case trait
        when :new_sponsorship, :cancelled_sponsorship then trait
        when :pending_downgrade, :pending_upgrade then :pending_change
        when :downgrade, :upgrade then :tier_change
        end

        unless action
          raise "Don't know what sponsors_activities.action should be for trait '#{trait}'"
        end

        SponsorsActivity.where(sponsorable_id: sponsorable, sponsor_id: sponsor, action: action).last
      end

      sig { params(user: T.any(User, Organization, String)).returns(String) }
      def login_url_for(user)
        UrlHelpers.login_url(
          login: user, protocol: GitHub.scheme, host: GitHub.host_name, port: codespaces_port
        )
      end

      sig { returns T::Array[String] }
      def time_zone_names
        @time_zone_names ||= ActiveSupport::TimeZone.all.map(&:name)
      end

      sig { returns T::Array[String] }
      def all_country_codes
        @all_country_codes ||= ::TradeControls::Countries.currently_unsanctioned.map { |(_, code, _, _)| code }
      end

      sig { returns T.nilable(T.any(String, Integer)) }
      def codespaces_port
        return unless ENV["CODESPACES"]
        return @codespaces_port if defined?(@codespaces_port)

        path = ENV["GITHUG_WEB_TUNNEL_PATH"].to_s
        web_tunnel = JSON.parse(File.read(path))
        @codespaces_port = web_tunnel["port"]
      rescue TypeError, JSON::ParserError, Errno::ENOENT
        @codespaces_port = nil
      end

      sig { params(country_code: String).returns(T::Array[String]) }
      def time_zone_names_for(country_code)
        country_time_zone_names = ActiveSupport::TimeZone.country_zones(country_code).map(&:name)
        # Include aliases like "America/Chicago" for supported zones like "Central Time (US & Canada)":
        aliases = country_time_zone_names
          .map { |time_zone_name| ActiveSupport::TimeZone::MAPPING[time_zone_name] }
          .compact
        country_time_zone_names + aliases
      end

      sig { params(user: T.any(User, Organization, Billing::DeadUser), country_code: String).void }
      def ensure_time_zone_for(user:, country_code:)
        return if user.is_a?(Billing::DeadUser)
        available_time_zones = time_zone_names_for(country_code)
        if user.time_zone_name.blank? || !available_time_zones.include?(user.time_zone_name)
          time_zone_name = available_time_zones.sample
          puts "Setting #{user}'s time zone to #{time_zone_name}"
          user.update!(time_zone_name: time_zone_name)
        end
      end

      # Internal: Get a mapping of time zone names to a country in that time zone.
      #
      # Returns a hash like "Central Time (US & Canada)" => "US".
      sig { returns T::Hash[String, String] }
      def country_codes_by_time_zone
        return @country_codes_by_time_zone if @country_codes_by_time_zone
        @country_codes_by_time_zone = {}
        all_country_codes.each do |country_code|
          time_zone_names_for(country_code).each do |time_zone_name|
            @country_codes_by_time_zone[time_zone_name] ||= country_code
          end
        end
        @country_codes_by_time_zone
      end

      sig { params(time_zone_name: String).returns(T.nilable(String)) }
      def country_of_residence_for_time_zone(time_zone_name)
        return if time_zone_name.blank?
        country_codes_by_time_zone[time_zone_name]
      end

      sig do
        params(
          listing_state: T.any(String, Symbol),
          listing_options: T::Hash[T.any(String, Symbol), T.untyped],
          listing_args: T::Array[T.untyped],
          quiet: T::Boolean
        ).returns(GitHubSponsors::Types::Sponsorable)
      end
      def sponsorable_with_listing(listing_state:, listing_options:, listing_args: [], quiet: false)
        require_relative "../factory_bot_loader"

        listing_args << listing_state

        sponsorable = User.find_by(login: listing_options[:sponsorable_login])
        unless sponsorable
          sponsorable_login = listing_options[:sponsorable_login]
          if sponsorable_login.present?
            puts "Creating Sponsors listing for #{sponsorable_login}"
          else
            puts "Creating Sponsors listing"
          end
          sponsorable = T.unsafe(FactoryBot).create(:sponsors_listing, *listing_args, **listing_options).sponsorable
        end

        if sponsorable.time_zone_name.blank?
          time_zone_name = time_zone_names.sample
          puts "Setting #{sponsorable}'s time zone to #{time_zone_name}"
          sponsorable.update!(time_zone_name: time_zone_name)
        end

        unless sponsorable.reload_sponsors_listing
          options = { sponsorable: sponsorable }.merge(listing_options)
          puts "#{sponsorable.type} #{sponsorable} existed, creating Sponsors listing..."
          T.unsafe(FactoryBot).create(:sponsors_listing, *listing_args, options)
        end

        listing = sponsorable.reload_sponsors_listing
        existing_tiers = listing.published_sponsors_tiers.to_a

        country_of_residence = listing_options[:country_of_residence] ||
          country_of_residence_for_time_zone(sponsorable.time_zone_name)
        if country_of_residence && listing.active_stripe_connect_account
          listing.active_stripe_connect_account.update!(country: country_of_residence)
        end
        if country_of_residence && listing.country_of_residence != country_of_residence
          puts "Updating #{sponsorable}'s Sponsors country of residence to #{country_of_residence}"
          listing.update!(country_of_residence: country_of_residence)
        end

        unless listing_state == listing.current_state_name
          puts "Updating #{sponsorable}'s Sponsors listing to state=#{listing_state}"
          listing.update_attribute(:state, listing_state)
        end

        if listing_args.include?(:with_tiers) && existing_tiers.select(&:recurring?).empty?
          tier1, tier2 = FactoryBot.create_list(:sponsors_tier, 2, :published, sponsors_listing: listing)
          puts "Created #{tier1.name}, #{tier2.name} tiers for @#{sponsorable}"
        end

        if listing_args.include?(:with_one_time_tiers) && existing_tiers.select(&:one_time?).empty?
          tier1, tier2 = FactoryBot.create_list(:sponsors_tier, 2, :published, :one_time, sponsors_listing: listing)
          puts "Created #{tier1.name}, #{tier2.name} tiers for @#{sponsorable}"
        end

        if listing_args.include?(:with_repository_tier)
          recurring_repo_tiers = existing_tiers.select { |tier| tier.has_repository? && tier.recurring? }
          if recurring_repo_tiers.empty?
            monthly_price = (listing.sponsors_tiers.maximum(:monthly_price_in_cents) || 0) + 1_00
            tier = FactoryBot.create(:sponsors_tier, :published, :with_repository, sponsors_listing: listing,
              monthly_price_in_cents: monthly_price)
            puts "Created #{tier.name} tier with sponsors-only repository for @#{sponsorable}"
          end
        end

        unless listing_options[:min_custom_tier_amount_in_cents] == listing.min_custom_tier_amount_in_cents
          new_cents = listing_options[:min_custom_tier_amount_in_cents]
          if new_cents
            dollars = new_cents / 100
            puts "Setting @#{sponsorable}'s min custom amount to $#{dollars}"
          else
            puts "Clearing @#{sponsorable}'s min custom amount"
          end
          listing.update!(min_custom_tier_amount_in_cents: new_cents)
        end

        # Make sure the sponsorable has a payment method so we can create sponsorships from them as well:
        sponsorable.update!(billing_type: "card") unless sponsorable.billing_type == "card"
        FactoryBot.create(:credit_card_customer_account, user: sponsorable) unless sponsorable.reload_customer_account
        FactoryBot.create(:billing_plan_subscription, user: sponsorable) unless sponsorable.reload_plan_subscription

        set_sponsorable_github_signup_time(sponsorable)
        print_details(sponsorable) unless quiet

        sponsorable
      end

      sig do
        params(
          sponsorable: GitHubSponsors::Types::Sponsorable,
          sponsor: T.any(GitHubSponsors::Types::Sponsor, Billing::DeadUser),
          active: T::Boolean,
          tier: T.nilable(SponsorsTier),
          billing_transaction: T.nilable(Billing::BillingTransaction)
        ).returns(Sponsorship)
      end
      def sponsorship_for(sponsorable, sponsor, active: true, tier: nil, billing_transaction: nil)
        sponsorship = Sponsorship.find_by(sponsorable_id: sponsorable, sponsor_id: sponsor)

        unless sponsorship
          puts "Creating sponsorship from #{sponsor} => #{sponsorable}"
          options = { sponsorable: sponsorable, sponsor: sponsor, privacy_level: [:private, :public].sample }
          sponsorship = if billing_transaction
            FactoryBot.create(:sponsorship, options)
          else
            FactoryBot.create(:sponsorship, :with_billing_transaction_and_line_item, options)
          end
        end

        sponsorship.update!(subscribable_id: tier.id) if tier && !sponsorship.equal_tier?(tier)
        sponsorship.update!(active: active) unless sponsorship.active == active

        billing_transaction ||= billing_transaction_for_sponsorship(sponsorship)
        non_fee_line_item = line_item_for_sponsorship(billing_transaction, sponsorship: sponsorship)

        expected_quantity = active ? 1 : 0
        subscription_item = sponsorship.subscription_item
        unless subscription_item.quantity == expected_quantity
          subscription_item.update_column(:quantity, expected_quantity)
        end
        unless subscription_item.subscribable_id == sponsorship.subscribable_id
          subscription_item.update_column(:subscribable_id, sponsorship.subscribable_id)
        end

        sponsorship
      end

      sig { params(sponsorship: Sponsorship).returns(Billing::BillingTransaction) }
      def billing_transaction_for_sponsorship(sponsorship)
        sponsor = sponsorship.sponsor
        tier = T.must(sponsorship.tier)
        sponsorable = sponsorship.sponsorable
        billing_transaction = Billing::BillingTransaction.for_user(sponsor)
          .where("amount_in_cents >= ?", tier.monthly_price_in_cents)
          .last

        unless billing_transaction
          puts "Creating billing transaction for #{sponsor} for their #{tier.name} sponsorship of #{sponsorable}"
          billing_transaction = FactoryBot.create(:billing_transaction, :zuora, user: sponsor,
            amount_in_cents: tier.monthly_price_in_cents, platform_transaction_id: SecureRandom.hex(3),
            country: "USA", region: "California", postal_code: "90210")
        end

        billing_transaction
      end

      sig do
        params(
          billing_transaction: Billing::BillingTransaction,
          sponsorship: Sponsorship
        ).returns(Billing::BillingTransaction::LineItem)
      end
      def line_item_for_sponsorship(billing_transaction, sponsorship:)
        sponsor = T.must(sponsorship.sponsor)
        tier = T.must(sponsorship.tier)
        sponsorable = sponsorship.sponsorable
        sponsors_line_items = billing_transaction.line_items.sponsorships
          .for_subscribable_and_user(tier.id, sponsor.id)

        flat_line_item = sponsors_line_items.detect { |line_item| !line_item.sponsors_fee? }
        unless flat_line_item
          puts "Creating line item for #{sponsor} for their #{tier.name} sponsorship of #{sponsorable}"
          flat_line_item = FactoryBot.create(:billing_transaction_line_item, :sponsors,
            billing_transaction: billing_transaction, subscribable: tier)
        end

        fee_line_item = sponsors_line_items.detect(&:sponsors_fee?)
        unless fee_line_item
          fee_amount = Sponsorship.fee_at_sponsorship_payment_time_for(sponsor: sponsor, flat_price: tier.base_price)
          if fee_amount > 0
            puts "Creating fee line item for #{sponsor}'s #{tier.name} sponsorship of #{sponsorable}"
            FactoryBot.create(:billing_transaction_line_item, :sponsors_fee, subscribable: tier,
              amount_in_cents: fee_amount.cents, billing_transaction: billing_transaction)
          end
        end

        total_transaction_cents = billing_transaction.line_items.sum(:amount_in_cents)
        unless billing_transaction.amount_in_cents == total_transaction_cents
          total = Billing::Money.new(total_transaction_cents)
          puts "Updating #{sponsor}'s billing transaction #{billing_transaction.transaction_id} to #{total.format}..."
          billing_transaction.update!(amount_in_cents: total_transaction_cents)
        end

        flat_line_item
      end

      sig { params(sponsorable: GitHubSponsors::Types::Sponsorable, count: Integer, type: String).void }
      def add_sponsorships_to(sponsorable, count, type)
        args = [:sponsorship]
        args << :from_org if type == "org"
        count.times do
          FactoryBot.create(*args,
            sponsorable: sponsorable
          )
        end
      end

      sig { params(sponsor: GitHubSponsors::Types::Sponsor, count: Integer, type: String).void }
      def add_sponsorships_from(sponsor, count, type)
        args = [:sponsorship]
        args << :with_org_sponsorable if type == "org"
        count.times do
          FactoryBot.create(*args,
            sponsor: sponsor
          )
        end
      end

      sig { params(sponsorable: GitHubSponsors::Types::Sponsorable).void }
      def print_details(sponsorable)
        listing = T.must(sponsorable.sponsors_listing)
        adjective = listing.fiscal_host? ? "fiscal host" : sponsorable.type.downcase
        puts "------"
        puts "Created #{listing.current_state} #{adjective}: #{sponsorable}"
        puts "Login here: #{login_url_for_sponsorable(sponsorable)}"
        puts "Sponsorship page: #{sponsorship_url_for(sponsorable)}"
        puts "Sponsors dashboard: #{sponsors_dashboard_url_for(sponsorable)}"
      end

      sig { params(sponsorable: GitHubSponsors::Types::Sponsorable).returns(String) }
      def login_url_for_sponsorable(sponsorable)
        login = sponsorable.user? ? sponsorable.login : T.must(sponsorable.admins.first).login

        UrlHelpers.login_url(
          login: login,
          return_to: UrlHelpers.sponsorable_path(id: sponsorable.display_login),
          protocol: GitHub.scheme,
          host: GitHub.host_name,
          port: codespaces_port,
        )
      end

      sig { params(sponsorable: GitHubSponsors::Types::Sponsorable).returns(String) }
      def sponsorship_url_for(sponsorable)
        UrlHelpers.sponsorable_url(
          id: sponsorable.display_login,
          protocol: GitHub.scheme,
          host: GitHub.host_name,
          port: codespaces_port,
        )
      end

      sig { params(sponsorable: GitHubSponsors::Types::Sponsorable).returns(String) }
      def sponsors_dashboard_url_for(sponsorable)
        UrlHelpers.sponsorable_dashboard_url(sponsorable,
          protocol: GitHub.scheme, host: GitHub.host_name, port: codespaces_port)
      end
    end
  end
end
