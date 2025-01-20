# typed: true
# frozen_string_literal: true

# Do not require anything here. If you need something else, require it in the method that needs it.
# This makes sure the boot time of our seeds stays low.

module Seeds
  module Objects
    class ProtectedBranch
      def self.create_for_merge_queue!(repo:, creator:, branch_name: nil)
        create!(
          repo: repo,
          branch_name: branch_name,
          creator: creator,
          merge_queue_enforcement_level: ::ProtectedBranch::LEVELS[:non_admins],
          required_approving_review_count: 1
        )
      end

      def self.create_with_required_deployment!(repo:, creator:, branch_name: nil, env_name: "production", merge_queue: false)
        rules = {}
        if merge_queue
          rules[:merge_queue_enforcement_level] = ::ProtectedBranch::LEVELS[:non_admins]
          rules[:required_approving_review_count] = 1
        end
        protected_branch = create!(repo: repo, creator: creator, branch_name: branch_name, **rules)

        puts "Requiring deployments for #{repo.nwo}'s #{branch_name} branch"
        protected_branch.enable_required_deployments
        protected_branch.save!

        unless protected_branch.required_deployments.find_by(environment: env_name)
          puts "Requiring deployment to the #{env_name} environment for #{repo.nwo} #{branch_name}"
          protected_branch.required_deployments.create!(environment: env_name)
        end

        protected_branch
      end

      def self.create!(repo:, creator:, branch_name: nil, **rules)
        branch_name ||= repo.default_branch

        protected_branch = ::ProtectedBranch.for_repository_with_branch_name(repo, branch_name)
        unless protected_branch
          puts "Adding branch protection to #{repo.nwo} #{branch_name}, as #{creator}"
          protected_branch = repo.protected_branches.create!(name: branch_name, creator: creator)
        end

        if rules.include?(:merge_queue_enforcement_level)
          puts "Enabling merge queue for #{repo.nwo} #{branch_name}"
          protected_branch.merge_queue_enforcement_level = rules[:merge_queue_enforcement_level]
          protected_branch.required_approving_review_count = rules.fetch(:required_approving_review_count, 0)
        end

        unless protected_branch.save
          raise Seeds::Objects::CreateFailed, "ProtectedBranch failed to create: " +
            protected_branch.errors.full_messages.to_sentence
        end

        protected_branch
      end
    end
  end
end
