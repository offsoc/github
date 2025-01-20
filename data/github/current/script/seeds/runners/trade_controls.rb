# typed: strict
# frozen_string_literal: true

require_relative "../runner"
# Do not require anything else here. If you need something for your runner, put that in `self.run`.
# This makes sure the boot time of our seeds stays low.

module Seeds
  class Runner
    # Usage: bin/seed trade_controls
    # Usage: bin/seed trade_controls --toggle-flags <enable/disable>
    class TradeControls < Seeds::Runner
      extend T::Sig

      FLAG_TYPES = T.let({
        enable: "enable",
        disable: "disable",
      }.freeze, T::Hash[Symbol, String])

      FLAGS = T.let(%w(
        data_collection_user_to_org_transform
        live_sdn_screening
        sdn_organization_suspension_v3
        tld_sdn_suspension
      ).freeze, T::Array[String])

      sig { returns(String) }
      def self.help
        <<~EOF
        Seed accounts with Trade Controls restrictions for local development

        Seeding

        - Creates user and orgs without billing info and trade screening statuses

        - Creates user and orgs with billing info and trade screening statuses
        EOF
      end

      sig { params(options: T::Hash[Symbol, String]).void }
      def self.run(options = {})
        require_relative "../factory_bot_loader"
        new.run(options)
      end

      sig { params(options: T::Hash[Symbol, String]).void }
      def run(options)
        toggle_feature_flags(toggle_flags: options[:toggle_flags])
        create_trade_controls_admins

        puts "\n\n"
        if options.key?(:add_trade_controls_to)
          user = User.find_by!(login: options[:add_trade_controls_to])
          add_trade_controls_to(user, options[:screening_status])
        else
          create_all
        end
      end

      sig { void }
      def create_all
        puts "Creating users and orgs with trade screening status with no payment info"
        puts "------"
        create_screened_accounts(with_billing: false)

        puts "Creating users and orgs with trade screening status with payment info"
        puts "------"
        create_screened_accounts(with_billing: true)

        puts "------"
      end

      private

      sig { params(toggle_flags: T.nilable(String)).void }
      def toggle_feature_flags(toggle_flags:)
        message = ""
        action = ""
        case toggle_flags
        when FLAG_TYPES[:enable]
          message = "on"
          action = "enable"
        when FLAG_TYPES[:disable]
          message = "off"
          action = "disable"
        else
          puts "Skipping toggling feature flags because :toggle_flags enum option wasn't passed #{toggle_flags}"
          puts "------"
          return
        end

        puts "Turning #{message} feature flags for Trade Controls"
        puts "------"

        FLAGS.each do |flag|
          Seeds::Objects::FeatureFlag.toggle(action: action, feature_flag: flag)
        end
      end

      sig { void }
      def create_trade_controls_admins
        puts "\n\n"
        puts "Creating admin users for Trade Controls"
        puts "------"
        execute_admin = create_user(login: "trade-execute", with_billing: false)
        Seeds::Objects::User.add_stafftools(execute_admin)
        view_admin = create_user(login: "trade-view", with_billing: false)
        Seeds::Objects::User.add_stafftools(view_admin)
        all_admin = create_user(login: "trade-all", with_billing: false)
        Seeds::Objects::User.add_stafftools(all_admin)

        execute_role = StafftoolsRole.find_by(name: "can-execute-trade-controls") || StafftoolsRole.new(name: "can-execute-trade-controls")
        view_role = StafftoolsRole.find_by(name: "can-view-trade-controls") || StafftoolsRole.new(name: "can-view-trade-controls")

        puts "Adding stafftools roles to admins for Trade Controls"
        puts "------"

        execute_admin.stafftools_roles << execute_role unless execute_admin.stafftools_roles.find_by(name: execute_role.name)

        view_admin.stafftools_roles << view_role unless view_admin.stafftools_roles.find_by(name: view_role.name)

        all_admin.stafftools_roles << execute_role unless all_admin.stafftools_roles.find_by(name: execute_role.name)
        all_admin.stafftools_roles << view_role unless all_admin.stafftools_roles.find_by(name: view_role.name)

        puts "Login for #{execute_admin}: #{login_url_for(execute_admin)}"
        puts "Login for #{view_admin}: #{login_url_for(view_admin)}"
        puts "Login for #{all_admin}: #{login_url_for(all_admin)}"
      end

      sig { params(login: String, with_billing: T::Boolean, state: String).returns(User) }
      def create_user(login:, with_billing:, state: "not_screened")
        args = if with_billing
          [:credit_card_user]
        else
          [:user]
        end

        user = User.find_by(login: login) || FactoryBot.create(*args, :verified, login: login)
        FactoryBot.create(:repository, name: "public", owner: user) if user.public_repositories.count == 0
        FactoryBot.create(:repository, name: "private", public: false, owner: user) if user.private_repositories.count == 0
        return user if user.trade_screening_record.persisted?

        last_screening_date = (state == "not_screened" ? nil : Time.now)
        FactoryBot.create(:account_screening_profile,
          msft_trade_screening_status: state,
          last_trade_screen_date: last_screening_date,
          owner: user
        ).owner
      end

      sig { params(login: String, with_billing: T::Boolean, admin: User, with_corporate_terms: T::Boolean, state: String).returns(Organization) }
      def create_org(login:, with_billing:, admin:, with_corporate_terms: false, state: "not_screened")
        args = if with_billing
          [:credit_card_org]
        else
          [:organization]
        end

        args.push(:with_corporate_terms) if with_corporate_terms

        org = Organization.find_by(login: login) || FactoryBot.create(*args, login: login, admin: admin, plan: :free)
        FactoryBot.create(:repository, name: "public", owner: org) if org.public_repositories.count == 0
        FactoryBot.create(:repository, name: "private", public: false, owner: org) if org.private_repositories.count == 0
        return org if org.trade_screening_record.persisted?

        last_screening_date = (state == "not_screened" ? nil : Time.now)
        unless with_corporate_terms
          admin.link_trade_screening_record_to_org(organization: org)
          return org
        end

        FactoryBot.create(:account_screening_profile,
          :with_org,
          msft_trade_screening_status: state,
          last_trade_screen_date: last_screening_date,
          owner: org
        ).owner
      end

      sig { params(with_billing: T::Boolean).void }
      def create_screened_accounts(with_billing:)
        %w[not_screened no_hit ingestion_error hit_in_review lic_r lic_a].each do |state|
          state_name = state.gsub("_", "-")
          postfix = with_billing ? "with-billing" : "no-billing"
          user_login = "user-#{state_name}-#{postfix}"
          user2_login = "user2-#{state_name}-#{postfix}"
          stos_org_login = "stos-org-#{state_name}-#{postfix}"
          ctos_org_login = "ctos-org-#{state_name}-#{postfix}"

          user = create_user(login: user_login, with_billing: with_billing, state: state)
          user2 = create_user(login: user2_login, with_billing: with_billing, state: state)

          stos_org = create_org(login: stos_org_login, with_billing: with_billing, admin: user, state: state)
          ctos_org = create_org(login: ctos_org_login, with_billing: with_billing, admin: user, with_corporate_terms: true, state: state)

          stos_org.add_admin(user2)
          ctos_org.add_admin(user2)

          puts "Created orgs #{stos_org} and #{ctos_org}"
          puts "* Added admins #{user} and #{user2} to both orgs"
          puts "* #{user} login here: #{login_url_for(user)}"
          puts "* #{user2} login here: #{login_url_for(user2)}"
          puts "\n"
        end
        puts "\n"
      end

      sig { params(user: User).returns(String) }
      def login_url_for(user)
        UrlHelpers.login_url(
          login: user, protocol: GitHub.scheme, host: GitHub.host_name
        )
      end

      sig { params(user: User, screening_status: T.nilable(String)).returns(AccountScreeningProfile) }
      def add_trade_controls_to(user, screening_status)
        if user.blank? || screening_status.blank?
          raise Runner::RunnerError, "must specify both user name('#{user}') and screening_status('#{screening_status}') to add trade controls"
        end

        FactoryBot.create(:account_screening_profile,
          owner: user,
          msft_trade_screening_status: screening_status
        )
      end
    end
  end
end
