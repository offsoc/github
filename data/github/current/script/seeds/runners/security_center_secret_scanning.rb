# typed: true
# frozen_string_literal: true

require_relative "../runner"
# Do not require anything else here. If you need something for your runner, put that in `run`.
# This makes sure the boot time of our seeds stays low.

module Seeds
  class Runner
    class SecurityCenterSecretScanning < Seeds::Runner
      HYPERCREDSCAN_REPO_PATH = "/workspaces/hypercredscan"

      class << self
        def help
          <<~HELP
          Create a repo with seeded alerts for secret scanning development
          HELP
        end

        def run(options = {})
          clone_hypercredscan_repo

          org = ::Organization.find_by!(login: options[:organization_name])
          repo = ::Repository.find_by!(name: options[:repository_name])
          repo.enable_advanced_security(actor: org.admins.first)
          ::SecretScanning::Features::Repo::TokenScanning.new(repo).enable(actor: org.admins.first)

          commit = repo.commits.create({ committer: Seeds::Objects::User.monalisa, message: "Add secrets" }) do |files|
            files.add "secrets.go", secrets_file_contents
          end

          repo.refs.create("refs/heads/#{Faker::Hipster.word.parameterize}", commit, Seeds::Objects::User.monalisa)
        end

        private

        def clone_hypercredscan_repo
          return if Dir.exist?(HYPERCREDSCAN_REPO_PATH)

          puts "🐑 Cloning hypercredscan repo…"
          require "progeny"
          child = Progeny::Command.new(
            "git",
            "clone",
            "https://username:#{ENV["GH_GH_PAT"]}@github.com/github/hypercredscan.git",
            HYPERCREDSCAN_REPO_PATH
          )
          raise "git clone failed: #{child.err}" unless child.status.success?
        end

        def secrets_file_contents
          File.read(HYPERCREDSCAN_REPO_PATH + "/hypercredscan/hyperscan_providers_integration_test.go")
        end
      end
    end
  end
end
