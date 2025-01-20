# typed: true
# frozen_string_literal: true

require_relative "../runner"

module Seeds
  class Runner
    class MergeQueueLoadTest < Seeds::Runner

      BRANCH_PREFIX = "mq-loadtest"
      CHECK_SUITE_APP_NAME = "Checks Seed"

      def self.help
        <<~HELP
        Please setup the GH_PAT environment varible with your personal access token before running this script

        Flags:
         * target_depth, -d : sets the queue size for the duration of the script run
         * repository, -r : name of the repository that the script creates/finds
         * required_builds_count, -b : Number of required builds wanted for this run
         * verbose -v : Additional debugger statements
         * single_job : parameter to toggle between running the script with or without the feature flag for the MQ spike

        HELP
      end

      def self.run(options = {})
        require "optparse"
        require "logger"
        require "octokit"
        require "json"

        new.run(options)
      end

      def run(options)
        unless token_set?
          puts "GH_PAT is not set. Please set it and run the script again."
          return
        end

        setup_logger

        Seeds::Objects::FeatureFlag.toggle(action: "enable", feature_flag: "merge_queue")
        @options = options
        @expected_checks_count = options[:required_builds_count]
        @required_builds = []

        @api_endpoint = "http://api.github.localhost"
        @client = Octokit::Client.new({ api_endpoint: @api_endpoint, access_token: ENV.fetch("GH_PAT") })
        @user = "monalisa"
        @name_with_owner = "#{@user}/#{@options[:repository]}"
        @repository = find_or_create_merge_queue_repo

        ensure_integration_exists(repository: @repository)

        @default_branch = @client.repository(@name_with_owner).default_branch

        # Assumes that merge queue is setup for the default branch of the repo
        @merge_queue = ::MergeQueue.for(repository: @repository, branch: @default_branch)
        @merge_queue_state_query = entries_query

        start_banner
        execute!
      end

      private

      def setup_logger
        @logger = Logger.new(STDOUT)
        @logger.datetime_format = "%m-%d %H:%M:%S"

        @logger.formatter = proc do |_severity, datetime, _progname, msg|
          log_line = "#{datetime}: #{msg}"
          log_line
        end
      end

      def start_banner
        puts "Selected options:"
        puts @options
        puts ""

        @logger.info("Merge Queue load test started by #{ENV.fetch("USER")}\n")
      end

      def find_or_create_merge_queue_repo
        repo = Repository.nwo(@name_with_owner)
        if repo
          puts "found #{@name_with_owner} repository"
        else
          puts "Creating #{@name_with_owner} repository"
          repo = Seeds::Objects::Repository.create(owner_name: @user, repo_name: @options[:repository], setup_master: true)
        end

        user = repo_member

        unless repo.member?(user)
          puts "Adding #{user} to #{repo.nwo}"
          repo.add_member(user)
        end

        @expected_checks_count.times do
          @required_builds << Faker::App.unique.name
        end

        repo.protect_branch(
          repo.default_branch,
          creator: repo.owner,
          enforce_merge_queue: true,
          entry_point: :test_case,
        )

        ruleset = RepositoryRuleset.find_or_initialize_by(
          name: "Merge Queue load test",
          source: repo,
        )
        ruleset.update!(
          enforcement: "enabled",
          target: "branch",
          rule_configurations: [
            RepositoryRuleConfiguration.new(
              rule_type: "required_status_checks",
              parameters: {
                required_status_checks: @required_builds.map { { context: _1 } },
                strict_required_status_checks_policy: false,
              },
            ),
          ],
          conditions: [
            RepositoryRuleCondition.new(
              target: "ref_name",
              condition_type: "fnmatch",
              parameters: {
                include: ["~DEFAULT_BRANCH"],
                exclude: [],
              },
            ),
          ],
        )

        repo
      end

      def repo_member
        return @repo_member if @repo_member
        login = "repo-member"
        @repo_member = User.find_by_login(login)
        unless @repo_member
          puts "Creating user to be a non-admin repository member, #{login}"
          @repo_member = Seeds::Objects::User.create(login: login, email: "#{login}@example.com")
        end
        @repo_member
      end

      # Handle PR creation
      # Borrowed from here: https://cs.github.com/github/jit-chatops/blob/2d98a235d4cdc597ba5a20470c07c7043852ec0b/lib/services/github.rb?q=create_commit%20org%3Agithub&utm_source=pocket_mylist
      def create_pr(repo, branch, path, content, pr_title, pr_body)
        new_branch_name = "#{BRANCH_PREFIX}-#{SecureRandom.uuid}"
        branch_hash = @client.create_ref(repo, "heads/#{new_branch_name}", base_branch_sha(repo, branch))

        tree_hash = create_tree_hash(repo, path, content)
        commit = create_commit(repo, new_branch_name, branch_hash, tree_hash, pr_title)
        pr_options = { draft: false }
        [@client.create_pull_request(repo, branch, new_branch_name, pr_title, pr_body, pr_options), commit]
      end

      def base_branch_sha(repo, branch)
        base_branch = @client.ref(repo, "heads/#{branch}")
        base_branch[:object][:sha]
      end

      def create_tree_hash(repo, path, content)
        [
          {
            path: path,
            mode: "100644",
            type: "blob",
            sha: @client.create_blob(repo, content)
          }
        ]
      end

      def create_commit(repo, branch, branch_hash, tree_hash, commit_msg)
        current_commit = @client.git_commit(repo, branch_hash[:object][:sha])
        current_tree_sha = current_commit[:tree][:sha]
        new_tree = @client.create_tree(repo, tree_hash, base_tree: current_tree_sha)
        new_commit = @client.create_commit(repo, commit_msg, new_tree[:sha], current_commit[:sha])
        @client.update_ref(repo, "heads/#{branch}", new_commit[:sha])
      end

      def make_graphql_request(query)
        response = @client.send :request, :post, "/graphql", { query: query }.to_json, { headers: {
          "GraphQL-Schema": "internal",
          "GraphQL-Features": "merge_queue",
        } }
        @logger.info(response.inspect) if @options[:verbose]
        if response&.errors
          request_id = @client.last_response.headers["x-gitHub-request-id"]
          raise "Failed querying merge queue state. #{response.errors.inspect} request_id = #{request_id}"
        end
        response
      end

      def entries_query
        <<-MERGE_QUEUE_ENTRIES
        query {
          repository(owner: "monalisa", name: "#{@options[:repository]}") {
            mergeQueue {
              # If there is a currently locked merge group, this will be the ref
              # for it. If there is no locked merge group, this will be null.
              headOid

              # Time estimate for next merge
              nextEntryEstimatedTimeToMerge

              # The PRs that are ready to merge in the merge group that is either
              # currently locked or would form the locked merge group on a lock
              # call.
              # You can get all the "passengers" for the next merge group from
              # the enqueue login.
              mergingEntries(first: 100) {
                  nodes {
                      enqueuer {
                          login
                      }
                      enqueuedAt
                      estimatedTimeToMerge
                      pullRequest {
                          id
                          headRef {
                              name
                              target {
                                  oid
                              }
                          }
                          author {
                              login
                          }
                          url
                      }
                  }
              }

              # These are the PRs that are currently in the queue and may or
              # may not be eligible to merge.
              entries(first: 100) {
                  nodes {
                      headOid
                      enqueuer {
                          login
                      }
                      position
                      enqueuedAt
                      estimatedTimeToMerge
                      pullRequest {
                          databaseId
                          headRef {
                              name
                          }
                          author {
                              login
                          }
                      }
                  }
              }
            }
          }
        }
        MERGE_QUEUE_ENTRIES
      end

      def create_check_run_for_check_suite(check_suite:, name:, outcome:)
        return unless check_suite
        check_run_options = outcome_to_check_run_opts(outcome)
        @logger.info "Creating CheckRun #{name} with status #{check_run_options[:status]} and conclusion #{check_run_options[:conclusion]}\n"
        check_run = T.unsafe(::Seeds::Objects::CheckRun).create(check_suite, repository: check_suite.repository, name: name, **check_run_options)
        MergeQueues.execute_from_sha!(check_suite.repository, check_run.head_sha)
      end

      def ensure_integration_exists(repository:)
        owner_integrations = Integration.where(owner: repository.owner, name: CHECK_SUITE_APP_NAME)
        installations = owner_integrations.flat_map { |i| i.installations_on(repository.owner) }
        return if installations.any? { |i| i.installed_on_all_repositories? || i.repository_ids.include?(repository.id) }
        Seeds::Objects::Integration.create(repo: repository, owner: repository.owner, app_name: CHECK_SUITE_APP_NAME)
      end

      def token_set?
        ENV.include?("GH_PAT")
      end

      def find_or_create_check_suite(repository:, sha:)
        return unless sha

        check_suite = CheckSuite.where(repository: repository, head_sha: sha).last
        unless check_suite
          @logger.info "Requesting a check suite for #{sha}\n"
          CheckSuite.request(repository: repository, head_sha: sha, actor: repository.owner)
        end
        check_suite
      end

      def outcome_to_check_run_opts(outcome)
        default_args = { details_url: "http://github.localhost" }
        state_args = T.let({}, Hash)
        state_args = case outcome
        when "s", "success"
          { status: "completed", conclusion: "success", started_at: 20.minutes.ago, completed_at: Time.now }
        when "n", "neutral"
          { status: "completed", conclusion: "neutral", started_at: 20.minutes.ago, completed_at: nil }
        when "f", "failure"
          { status: "completed", conclusion: "failure", started_at: 20.minutes.ago, completed_at: 1.hour.ago }
        when "w", "waiting"
          { status: "in_progress", conclusion: nil, started_at: 5.minutes.ago, completed_at: nil }
        end
        state_args.merge(default_args)
      end

      def execute!
        threads = []
        # This thread is responsible for keeping the queue at the target depth
        threads << Thread.new do # rubocop:disable GitHub/ThreadUse
          prs_waiting_for_green = []
          while true
            # Get the queue state
            response = make_graphql_request(@merge_queue_state_query)

            # How deep is the queue?
            queue_depth = response.data.repository.mergeQueue.entries.nodes.length

            max_prs_pending = 8
            # Add items to it if it's not deep enough. Limit the number of PRs with pending CI to avoid spam and rate limit.
            if queue_depth + prs_waiting_for_green.length < @options[:target_depth] && prs_waiting_for_green.length < max_prs_pending
              @logger.info("Queue depth: #{queue_depth} Target depth: #{@options[:target_depth]}\n")
              uuid = SecureRandom.uuid
              pr, commit = create_pr(@name_with_owner, @default_branch, "testchanges/#{uuid}.txt", uuid, "Test change #{Time.now} #{uuid}", uuid)
              @logger.info("PR created. Waiting on CI to go green. URL: #{pr.html_url} Head: #{commit.object.sha}\n")
              prs_waiting_for_green << [pr, commit]
              sleep 1 # rate limit
              next
            end

            prs_waiting_for_green.each_with_index do |pr_tuple, index|
              pr = T.let(nil, T.nilable(PullRequest))
              commit = T.let(nil, T.nilable(Commit))
              pr = pr_tuple[0]
              commit = pr_tuple[1]
              check_suite = find_or_create_check_suite(repository: @repository, sha: commit.object.sha)

              unless check_suite
                @logger.info "Check suite requested for #{commit.object.sha}\n"
                next
              end

              @required_builds.each do |check_run_name|
                create_check_run_for_check_suite(check_suite: check_suite, name: check_run_name, outcome: "success")
              end

              runs = @client.check_runs_for_ref(@name_with_owner, commit.object.sha, { accept: Octokit::Preview::PREVIEW_TYPES[:checks] })
              runs.check_runs.each { |check| @logger.info("#{check.name}: #{check.status} #{check.conclusion}\n") } if @options[:verbose]
              @logger.debug runs if @options[:verbose]

              # wait for janky to register checks
              next if runs.total_count < @expected_checks_count

              # we've got all the checks, now wait for them to pass
              next unless runs.check_runs.all? { |check| check.conclusion == "success" }

              @logger.info("CI Green. Adding PR to queue. URL: #{pr.html_url}\n")

              pull_request = PullRequest.find(pr.id)
              pull_request.create_merge_commit
              @merge_queue.enqueue!(pull_request: pull_request, enqueuer: @repository.owner)

              # Remove the PR from the waiting prs so we don't try and add to the queue again
              prs_waiting_for_green.delete_at(index)
            end
          end
        end

        # This thread is responsible for performing normal actions on the queue
        # like removing items or cancelling pipelines
        threads << Thread.new do # rubocop:disable GitHub/ThreadUse
          # hash of  pr ids to check run names
          pr_to_checks = {}
          while true
            # Load the queue state
            response = make_graphql_request(@merge_queue_state_query)
            queue_depth = response.data.repository.mergeQueue.entries.nodes.length

            if queue_depth == 0
              @logger.info("User simulator: No PRs in queue, taking no actions.\n")
              sleep 60
              next
            end

            # pick random item from the queue
            item_index = rand(0..(queue_depth - 1))
            entry = response.data.repository.mergeQueue.entries.nodes[item_index]
            branch = entry.pullRequest.headRef.name
            pull_request_id = entry.pullRequest.databaseId
            pull_request = PullRequest.find(pull_request_id)
            entry_head_oid = entry.headOid
            pr_to_checks[pull_request_id] ||= @required_builds.dup

            case rand(100)
            when 1..2 # 2% Chance to dequeue
              @logger.info("User simulator: Random hit: Removing item at position #{item_index + 1} from queue. Removing #{branch}\n")

              @merge_queue.dequeue(pull_request: pull_request, dequeuer: pull_request.user)
              pr_to_checks.delete(pull_request_id) # no need to track these keys anymore once removed from the queue
            when 3..9 # 5% chance to fail
              check_suite = find_or_create_check_suite(repository: @repository, sha: entry_head_oid)

              if check_suite
                next if pr_to_checks[pull_request_id].empty? # all checks have been processed
              else
                @logger.info "Check suite requested for #{entry_head_oid}\n"
                next
              end

              build_picked = pr_to_checks[pull_request_id].sample
              selected_build_name = pr_to_checks[pull_request_id].delete(build_picked)

              create_check_run_for_check_suite(check_suite: check_suite, name: selected_build_name, outcome: "failure")
              @logger.info("Check run status #{selected_build_name} returned as FAILED for pull request #{pull_request_id} in the queue\n")
            when 11..80 # 70% chance of a successful check run
              check_suite = find_or_create_check_suite(repository: @repository, sha: entry_head_oid)

              if check_suite
                pr_to_checks[pull_request_id] ||= @required_builds.dup
                next if pr_to_checks[pull_request_id].empty? # all checks have been processed
              else
                @logger.info "Check suite requested for #{entry_head_oid}\n"
                next
              end

              build_picked = pr_to_checks[pull_request_id].sample
              selected_build_name = pr_to_checks[pull_request_id].delete(build_picked)

              create_check_run_for_check_suite(check_suite: check_suite, name: selected_build_name, outcome: "success")
              @logger.info("Check run status #{selected_build_name} returned as SUCCESS for pull request #{pull_request_id} in the queue\n")
            else
              @logger.info("User simulator: No action taken this loop. Sleeping\n")
            end

            sleep 5
          end
        end

        threads.each { |t| t.join }
      end
    end
  end
end
