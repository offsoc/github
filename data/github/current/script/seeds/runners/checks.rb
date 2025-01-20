# typed: true
# frozen_string_literal: true

require_relative "../runner"
# Do not require anything else here. If you need something for your runner, put that in `self.run`.
# This makes sure the boot time of our seeds stays low.

module Seeds
  class Runner
    class Checks < Seeds::Runner
      FLAGS = %w(suggested_change_in_annotations)

      class << self
        def help
          <<~EOF
          Seed check-runs with different results with no prior setup

          Seeding
          - Ensures github/hub exists
          - Ensures github/hub/main exists
          - Ensures two GitHub apps exist
          - Ensures apps are installed for github/hub
          - Creates a PR against main
          - Creates several checks for that PR
          EOF
        end

        def run(options = {})
          FLAGS.each do |flag|
            Seeds::Objects::FeatureFlag.toggle(action: "enable", feature_flag: flag)
          end

          # Initial setup, ensure repo and mona are available
          puts "Creating mona user and hub repo, if needed"
          mona = Seeds::Objects::User.monalisa
          hub_repo = Seeds::Objects::Repository.hub_repo

          # Integrations to which we can attribute checks
          puts "Creating 2 apps (Checks Buddy and Quality Buddy) if needed"
          app = Seeds::Objects::Integration.create(repo: hub_repo, owner: hub_repo.owner, app_name: "Checks Buddy")
          app2 = Seeds::Objects::Integration.create(repo: hub_repo, owner: hub_repo.owner, app_name: "Quality Buddy")

          puts "Creating a few commits on hub_repo default branch"
          # Manually create a commit to master for an annotation on a **file** outside the diff
          Seeds::Objects::Commit.create(**push_params(mona, hub_repo, 2))
          # Manually create a commit to master for an annotation on a **line** outside the diff
          Seeds::Objects::Commit.create(**push_params(mona, hub_repo, 3))

          # Create a branch on which we can make checks
          branch_name = "check-seed-data-#{Digest::SHA256.hexdigest(Time.now.to_s)[0, 8]}"
          puts "Creating branch #{branch_name} on hub_repo"
          Seeds::Objects::Repository.branch(hub_repo, branch_name)
          Seeds::Objects::Commit.create(**push_params(mona, hub_repo, 0, branch_name: branch_name))

          # Create pushes and associated checks suites/runs/steps etc.
          [1, 3].each do |data_entry|
            puts "For Push entry #{data_entry} in example file data"
            push = Seeds::Objects::Push.create(**push_params(mona, hub_repo, data_entry, branch_name: branch_name))

            # CheckSuite creation requires push processing jobs and CreateCheckSuitesJob to
            # run successfully, so may take some time.
            30.times do |i|
              unless ::CheckSuite.where(push_id: push.id).exists?
                puts "Retrying, check suite isn't in db yet, attempt: #{i + 1}"
                sleep(1.second)
              end
            end

            ::CheckSuite.where(push_id: push.id).each do |check_suite|
              check_suite.update(name: Faker::App.name) if check_suite.name.blank?
              puts "Creating artifacts for #{check_suite.name} check suite"
              Seeds::Objects::CheckSuite.create_artifacts(check_suite)
              if check_suite.github_app == app2
                puts " > Creating unconcluded checks for #{check_suite.name} check suite"
                puts "   on #{branch_name} using integration #{check_suite.github_app.name}"
                create_unconcluded_checks(check_suite)
              else
                puts " > Creating concluded checks for #{check_suite.name} check suite"
                puts "   on #{branch_name} using integration #{check_suite.github_app.name}"
                create_concluded_checks(check_suite)
              end
            end
          end

          # Only create pull request if annotations are successfully created
          sha = hub_repo.ref_to_sha(branch_name)
          check_run_ids = ::CheckRun.latest_ids_with_annotations_for_sha_and_repository(sha, hub_repo)
          if ::CheckAnnotation.where(check_run_id: check_run_ids).exists?
            puts "Creating pull request from #{branch_name} in #{hub_repo.name_with_display_owner}"
            ::PullRequest.create_for!(
              hub_repo,
              user: mona,
              title: "Pull request with check runs",
              body: Faker::Lorem.paragraph,
              head: branch_name,
              base: hub_repo.default_branch,
            )
          else
            puts "Not creating pull request. No annotations were created."
          end
        end

        private

        def push_params(mona, hub_repo, data_entry, branch_name: hub_repo.default_branch)
          {
            committer: mona,
            repo: hub_repo,
            branch_name: branch_name,
            files: { Seeds::Objects::CheckAnnotation::EXAMPLE_FILE_DATA[data_entry][:filename] =>
                    Seeds::Objects::CheckAnnotation::EXAMPLE_FILE_DATA[data_entry][:content] },
            message: "Add #{Seeds::Objects::CheckAnnotation::EXAMPLE_FILE_DATA[data_entry][:filename]}."
          }
        end

        def create_unconcluded_checks(check_suite)
          not_concluded_names = %w(benchmarks schemas)
          [:queued, :in_progress].each_with_index do |status, index|
            Seeds::Objects::CheckRun.create(
              check_suite,
              name: not_concluded_names[index],
              status: status,
              completed_at: nil,
              conclusion: nil,
              started_at: Time.now.utc - (10 + index),
              details_url: "#{check_suite.github_app.url}/run/123",
              repository: check_suite.repository,
            )
          end
        end

        def create_concluded_checks(check_suite)
          concluded_names = %w(
            enterprise-lint-schema
            enterprise-lint-schema-rails
            github
            github-all-features
            github-js
            enterprise
            github-rails-next
            github-is-on-fire
          )

          ::CheckRun.conclusions.each_pair do |conclusion, index|
            check_run_attrs = {
              name: concluded_names[index],
              status: :completed,
              completed_at: Time.now.utc,
              conclusion: conclusion,
              started_at: Time.now.utc - 10,
              details_url: "#{check_suite.github_app.url}/run/123",
              repository: check_suite.repository,
            }
            check_run = Seeds::Objects::CheckRun.create(check_suite, **check_run_attrs)

            case check_run.name
            when "github-all-features"
              Seeds::Objects::CheckRun.create_images_output(check_run)
              Seeds::Objects::CheckAnnotation.create_examples_for_check_run(check_run)
              Seeds::Objects::CheckRun.create_actions(check_run, additional: {
                label: "Override",
                identifier: "override",
                description: "Override these checks"
              })
            when "github-js"
              check_run.update(Seeds::Objects::CheckRun::IMAGE_OUTPUT)
            when "github"
              # create another CheckRun, this is equivalent to re-running a check
              re_check_run = Seeds::Objects::CheckRun.create(check_suite, **check_run_attrs)
              re_check_run.update(Seeds::Objects::CheckRun::MD_OUTPUT)
              Seeds::Objects::CheckRun.create_actions(re_check_run)
            when "enterprise"
              check_run.update(Seeds::Objects::CheckRun::MD_TABLE_OUTPUT)
            end
          end
        end
      end
    end
  end
end
