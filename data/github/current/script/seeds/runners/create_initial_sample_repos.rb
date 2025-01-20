# typed: true
# frozen_string_literal: true

require_relative "../runner"
# Do not require anything else here. If you need something for your runner, put that in `self.run`.
# This makes sure the boot time of our seeds stays low.

module Seeds
  class Runner
    class CreateInitialSampleRepos < Seeds::Runner
      def self.help
        <<~HELP
        Adds sample repos for monalisa and github users.
        HELP
      end

      def self.run(options = {})
        begin
          puts "Attempting to seed some test data..."
          self.seed_repositories
        rescue GitRPC::ConnectionError => e
          puts "Couldn't hit GitRPC. Ensure that gitrpcd and ernicorns are running!"
          e.backtrace&.each { |line| puts line }
          raise
        end
      rescue StandardError => e # rubocop:todo Lint/GenericRescue
        puts "Error: #{e.message}"
      end

      def self.seed_repositories
        @monalisa = Seeds::Objects::User.monalisa
        @github = Seeds::Objects::Organization.github
        @github_biz = Seeds::Objects::Business.github

        @collaborator = ::Seeds::Objects::User.create(login: "collaborator", email: "collaborator@github.com") # Create an outside collaborator
        @outsider = ::Seeds::Objects::User.create(login: "outsider", email: "outsider@github.com") # Create an outsider with no access

        begin
          Codespaces::OrgPolicy.grant_billing_permission!(@monalisa, @github)
          Codespaces::OrgPolicy.grant_billing_permission!(@collaborator, @github)
        rescue Codespaces::OrgPolicy::RoleGranterError => e
          unless e.message.include?("Actor has already been taken")
            puts "Couldn't grant org creator role to github user: #{e.message}"
            raise
          end
        end

        puts "Generating some repositories for monalisa and the github org"

        @org_private_repo = ::Seeds::Objects::Repository.create_with_nwo(
            nwo: "github/private-server",
            setup_master: true,
            is_public: false
          )

        puts "created repo '#{@org_private_repo}'"

        @org_internal_repo = ::Seeds::Objects::Repository.create_with_nwo(
            nwo: "github/internal-server",
            setup_master: true,
            is_public: false
          )

        @org_internal_repo&.set_permission(:internal)

        puts "created repo '#{@org_internal_repo}'"

        @org_public_repo = ::Seeds::Objects::Repository.create_with_nwo(
            nwo: "github/public-server",
            setup_master: true,
            is_public: true
          )

        puts "created repo '#{@org_public_repo}'"

        @personal_public_repo = ::Seeds::Objects::Repository.create_with_nwo(
            nwo: "monalisa/smile",
            setup_master: true,
            is_public: true
          )

        puts "created repo '#{@personal_public_repo}'"

        @personal_private_repo = ::Seeds::Objects::Repository.create_with_nwo(
            nwo: "monalisa/illuminati",
            setup_master: true,
            is_public: false
          )

        puts "created repo '#{@personal_private_repo}'"

        @org_private_repo.add_member(@collaborator)
        @org_internal_repo.add_member(@collaborator)
        @org_public_repo.add_member(@collaborator)
        @personal_private_repo.add_member(@collaborator)
        @personal_public_repo.add_member(@collaborator)

        @org_public_repo.allow_private_repository_forking(actor: @github)
        @org_private_repo.allow_private_repository_forking(actor: @github)

        @member_private_fork, _ = @org_private_repo.fork(forker: @monalisa)
        @collab_private_fork, _ = @org_private_repo.fork(forker: @collaborator)
        @member_public_fork, _ = @org_public_repo.fork(forker: @monalisa)
        @collab_public_fork, _ = @org_public_repo.fork(forker: @collaborator)
      end
    end
  end
end
