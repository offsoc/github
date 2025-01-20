# frozen_string_literal: true

# Do not require anything here. If you need something else, require it in the method that needs it.
# This makes sure the boot time of our seeds stays low.

module Seeds
  module Objects
    class User
      def self.monalisa
        create(login: "monalisa", email: "octocat@github.com")
      end

      def self.collaborator
        create(login: "collaborator", email: "collaborator@github.com")
      end

      # enables two factor authentication for the given user and registers an app-based authenticator
      def self.two_factor_enable!(user:)
        if (cred = user.two_factor_credential)
          return cred
        end

        otp_secret = TwoFactorCredential.generate_secret
        two_factor_cred = TwoFactorCredential.new(user: user)
        two_factor_cred.generate_recovery_secret!
        two_factor_cred.recovery_codes_viewed!
        two_factor_cred.save!

        TotpAppRegistration.create!(
          user: user,
          encrypted_otp_secret: otp_secret,
        )
      end

      def self.add_stafftools(user)
        github = Seeds::Objects::Organization.github(admin: user)

        user.clear_employee_memo
        user.update(gh_role: "staff")

        employee_team = Seeds::Objects::Team.create!(org: github, name: "Employees")
        employee_team.add_member(user)

        super_admin = StafftoolsRole.find_by(name: "super-admin") || StafftoolsRole.new(name: "super-admin")

        unless user.stafftools_roles.any? { |role| role.is_a?(StafftoolsRole) }
          user.stafftools_roles << super_admin
        end

        user
      end

      def self.create(login:, email: nil, **options)
        user = ::User.find_by(login: login)
        return user if user

        email ||= "#{login}@github.com"
        user = ::User.create(
          login: login,
          password: GitHub.default_password,
          email: email,
          require_email_verification: false,
          billing_attempts: 0,
          plan: "medium",
          **options
        )
        raise Objects::CreateFailed, user.errors.full_messages.to_sentence unless user.valid?
        user.emails.map(&:verify!)
        user
      end

      def self.create_pat(user:, scopes:)
        normalized_scopes = begin
          normalized_scopes = OauthAccess.normalize_scopes(scopes)
          if user.site_admin? && scopes&.include?("site_admin")
            normalized_scopes << "site_admin"
          end
          # Ensure the correct order and remove any duplicate scopes.
          OauthAccess.normalize_scopes(normalized_scopes, visibility: :all)
        end

        access = user.oauth_accesses.create! do |acc|
          acc.application_id = ::OauthApplication::PERSONAL_TOKENS_APPLICATION_ID
          acc.application_type = ::OauthApplication::PERSONAL_TOKENS_APPLICATION_TYPE
          acc.description = "Seeds generated PAT at #{DateTime.now.iso8601} (##{user.oauth_accesses.count})"
          acc.scopes = normalized_scopes
        end
        token = access.redeem

        [token, access]
      end

      # Creates an amount of users with random login and email values.
      def self.random_create(count: 1, rng: Random.new)
        require_relative "../transaction_helper"
        Faker::Config.random = rng

        users = []
        Seeds::TransactionHelper.repeat_in_batches_with_transaction(batch_size: 5, times: count, record: ::User) do
          login = sanitize_login("#{Faker::Name.unique.name.downcase}")
          users << create(login: login, email: Faker::Internet.unique.email)
        end

        users
      end

      # Attempt to santize user names that use invalid characters
      # or are too long.
      def self.sanitize_login(login)
        login = login.parameterize
        # Remove non alpha-numeric characters or dashes.
        # Also remove leading or trailing dashes.
        login.gsub!(/([^a-zA-Z0-9\-]|(^\-+)|(\-+$))/, "")
        login = login[0..::User::LOGIN_MAX_LENGTH - 1] if login.length > ::User::LOGIN_MAX_LENGTH
        login
      end
    end
  end
end
