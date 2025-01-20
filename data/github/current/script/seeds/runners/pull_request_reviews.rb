# typed: true
# frozen_string_literal: true

require_relative "../runner"
# Do not require anything else here. If you need something for your runner, put that in `self.run`.
# This makes sure the boot time of our seeds stays low.

module Seeds
  class Runner
    class PullRequestReviews < Seeds::Runner
      DEFAULT_AUTHOR = "monalisa"
      DEFAULT_ORG_NAME = "github"
      DEFAULT_ORG_REPO_NAME = "github"
      DEFAULT_REPO_NAME = "smile"
      DEFAULT_SUGGESTED_REVIEWERS = %w(octocat1 octocat2 octocat3).freeze
      DEFAULT_TEAMS = %w(team1 team2 team3).freeze
      DEFAULT_USERS = %w(octocat4 octocat5 octocat6).freeze

      def self.help
        <<~HELP
        Seed pull request review data for local development.

        - Creates six PRs (three in user-owned repo and three in org-owned repo):
          - Two with suggested reviewers
          - Two draft with CODEOWNERS reviewers (auto-assigned when PR is marked ready for review)
          - Two with mix of reviewers and review states
        - Ensures given PR author exists
        - Ensures given repo exists
        - Ensures given PR user reviewers exist
        - Ensures given PR team reviewers exist

        Options:
          -author, -u
            String name of the pull request author.
            Defaults to #{DEFAULT_AUTHOR}.
            Example: bin/seed pull_requests -u octocat
          -nwo, -r
            String "name with owner" of the pull request base repository.
            Defaults to #{DEFAULT_AUTHOR}/#{DEFAULT_REPO_NAME}.
            Example: bin/seed pull_requests -r octocat/octorepo
          -user_reviewers, -v
            Array of user reviewer logins.
            Defaults to #{DEFAULT_USERS}.
            Example: bin/seed pull_requests -v reviewer1 reviewer2
          -team_reviewers, -t
            Array of team reviewer names.
            Defaults to #{DEFAULT_TEAMS}.
            Example: bin/seed pull_requests -t team1 team2
        HELP
      end

      def self.run(options = {})
        # Ensure given author exists
        author_login = options[:author] || DEFAULT_AUTHOR
        puts "Finding or creating PR author #{author_login}..."
        author = Seeds::Objects::User.create(login: author_login)

        # Ensure given repo exists
        repo_nwo = options[:nwo] || "#{author_login}/#{DEFAULT_REPO_NAME}"
        puts "Finding or creating repo #{repo_nwo}..."
        repo = Seeds::Objects::Repository.create_with_nwo(nwo: repo_nwo, setup_master: true)

        # Ensure script has one user-owned repo and one org-owned repo
        if repo.in_organization?
          org_repo = repo

          # Ensure repo's org exists
          puts "Finding or creating organization @#{repo.owner_login}..."
          org = Seeds::Objects::Organization.create(login: repo.owner_login, admin: author)

          # Create user-owned repo
          user_repo_nwo = "#{author_login}/#{DEFAULT_REPO_NAME}"
          puts "Creating user-owned repo #{user_repo_nwo}..."
          user_repo = Seeds::Objects::Repository.create_with_nwo(nwo: user_repo_nwo, setup_master: true)
        else
          user_repo = repo

          # Create org (required for teams)
          puts "Creating organization #{DEFAULT_ORG_NAME}..."
          org = Seeds::Objects::Organization.create(login: DEFAULT_ORG_NAME, admin: author)

          # Create org-owned repo (required for teams)
          org_repo_nwo = "#{DEFAULT_ORG_NAME}/#{DEFAULT_ORG_REPO_NAME}"
          puts "Creating org-owned repo #{org_repo_nwo}..."
          org_repo = Seeds::Objects::Repository.create_with_nwo(nwo: org_repo_nwo, setup_master: true)
        end

        # Ensure given teams exist
        team_names = options[:team_reviewers] || DEFAULT_TEAMS
        teams = team_names.map do |team_name|
          puts "Finding or creating team @#{org}/#{team_name}..."
          team = Seeds::Objects::Team.create!(name: team_name, org: org)
          team&.add_repository(org_repo, :push)
          team
        end

        # Ensure given user reviewers exist
        user_reviewer_logins = options[:user_reviewers] || DEFAULT_USERS
        user_reviewers = user_reviewer_logins.map do |user_reviewer_login|
          puts "Finding or creating reviewer with login @#{user_reviewer_login}..."
          Seeds::Objects::User.create(login: user_reviewer_login)
        end

        # Create suggested reviewers
        suggested_reviewer_logins = DEFAULT_SUGGESTED_REVIEWERS
        suggested_reviewers = suggested_reviewer_logins.map do |suggested_reviewer_login|
          puts "Creating suggested reviewer with login @#{suggested_reviewer_login}..."
          Seeds::Objects::User.create(login: suggested_reviewer_login)
        end

        # Add users to user-owned and org-owned repos
        all_users = [author] | user_reviewers | suggested_reviewers
        all_users.each do |user|
          puts "Adding @#{user} to #{user_repo.nwo} as member with write permissions..."
          user_repo.add_member(user)
          puts "Adding @#{user} to #{org_repo.nwo} as member with write permissions..."
          org.add_member(user)
          org_repo.add_member(user)
        end

        # Ensure teams have at least one member
        teams.each do |team|
          unless team.members.count > 0
            members = all_users.sample(rand(2..3))
            members.each { |member| team.add_member(member) }
          end
        end

        default_files = {
          "README.md" => "#{Faker::Lorem.paragraphs.join("\n\n")}\n",
          "one/update_me.rb" => "# todo: update me\n\n#{Faker::Source.print_1_to_10(lang: :ruby)}",
          "one/two/delete_me.js" => "// todo: delete me\n\n#{Faker::Source.print_1_to_10(lang: :javascript)}",
          "one/two/three/rename_me.txt" => "todo: rename me\n\n#{Faker::Lorem.paragraphs.join("\n\n")}\n",
          "Gemfile.lock" => "# manifest file\n\n#{Faker::Lorem.paragraphs.join("\n\n")}",
          "file_with_a_pretty_pretty_pretty_pretty_long_name" => "Name should be truncated\n\n#{Faker::Lorem.paragraphs.join("\n\n")}\n",
        }

        # Loop through each repo, create PRs in each
        [user_repo, org_repo].each do |repo|
          # Build files for initial commit
          user_codeowners = repo.members - [author]
          team_codeowners = repo.in_organization? ? repo.teams : []

          codeowners = user_codeowners | team_codeowners
          codeowners_file_text = codeowners.map { |codeowner| "owned_files/#{codeowner}/* @#{codeowner}" }.join("\n")
          files = default_files.merge({ "CODEOWNERS" => codeowners_file_text })
          codeowners.each do |user|
            files["owned_files/#{user}/README.md"] = Faker::Lorem.paragraph
          end

          # Add initial commit to repo
          Seeds::Objects::Commit.create(
            repo: repo,
            committer: author,
            message: "Initial commit",
            files: files
          )

          puts "Creating PR with suggested reviewers in #{repo.nwo}..."
          # Commit to base ref as each suggested reviewer
          suggested_reviewers.each.with_index do |reviewer, index|
            Seeds::Objects::Commit.create(
              repo: repo,
              committer: reviewer,
              message: "Make some changes",
              files: { files.keys[index] => "#{files.values[index]}\n\nUpdated by #{reviewer} at #{Time.current}" }
            )
          end

          # Commit to head ref as author
          head_ref_name = "branch-#{SecureRandom.hex}"
          head_ref = repo.refs.create("refs/heads/#{head_ref_name}", repo.default_oid, author)
          metadata = { message: "Change files with suggested reviewers", committer: author, author: author }
          head_ref.append_commit(metadata, author) do |changes|
            suggested_reviewers.each.with_index do |_reviewer, index|
              changes.add(files.keys[index], "#{files.values[index]}\n\nUpdated by #{author} at #{Time.current}")
            end
            changes.add("new-file-#{SecureRandom.hex}", Faker::Lorem.paragraphs.join("\n\n"))
          end

          # Create PR from author that'll have all suggested reviewers
          ::PullRequest.create_for!(
            repo,
            user: author,
            title: "Pull request with suggested reviewers",
            body: Faker::Lorem.paragraphs.join("\n\n"),
            head: head_ref_name,
            base: repo.default_branch,
          )

          puts "Creating draft PR with CODEOWNERS reviewers in #{repo.nwo}..."
          # Commit to head ref as author
          head_ref_name = "branch-#{SecureRandom.hex}"
          head_ref = repo.refs.create("refs/heads/#{head_ref_name}", repo.default_oid, author)
          metadata = { message: "Change owned files", committer: author, author: author }
          codeowners_subset = team_codeowners.sample(2) | user_codeowners.sample(2)
          head_ref.append_commit(metadata, author) do |changes|
            codeowners_subset.each do |codeowner|
              path = "owned_files/#{codeowner}/README.md"
              changes.add(path, "#{files[path]}\n\nUpdated by #{author} at #{Time.current}")
            end
            changes.add("unowned-file-#{SecureRandom.hex}", Faker::Lorem.paragraphs.join("\n\n"))
          end

          # Create PR from author that touches owned files
          ::PullRequest.create_for!(
            repo,
            user: author,
            title: "Pull request with auto-assigned reviewers",
            body: Faker::Lorem.paragraphs.join("\n\n"),
            head: head_ref_name,
            base: repo.default_branch,
            draft: true
          )

          puts "Creating ready PR with CODEOWNERS reviewers in #{repo.nwo}..."
          # Commit to head ref as author
          head_ref_name = "branch-#{SecureRandom.hex}"
          head_ref = repo.refs.create("refs/heads/#{head_ref_name}", repo.default_oid, author)
          metadata = { message: "Change owned files", committer: author, author: author }
          codeowners_subset = team_codeowners.sample(2) | user_codeowners.sample(2)
          head_ref.append_commit(metadata, author) do |changes|
            codeowners_subset.each do |codeowner|
              path = "owned_files/#{codeowner}/README.md"
              changes.add(path, "#{files[path]}\n\nUpdated by #{author} at #{Time.current}")
            end
            changes.add("unowned-file-#{SecureRandom.hex}", Faker::Lorem.paragraphs.join("\n\n"))
          end

          # Create PR from author that touches owned files
          ::PullRequest.create_for!(
            repo,
            user: author,
            title: "Pull request with auto-assigned reviewers (not draft)",
            body: Faker::Lorem.paragraphs.join("\n\n"),
            head: head_ref_name,
            base: repo.default_branch
          )

          puts "Creating PR with mix of reviewers and review states in #{repo.nwo}..."
          # Setup data for file changes
          teams_subset = teams.sample(2)
          user_reviewers_subset = user_reviewers.sample(2)
          team_codeowner = (team_codeowners - teams_subset).sample
          user_codeowner = (user_codeowners - user_reviewers_subset).sample

          codeowner_file_paths = \
            # Team codeowner not present for user-owned repos
            [team_codeowner, user_codeowner].compact.map do |codeowner|
              "owned_files/#{codeowner}/README.md"
            end

          random_file_paths = (files.keys - codeowner_file_paths).shuffle
          paths_to_update = random_file_paths.pop(2)
          paths_to_remove = random_file_paths.pop(2)
          paths_to_rename = random_file_paths.pop(2)

          # Commit to head ref as author
          head_ref_name = "branch-#{SecureRandom.hex}"
          head_ref = repo.refs.create("refs/heads/#{head_ref_name}", repo.default_oid, author)
          metadata = { message: "Change lots of files", committer: author, author: author }
          head_ref.append_commit(metadata, author) do |changes|
            paths_to_update.each do |path|
              changes.add(path, "#{files[path]}\n\nUpdated by #{author} at #{Time.current}")
            end
            paths_to_remove.each do |path|
              changes.remove(path)
            end
            paths_to_rename.each do |path|
              changes.move(path, "#{path}-renamed", "#{files[path]}\n\nUpdated by #{author} at #{Time.current}")
            end
            codeowner_file_paths.each do |path|
              changes.add(path, "#{files[path]}\n\nUpdated by #{author} at #{Time.current}")
            end
            changes.add("new-file-#{SecureRandom.hex}", Faker::Lorem.paragraphs.join("\n\n"))
          end

          # Create PR from author with lots of changed files
          reviewable_pull = \
            ::PullRequest.create_for!(
              repo,
              user: author,
              title: "Pull request with mix of reviewers and review states",
              body: Faker::Lorem.paragraphs.join("\n\n"),
              head: head_ref_name,
              base: repo.default_branch,
            )

          review_states = ::PullRequestReview.workflow_spec.states.keys - [:dismissed]
          available_review_states = review_states.dup
          requestable_teams = (teams_subset | [team_codeowner]).compact # Team codeowner not present for user-owned repos
          requestable_users = user_reviewers_subset | [user_codeowner]

          # Create team review requests
          if repo.in_organization?
            requestable_teams.each do |team|
              # Skip re-requests
              next if reviewable_pull.review_requests.where(reviewer: team).exists?
              puts "Requesting review from @#{team}..."
              reviewable_pull.review_requests.create(reviewer: team)
            end
          end

          # Create user review requests
          requestable_users.each do |reviewer|
            # Skip re-requests
            next if reviewable_pull.review_requests.where(reviewer: reviewer).exists?
            next if reviewable_pull.reviews.where(user: reviewer).exists?
            puts "Requesting review from @#{reviewer}..."
            reviewable_pull.review_requests.create(reviewer: reviewer)
          end

          # Create team reviews
          if repo.in_organization?
            requestable_teams.each do |team|
              reviewer = (team.members - [author]).sample
              # Skip re-reviews
              next if reviewable_pull.reviews.where(user: reviewer).exists?
              review_state = available_review_states.pop || review_states.sample
              puts "Adding #{review_state} review from team member @#{reviewer}..."
              Seeds::Objects::PullRequestReview.create(
                pull_request: reviewable_pull,
                user: reviewer,
                state: review_state
              )
            end
          end

          # Create user reviews
          requestable_users.each do |reviewer|
            # Skip re-reviews
            next if reviewable_pull.reviews.where(user: reviewer).exists?
            review_state = available_review_states.pop || review_states.sample
            puts "Adding #{review_state} review from @#{reviewer}..."
            Seeds::Objects::PullRequestReview.create(
              pull_request: reviewable_pull,
              user: reviewer,
              state: review_state
            )
          end

          # Create review from unrequested user
          requested_user_ids = reviewable_pull.review_requests.type_users.pluck(:reviewer_id)
          unrequested_user_ids = all_users.map(&:id) - [author.id] - requested_user_ids
          unrequested_reviewer = User.find(unrequested_user_ids.sample)
          review_state = available_review_states.pop || review_states.sample

          existing_review_requests = reviewable_pull.review_requests.where(reviewer: unrequested_reviewer).exists?
          existing_reviews = reviewable_pull.reviews.where(user: unrequested_reviewer).exists?

          if !existing_review_requests && !existing_reviews
            puts "Adding #{review_state} review from unrequested reviewer @#{unrequested_reviewer}..."
            Seeds::Objects::PullRequestReview.create(
              pull_request: reviewable_pull,
              user: unrequested_reviewer,
              state: review_state
            )
          end
        end

        puts "Done!"
      end
    end
  end
end
