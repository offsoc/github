# typed: true
# frozen_string_literal: true

require_relative "../runner"
# Do not require anything else here. If you need something for your runner, put that in `self.run`.
# This makes sure the boot time of our seeds stays low.

module Seeds
  class Runner
    class PullRequests < Seeds::Runner
      DEFAULT_AUTHOR = "monalisa"
      DEFAULT_NUM_DRAFTS = 0
      DEFAULT_NUM_COMMENTS = 1
      DEFAULT_NUM_FILES_CHANGED = 50
      DEFAULT_ORG_NAME = "github"
      DEFAULT_ORG_REPO_NAME = "github"
      DEFAULT_REPO_NAME = "smile"
      DEFAULT_REVIEWERS = %w(collaborator).freeze
      MINIMUM_NUM_COMMITS = 5

      def self.help
        <<~HELP
        Seed pull request data for local development.

        - Creates ten PRs (five in user-owned repo, five in org-owned repo):
          - One with one changed file
          - One with several changed files and review comments
          - One with a number of changed files specified by the user
          - One with a number of commits specified by the user
          - One based off of a branch of the main branch, with each branch having one changed file
        - Ensures given PR author exists
        - Ensures given PR reviewers exist
        - Ensures given repo exists

        Options:
          -author, -u
            String name of the pull request author.
            Defaults to #{DEFAULT_AUTHOR}.
            Example: bin/seed pull_requests -u octocat
          -num_drafts, -d
            Integer number of draft PRs to create.
            Defaults to #{DEFAULT_NUM_DRAFTS}. Maximum 10.
            Example: bin/seed pull_requests -d 5
          -num_comments, -c
            Integer number of issue comments in the PR.
            Defaults to #{DEFAULT_NUM_COMMENTS}.
            Example: bin/seed pull_requests -c 5
          -num_commits, -m
            Integer number of commits in the PR.
            Defaults to #{Seeds::Objects::Commit::DEFAULT_NUM_RANDOM_COMMITS}. Minimum #{MINIMUM_NUM_COMMITS}.
            Example: bin/seed pull_requests -c 50
          -num_files_changed, -n
            Integer number of files changed in the PR.
            Defaults to #{DEFAULT_NUM_FILES_CHANGED}.
            Example: bin/seed pull_requests -n 25
          -nwo, -r
            String "name with owner" of the pull request base repository.
            Defaults to #{DEFAULT_AUTHOR}/#{DEFAULT_REPO_NAME}.
            Example: bin/seed pull_requests -r octocat/octorepo
          -reviewers, -v
            Array of reviewer logins.
            Defaults to #{DEFAULT_REVIEWERS}.
            Example: bin/seed pull_requests -v reviewer1 reviewer2
        HELP
      end

      def self.run(options = {})
        puts "Setting up users and repos..."
        # Ensure PR author exists
        author_login = options[:author] || DEFAULT_AUTHOR
        puts "\tFinding or creating PR author #{author_login}..."
        author = Seeds::Objects::User.create(login: author_login)

        # Ensure PR reviewers exist
        reviewer_logins = options[:reviewers] || DEFAULT_REVIEWERS
        reviewers = reviewer_logins.map do |reviewer_login|
          puts "\tFinding or creating PR reviewer #{reviewer_login}..."
          Seeds::Objects::User.create(login: reviewer_login)
        end
        reviewer_user_ids = reviewers.map(&:id)

        # Ensure repo exists
        nwo = options[:nwo] || "#{author_login}/#{DEFAULT_REPO_NAME}"
        puts "\tFinding or creating repo #{nwo}..."
        repo = Seeds::Objects::Repository.create_with_nwo(nwo: nwo, setup_master: true, is_public: true)

        # Ensure org exists
        org = \
          if repo.in_organization?
            repo.organization
          else
            puts "\tCreating organization #{DEFAULT_ORG_NAME}..."
            Seeds::Objects::Organization.create(login: DEFAULT_ORG_NAME, admin: author)
          end
        # Ensure org has verifiable domain
        if !org.verifiable_domains.exists?
          verifiable_domain = VerifiableDomain.normalize_domain(author.git_author_email)
          puts "\tCreating verified domain #{verifiable_domain} for org #{org.login}..."
          org.verifiable_domains.create(domain: verifiable_domain, verified: true)
        end

        # Ensure script has one user-owned repo and one org-owned repo
        if repo.in_organization?
          org_repo = repo
          # Create user-owned repo
          user_repo_nwo = "#{author_login}/#{DEFAULT_REPO_NAME}"
          puts "\tCreating user-owned repo #{user_repo_nwo}..."
          user_repo = Seeds::Objects::Repository.create_with_nwo(nwo: user_repo_nwo, setup_master: true)
        else
          user_repo = repo
          # Create org-owned repo
          org_repo_nwo = "#{org.login}/#{DEFAULT_ORG_REPO_NAME}"
          puts "\tCreating org-owned repo #{org_repo_nwo}..."
          org_repo = Seeds::Objects::Repository.create_with_nwo(nwo: org_repo_nwo, setup_master: true)
        end

        # Ensure all users have write permissions to user-owned and org-owned repos
        all_users = [author] | reviewers
        all_users.each do |user|
          puts "\tAdding #{user} to #{user_repo.nwo} as member with write permissions..."
          user_repo.add_member(user)
          puts "\tAdding #{user} to #{org_repo.nwo} as member with write permissions..."
          org.add_member(user)
          org_repo.add_member(user)
        end

        # Set options
        total_number_of_prs = 10
        number_of_draft_prs = options[:num_drafts] || DEFAULT_NUM_DRAFTS
        # Create array of booleans we can pass one-by-one into PR create :draft option
        draft_prs = Array.new(total_number_of_prs) { |i| i < number_of_draft_prs }.shuffle
        given_number_of_commits = total_number_of_commits = (options[:num_commits] || Seeds::Objects::Commit::DEFAULT_NUM_RANDOM_COMMITS)
        number_of_comments = options[:num_comments] || DEFAULT_NUM_COMMENTS
        num_files_changed = options[:num_files_changed] || DEFAULT_NUM_FILES_CHANGED

        # Loop through each repo, create PRs in each
        [user_repo, org_repo].each do |repo|
          puts "\nCreating 5 pull requests in #{repo.nwo}..."
          possible_commenter_ids = repo.members.ids

          puts "\tAdding initial files to repo...\n"
          base_commit = \
            Seeds::Objects::Commit.create(
              repo: repo,
              committer: author,
              message: "Initial commit",
              files: {
                "CODEOWNERS" => "*.rb @#{author.login} @octocat2",
                "one/two/update_me.rb" => "todo: update me",
                "one/two/three/delete_me.md" => "todo: delete me",
                "rename_me.txt" => "todo: rename me"
              }
            )

          # PR with one changed file
          puts "\tCreating pull request with one changed file..."
          simple_pr_ref_name = "branch-#{SecureRandom.hex}"
          puts "\t\tCommiting changes to new branch #{simple_pr_ref_name}..."
          Seeds::Objects::Commit.create(
            repo: repo,
            message: "Changing one file",
            committer: author,
            branch_name: simple_pr_ref_name,
            files: {
              "File.md" => "Last updated #{Time.current}"
            }
          )
          puts "\t\tOpening PR..."
          simple_pull = ::PullRequest.create_for!(
            repo,
            user: author,
            title: "Pull request with 1 changed file",
            body: "This pull request has one changed file.",
            head: simple_pr_ref_name,
            base: repo.default_branch,
            reviewer_user_ids: reviewer_user_ids,
            draft: draft_prs.shift,
          )
          puts "\t\tAdding comments..."
          create_comments(issue: simple_pull.issue, number_of_comments:, possible_commenter_ids:)
          puts "\t\tDone!\n"

          # PR with several changed files
          puts "\tCreating pull request with several changed files..."
          complex_pr_ref_name = "branch-#{SecureRandom.hex}"
          complex_pr_head_ref = repo.refs.create("refs/heads/#{complex_pr_ref_name}", base_commit.oid, author)
          complex_pr_metadata = { message: "Changing several files", committer: author, author: author }
          puts "\t\tCommitting changes to new branch #{complex_pr_ref_name}..."
          complex_pr_head_ref.append_commit(complex_pr_metadata, author) do |changes|
            changes.add("Gemfile.lock", "# manifest file")
            changes.add("File.md", "file file file")
            changes.add("file_with_a_pretty_pretty_pretty_pretty_long_name", "Name should be truncated")
            changes.add("one/two/viewed.rb", "todo: mark me as viewed")
            changes.add("one/two/update_me.rb", "Updated!")
            changes.add("Gopkg.lock", "hidden generated file")
            changes.move("rename_me.txt", "renamed.txt", "todo: rename me")
            changes.remove("one/two/three/delete_me.md")
            changes.add("very_large.txt", "a\n" * 10_000)
            changes.add("rails.svg", File.read(Rails.root.join("test/fixtures/files/rails.svg")))
          end

          puts "\t\tOpening PR..."
          complex_pull = ::PullRequest.create_for!(
            repo,
            user: author,
            title: "Pull request with several changed files and reviews",
            body: "This pull request has several changed files.",
            head: complex_pr_head_ref.name,
            base: repo.default_branch,
            reviewer_user_ids: reviewer_user_ids,
            draft: draft_prs.shift,
          )
          puts "\t\tAdding comments..."
          create_comments(issue: complex_pull.issue, number_of_comments:, possible_commenter_ids:)
          create_pull_request_review_thread(pull: complex_pull, possible_commenter_ids:, position_options: { path: "Gemfile.lock", side: :right, line: 1 })
          create_pull_request_review_thread(pull: complex_pull, possible_commenter_ids:, position_options: { path: "very_large.txt", side: :right, line: 5000 })

          # creating multiple threads on the same line
          create_pull_request_review_thread(pull: complex_pull, possible_commenter_ids:, position_options: { path: "one/two/update_me.rb", side: :left, line: 1 })
          create_pull_request_review_thread(pull: complex_pull, possible_commenter_ids:, position_options: { path: "one/two/update_me.rb", side: :left, line: 1 })

          puts "\t\tMarking file as viewed..."
          UserReviewedFile.create(
            filepath: "one/two/viewed.rb",
            user: author,
            pull_request: complex_pull,
            head_sha: complex_pull.head_sha,
          )
          puts "\t\tDone!\n"

          # PR with a number of changed files
          puts "\tCreating pull request with #{num_files_changed} changed files..."
          large_pr_ref_name = "branch-#{SecureRandom.hex}"
          large_pr_head_ref = repo.refs.create("refs/heads/#{large_pr_ref_name}", base_commit.oid, author)
          large_pr_metadata = { message: "Changing a number of files", committer: author, author: author }
          puts "\t\tCommitting changes to new branch #{large_pr_ref_name}..."
          large_pr_head_ref.append_commit(large_pr_metadata, author) do |changes|
            num_files_changed.times do |i|
              changes.add("one/two/file-#{i}.txt", "File #{i}")
            end
            changes.add("one/two/update_me.rb", "Update existing file")
          end

          puts "\t\tOpening PR..."
          large_pull = ::PullRequest.create_for!(
            repo,
            user: author,
            title: "Pull request with #{num_files_changed} changed files",
            body: "This pull request has #{num_files_changed} changed files.",
            head: large_pr_head_ref.name,
            base: repo.default_branch,
            reviewer_user_ids: reviewer_user_ids,
            draft: draft_prs.shift,
          )
          puts "\t\tAdding comments..."
          create_comments(issue: large_pull.issue, number_of_comments:, possible_commenter_ids:)
          create_pull_request_review_thread(pull: large_pull, possible_commenter_ids:, position_options: { path: "one/two/file-1.txt", side: :right, line: 1 })
          puts "\t\tDone!\n"

          # PR with many commits
          puts "\tCreating pull request with #{total_number_of_commits} commits..."
          if given_number_of_commits < MINIMUM_NUM_COMMITS
            total_number_of_commits = MINIMUM_NUM_COMMITS
            puts "\tUnable to create only #{given_number_of_commits} commits. Minimum is #{MINIMUM_NUM_COMMITS}"
          end

          commits_pr_ref_name = "branch-with-#{total_number_of_commits}-commits-#{SecureRandom.hex}"
          past_date = (Time.now - 1.day).iso8601

          puts "\t\tCommitting changes to new branch #{commits_pr_ref_name}..."
          # Commit with link in message
          url = Faker::Internet.url
          Seeds::Objects::Commit.create(
            branch_name: commits_pr_ref_name,
            committer: author,
            date: past_date,
            files: { "banlist-#{SecureRandom.hex}" => url },
            message: "Add #{url} to banlist",
            repo: repo,
          )

          # Commit with multiple authors
          coauthor = reviewers.sample
          Seeds::Objects::Commit.create(
            branch_name: commits_pr_ref_name,
            committer: author,
            date: past_date,
            files: { "foo-#{SecureRandom.hex}" => "foo" },
            message: "Pair programmed :raised_hands:\n\nCo-authored-by: #{coauthor.login} <#{coauthor.git_author_email}>",
            repo: repo,
          )

          # Verified commit (using web flow)
          # Requires web flow setup to be in place, which is true by default when
          # developing in a gh/gh codespace
          author.set_commit_verification_status_state(actor: author, state: "enabled")
          head_ref = repo.heads.find(commits_pr_ref_name)
          metadata = {
            committer: {
              name: GitHub.web_committer_name,
              email: GitHub.web_committer_email,
            },
            author: {
              name: author.git_author_name,
              email: author.git_author_email,
            },
            authored_date: past_date,
            committed_date: past_date,
            message: "Committing changes via the GitHub web interface at #{past_date}"
          }
          head_ref.append_commit(metadata, author, { sign: true }) do |changes|
            changes.add("verified-#{SecureRandom.hex}", "Commited via web flow at #{past_date}")
          end

          # Create commit on behalf of org (org-owned repo only)
          if repo.in_organization?
            # Commit must be signed, so we'll use same metadata as above, but change the message
            verifiable_domain = org.verifiable_domains.first.domain
            metadata[:message] = "V important business\n\non-behalf-of: #{org.login} <org@#{verifiable_domain}>"
            head_ref.append_commit(metadata, author, { sign: true }) do |changes|
              changes.add("on-behalf-of-#{SecureRandom.hex}", "Commited on behalf of #{org} via web flow at #{past_date}")
            end
          end

          number_of_commits_created_so_far = repo.in_organization? ? 4 : 3

          # Create more commits if necessary
          number_of_random_commits = total_number_of_commits - number_of_commits_created_so_far
          if number_of_random_commits > 0
            Seeds::Objects::Commit.random_create(
              repo: repo,
              count: number_of_random_commits,
              branch: commits_pr_ref_name
            )
          end

          puts "\t\tOpening PR..."
          commits_pull = ::PullRequest.create_for!(
            repo,
            user: author,
            title: "Pull request with #{total_number_of_commits} commits",
            body: "This pull request has #{total_number_of_commits} commits.",
            head: commits_pr_ref_name,
            base: repo.default_branch,
            reviewer_user_ids: reviewer_user_ids,
            draft: draft_prs.shift,
          )
          puts "\t\tDone!\n"

          puts "\tCreating pull request branch off of a branch..."
          # Create the non-main base branch
          branch_off_branch_base_ref_name = "initial-based-off-branch-for-test"
          puts "\t\tCommitting changes to base branch #{branch_off_branch_base_ref_name}..."
          Seeds::Objects::Commit.create(
            repo: repo,
            message: "Changing one file",
            committer: author,
            branch_name: branch_off_branch_base_ref_name,
            from_branch: repo.default_branch,
            files: {
              "file-1.md" => "Last updated #{Time.current}"
            }
          )

          # Create the new head branch
          branch_off_branch_head_ref_name = "branched-off-base-branch-for-test"
          puts "\t\tCommitting changes to head branch #{branch_off_branch_head_ref_name}..."
          Seeds::Objects::Commit.create(
            repo: repo,
            message: "Changing one file",
            committer: author,
            branch_name: branch_off_branch_head_ref_name,
            from_branch: branch_off_branch_base_ref_name,
            files: {
              "file-2.md" => "Last updated #{Time.current}"
            }
          )

          puts "\t\tOpening PR..."
          branch_off_branch_pull = ::PullRequest.create_for(
            repo,
            user: author,
            title: "Pull request branched off of a branch",
            body: "This pull request is not pointed at main",
            head: branch_off_branch_head_ref_name,
            base: branch_off_branch_base_ref_name,
            reviewer_user_ids: reviewer_user_ids,
            draft: draft_prs.shift,
          )
          puts "\t\tDone!\n"
        end

        puts "\nDone!"
      end

      def self.create_comments(issue:, number_of_comments: 1, possible_commenter_ids: [])
        number_of_comments.times do |_i|
          commenter = User.find(possible_commenter_ids.sample)
          body = Faker::Lorem.paragraph
          ::Seeds::Objects::IssueComment.create(issue: issue, user: commenter, body: body)
        end
      end

      def self.create_pull_request_review_thread(pull:, possible_commenter_ids: [], position_options: {})
        # Creates a pull request review containing a thread and comment
        user = User.find(possible_commenter_ids.sample)
        review = pull.pending_review_for(user: user, head_sha: pull.head_sha)
        thread = review.build_thread

        start_line = position_options.fetch(:start_line, nil)
        start_side = position_options.fetch(:start_side, nil)
        side       = position_options.fetch(:side)
        line       = position_options.fetch(:line)
        path       = position_options.fetch(:path)

        comment = thread.build_first_comment(
          body: Faker::Lorem.paragraph,
          path: path,
          diff: pull.historical_comparison.diffs,
          start_line: start_line,
          start_side: start_side,
          line: line,
          side: side,
        )
        comment.save!
        review.save!
        review.trigger(:comment)
      end
    end
  end
end
