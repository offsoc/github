# typed: strict
# frozen_string_literal: true

require_relative "../runner"
# Do not require anything else here. If you need something for your runner, put that in `self.run`.
# This makes sure the boot time of our seeds stays low.

module Seeds
  class Runner
    class SecretScanning < Seeds::Runner
      extend T::Sig

      sig { returns(String) }
      def self.help
        <<~HELP
        Create a repo with seeded alerts for secret scanning development
        HELP
      end

      sig { params(options: T::Hash[Symbol, T.untyped]).void }
      def self.run(options = {})
        puts "Creating a repository seeded with secrets"

        mona = Seeds::Objects::User.monalisa
        owner = options[:organization] ? Seeds::Objects::Organization.github : mona

        repo = Seeds::Objects::Repository.restore_premade_repo(
          location_premade_git: options[:repo_path],
          owner_name: owner,
          repo_name: options[:name] || "secret-scanning-repo-with-alerts-#{Time.now.to_i}",
          is_public: !owner.organization?,
        )
        puts " ✅\n\n"

        if owner.organization?
          print "Enabling advanced security and secret scanning on the repo..."

          # We are not guaranteed that owner and repo.owner are the same object because the call
          # to `restore_premade_repo` does not take the owner as argument, so it might create
          # a new org with the same name.
          if repo.owner.business.present?
            repo.owner.business.mark_advanced_security_as_purchased_for_entity(actor: owner.admins.first)
          else
            repo.owner.mark_advanced_security_as_purchased_for_entity(actor: owner.admins.first)
          end

          repo.enable_advanced_security(actor: owner.admins.first)
          ::SecretScanning::Features::Repo::TokenScanning.new(repo).enable(actor: owner.admins.first)

          puts " ✅\n\n"
        end

        puts "\n"
        puts "Your new repository is ready:\n"
        puts "    http://#{GitHub.host_name}/#{repo.name_with_display_owner}"
        puts "\n"
      end
    end
  end
end
