# typed: strict
# frozen_string_literal: true

require_relative "../runner"
# Do not require anything else here. If you need something for your runner, put that in `self.run`.
# This makes sure the boot time of our seeds stays low.

module Seeds
  class Runner
    class DelegatedBypass < Seeds::Runner
      extend T::Sig

      REPOS_SECURITY_ORG = "repos-security"
      REPO_NAME = "delegated-bypass"

      sig { returns(String) }
      def self.help
        <<~HELP
        - Adds push_rulesets and push_ruleset_delegated_bypass feature flag.
        - Seeds a pre-made repo for testing purposes.
        Use `-f` (force) flag to recreate org and repos from scratch.
        Use `-m` (multiple) to create multiple rulesets for multi approver flow
        HELP
      end

      sig { params(options: T::Hash[Symbol, T.untyped]).void }
      def self.run(options = {})
        user = Seeds::Objects::User.monalisa
        bypasser_1 = Seeds::Objects::User.create(login: "bypasser1")
        bypasser_2 = Seeds::Objects::User.create(login: "bypasser2")

        fancy_puts "Enabling feature flags", :loading
        enable_features
        fancy_puts "Enabled feature flags", :success

        fancy_puts "Creating orgs, repos, and rulesets", :loading
        seed_repo(user, [bypasser_1, bypasser_2], options)
        fancy_puts "Created orgs, repos, and rulesets", :success

        if Rails.env.development?
          puts <<~MARKDOWN

          # Instructions for testing delegated bypass

          - Add an ssh key to your codespace user
          - create and push a bad commit
          - open the given delegated bypass link and follow the flow from there
          - Requests can be bypassed with the new users `bypasser1` and `bypasser2`

          ```sh
          ssh-keygen -C "monalisa@github.com"
          cat ~/.ssh/id_rsa.pub # copy output to your clipboard
          open http://github.localhost/settings/ssh/new # paste your key here
          cd /workspaces
          git clone ssh://git@localhost:3035/repos-security/delegated-bypass.git
          cd delegated-bypass
          touch long_file_name.exe
          echo "test" >> long_file_name.exe && git add . && git commit -m "test"
          git push origin main
          ```
          MARKDOWN
        end
      end

      sig { void }
      def self.enable_features
        GitHub.flipper[:push_rulesets].enable
        GitHub.flipper[:push_ruleset_delegated_bypass].enable
      end

      sig { params(user: User, collaborators: [User, User], options: T::Hash[Symbol, T.untyped]).void }
      def self.seed_repo(user, collaborators, options = {})
        if options[:force]
          fancy_puts "Deleting existing #{REPO_NAME} repo", :loading, indent: 1
          Repository.find_by(name: REPO_NAME)&.destroy!
          fancy_puts "Deleted existing #{REPO_NAME} repo", :success, indent: 1
          fancy_puts "Deleting existing #{REPOS_SECURITY_ORG} org", :loading, indent: 1
          Organization.find_by(login: REPOS_SECURITY_ORG)&.destroy!
          ReservedLogin.untombstone!(REPOS_SECURITY_ORG)
          fancy_puts "Deleted existing #{REPOS_SECURITY_ORG} org", :success, indent: 1
        elsif Organization.find_by(login: REPOS_SECURITY_ORG)
          fancy_puts "Deleting existing #{REPOS_SECURITY_ORG} rulesets", :loading, indent: 1
          RepositoryRuleset.where(source: Organization.find_by(login: REPOS_SECURITY_ORG)).destroy_all
          fancy_puts "Deleted existing #{REPOS_SECURITY_ORG} rulesets", :success, indent: 1
        end

        repos_security_org = Organization.find_by(login: REPOS_SECURITY_ORG)
        if repos_security_org.nil?
          fancy_puts "Creating organization: #{REPOS_SECURITY_ORG}", :loading, indent: 1
          repos_security_org = Seeds::Objects::Organization.create(login: REPOS_SECURITY_ORG, admin: user)
          fancy_puts "Created organization: #{REPOS_SECURITY_ORG}", :success, indent: 1
        else
          fancy_puts "Organization #{repos_security_org.login} already exists", :info, indent: 1
        end

        repo = create_repo_if_not_exists(name: REPO_NAME, owner: repos_security_org, is_public: false)

        repos_security_org.add_member(collaborators[0])
        bypasser_1_team = create_team(repos_security_org, collaborators[0].login, [collaborators[0]])
        create_push_ruleset(repos_security_org, [bypasser_1_team], target_repo: repo, block_exes: true) unless bypasser_1_team.nil?

        repos_security_org.add_member(collaborators[1])
        bypasser_2_team = create_team(repos_security_org, collaborators[1].login, [collaborators[1]])
        create_push_ruleset(
          repos_security_org,
          [bypasser_2_team],
          target_repo: repo,
          enforcement: options[:multiple] ? :enabled : :disabled,
          block_path_length: true
        ) unless bypasser_2_team.nil?
      end

      sig do
        params(
          source: RuleEngine::Types::RuleSource,
          bypass_teams: T::Array[Team],
          target_repo: T.nilable(Repository),
          enforcement: T.nilable(Symbol),
          block_exes: T.nilable(T::Boolean),
          block_path_length: T.nilable(T::Boolean),
          target_all: T.nilable(T::Boolean),
        ).returns(RepositoryRuleset)
      end
      def self.create_push_ruleset(source, bypass_teams, target_repo: nil, enforcement: :enabled, block_exes: false, block_path_length: false, target_all: false)
        fancy_puts "Creating ruleset", :loading, indent: 1
        ruleset = Seeds::Objects::Ruleset.create(source:, target: :push, enforcement:, target_all:)

        fancy_puts "Adding bypass actors", :loading, indent: 2
        Seeds::Objects::Ruleset.add_bypass_actors(ruleset, bypass_teams.map { |team| {
            actor_id: T.must(team.id),
            actor_type: "Team",
            bypass_mode: nil,
          }
        })

        if !target_repo.nil?
          fancy_puts "Adding target repo", :loading, indent: 2
          Seeds::Objects::Ruleset.add_repo_condition(ruleset, target_repo)
        end

        fancy_puts "Adding rules", :loading, indent: 2 if block_exes || block_path_length
        Seeds::Objects::Ruleset.block_file_extensions(ruleset, ["*.exe"]) if block_exes
        Seeds::Objects::Ruleset.block_file_path_lengths(ruleset, 10) if block_path_length

        fancy_puts "Created ruleset", :success, indent: 1
        ruleset
      end

      sig { params(owner: T.any(User, Organization), name: String, is_public: T.nilable(T::Boolean)).returns(Repository) }
      def self.create_repo_if_not_exists(owner:, name:, is_public: true)
        fancy_puts "Creating repository", :loading, indent: 1
        repo = Repository.find_by(owner_login: owner.login, name: name)
        if repo.nil?
          repo = Seeds::Objects::Repository.create(
            repo_name: name,
            owner_name: owner.login,
            setup_master: true,
            is_public: is_public
          )
          fancy_puts "Created repository", :success, indent: 1
        else
          fancy_puts "Repository already exists", :info, indent: 1
        end
        repo
      end

      sig { params(org: Organization, name: String, members: T::Array[User]).returns(T.nilable(Team)) }
      def self.create_team(org, name, members)
        fancy_puts "Creating team", :loading, indent: 1
        team = Team.find_by(name:, organization: org)
        if team.nil?
          team = T.must(Seeds::Objects::Team.create!(
            name:,
            org:,
          ))
          fancy_puts "Created team", :success, indent: 1
        else
          fancy_puts "Team already exists", :info, indent: 1
        end
        fancy_puts "Adding members", :loading, indent: 1
        members.each do |user|
          team.add_member(user)
        end
        fancy_puts "Added members", :success, indent: 1
        team
      end

      sig { params(message: String, type: Symbol, indent: T.nilable(Integer)).void }
      def self.fancy_puts(message, type, indent: 0)
        return unless Rails.env.development?
        indent_string = " " * (indent || 0) * 2
        icon = case type
        when :info
          "ℹ️ "
        when :loading
          "🌀"
        when :success
          "✅"
        else
          ""
        end
        puts "#{indent_string}#{icon} #{message}"
      end
    end
  end
end
