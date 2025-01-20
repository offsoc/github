# typed: true
# frozen_string_literal: true

require_relative "../runner"
# Do not require anything else here. If you need something for your runner, put that in `self.run`.
# This makes sure the boot time of our seeds stays low.

module Seeds
  class Runner
    class CodeScanningAutofix < Seeds::Runner
      def self.help
        <<~HELP
        Create a pull request with an alert and suggested fix for code scanning development (use together with script/turbomock)
        HELP
      end

      def self.run(options = {})
        owner_name = nil
        repository_name = nil

        if options[:repo]
          parts = options[:repo].split("/", 2)
          if parts.size == 2
            owner_name, repository_name = parts
          else
            repository_name = parts[0]
          end
        end

        if options[:org]
          if owner_name && owner_name != options[:org]
            abort "Organization mismatch! #{owner_name} != #{options[:org]}"
          end

          owner_name = options[:org]
        end

        runner = new(owner_name:, repository_name:)

        puts "Starting..."
        puts

        runner.ensure_owner
        puts "✅ Owner: #{runner.owner.display_login}"

        runner.ensure_repository
        puts "✅ Repository: #{runner.repository.nwo}"

        runner.create_pull_request
        puts "✅ PR: ##{runner.pull_request.number}"

        runner.create_annotations
        puts "👍 Created annotations"

        puts
        puts "PR is ready:\n"
        puts "    http://#{GitHub.host_name}/#{runner.repository.nwo}/pull/#{runner.pull_request.number}"
        puts
      end

      attr_reader :owner_name, :repository_name
      attr_reader :owner, :repository, :pull_request, :new_alert
      attr_reader :unique_identifier

      def initialize(owner_name: nil, repository_name: nil)
        @owner_name = owner_name
        @repository_name = repository_name
      end

      def ensure_owner
        # Ensure monalisa is created before looking up the owner
        _ = Seeds::Objects::User.monalisa

        @owner = if owner_name
          ::User.find_by(login: owner_name) || Seeds::Objects::Organization.create(login: owner_name, admin: Seeds::Objects::User.monalisa)
        else
          Seeds::Objects::Organization.github
        end

        if owner.organization?
          if owner.business.present?
            owner.business.mark_advanced_security_as_purchased_for_entity(actor: owner.admins.first)
          else
            owner.mark_advanced_security_as_purchased_for_entity(actor: owner.admins.first)
          end
        end
      end

      def ensure_repository
        @repository = Seeds::Objects::Repository.restore_premade_repo(
          location_premade_git: "test/fixtures/git/examples/code_scanning_autofix.git",
          owner_name: owner.display_login,
          repo_name: repository_name || "autofix-demo-#{Time.now.to_i}",
          is_public: false,
        )

        # Restoring a premade repo will in some cases not have the default branch loaded in the call to `@repo.refs`.
        # Reloading resolves this issue.
        repository.reload

        if owner.organization?
          repository.enable_advanced_security(actor: owner.admins.first)
        end
      end

      def create_pull_request
        before_oid = repository.default_branch_ref.commit.oid
        branch = "synthetic-xss-#{unique_identifier}"

        @pull_request = ::PullRequest.create_for!(
          repository,
          user: Seeds::Objects::User.monalisa,
          title: "A simple example of an XSS vulnerability",
          body: "Example from https://github.com/github/codeml-autofix/tree/main/cocofix/examples/synthetic-xss",
          head: "reflected-xss",
          base: repository.default_branch
        )
      end

      def create_annotations
        Seeds::Objects::Integration.create_code_scanning_integration

        commit_oid = pr_head.commit.oid
        code_scanning_check_suite = ::CheckRun.create_code_scanning_check_suite(
          repository: repository,
          annotated_commit_oid: commit_oid,
          analyzed_commit_oid: commit_oid,
          ref: pr_head.qualified_name,
          base_ref: pr_base.qualified_name,
          base_sha: pull_request.base_sha,
        )

        check_runs = ::CheckRun.create_code_scanning_check_runs(
          check_suite: code_scanning_check_suite.check_suite,
          tool_names: ["CodeQL"]
        )

        check_runs.each do |check_run|
          CreateCodeScanningAnnotationsJob.perform_now(check_run_id: check_run.id, reason: :forced_by_seed_script)
        end
      end

      private

      def pr_base
        repository.heads.find(pull_request.base_ref)
      end

      def pr_head
        repository.heads.find(pull_request.head_ref)
      end
    end
  end
end
