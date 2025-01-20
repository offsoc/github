# typed: true
# frozen_string_literal: true

require_relative "../runner"
# Do not require anything else here. If you need something for your runner, put that in `self.run`.
# This makes sure the boot time of our seeds stays low.

module Seeds
  class Runner
    class IssuesForRepo < Seeds::Runner
      DEFAULT_ISSUE_COUNT = 10
      DEFAULT_ISSUE_COMMENT_MAX = 3
      DEFAULT_COMMIT_REFERENCE_MAX = 2
      DEFAULT_LINKED_ISSUE_MAX = 1

      def self.help
        <<~HELP
        Creates randomized issues for an existing repository.

        Example Usage:
          # Basic usage.
          bin/seed issues_for_repo --nwo foo/bar

          # Create 20 issues. (Default is 10.)
          bin/seed issues_for_repo --nwo foo/bar --count 20

          # Specify names of existing labels to be randomly assigned to issues.
          bin/seed issues_for_repo --nwo foo/bar --labels bug,enhancement

          # Specify seed to ensure determinism between runs.
          bin/seed issues_for_repo --nwo foo/bar --seed 1234

          # Customize maximum number of links between issues. (Default is 1.)
          bin/seed issues_for_repo --nwo foo/bar --linked_issue_max 2

          # Customize maximum number of comments on issues. (Default is 3.)
          bin/seed issues_for_repo --nwo foo/bar --issue_comment_max 10

          # Customize maximum number of commit references on issues. (Default is 2.)
          bin/seed issues_for_repo --nwo foo/bar --commit_reference_max 5
        HELP
      end

      def self.run(options = {})
        options = options.with_indifferent_access

        if options.empty?
          puts help
          return
        end

        validate_options(options)
        repo = get_repo(options[:nwo])
        rng = options[:seed] ? Random.new(options[:seed].to_i) : Random.new
        labels = get_labels(options:, repo:)
        options[:issue_comment_max] ||= DEFAULT_ISSUE_COMMENT_MAX
        options[:commit_reference_max] ||= DEFAULT_COMMIT_REFERENCE_MAX
        options[:linked_issue_max] ||= DEFAULT_LINKED_ISSUE_MAX

        puts "-> Seeding repo '#{repo.name}' with #{options[:count]} issues."

        batch_callback = lambda do |batch_size|
          puts "  -> Committing #{batch_size} issues with comments."
        end

        Seeds::Objects::Issue.create_random(
          repo: repo,
          users: repo.members,
          count: options[:count],
          rng: rng,
          labels: labels,
          commit_reference_max: options[:commit_reference_max],
          issue_comment_max: options[:issue_comment_max],
          linked_issue_max: options[:linked_issue_max],
          batch_callback: batch_callback
        )
      end
    end

    # validates options/input parameters
    def self.validate_options(options)
      if options[:nwo].split("/").length != 2
        raise Runner::RunnerError, "Invalid repo name. Please provide a valid repo name in the nwo format 'owner/repo'"
      end
    end

    def self.get_repo(nwo)
      repo = ::Repository.nwo(nwo)
      raise Runner::RunnerError, "Could not not find repository #{nwo}" unless repo
      repo
    end

    def self.get_labels(options:, repo:)
      return [] unless options[:labels]
      label_names = options[:labels].split(",")
      labels = repo.labels.map { |label| [label.name, label] }.to_h
      label_names.map do |label_name|
        raise Runner::RunnerError, "Could not find label #{label_name} in repo #{repo.nwo}" unless labels[label_name]
        labels[label_name]
      end
    end

    private_class_method :validate_options, :get_repo, :get_labels
  end
end
