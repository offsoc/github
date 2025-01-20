# frozen_string_literal: true

require_relative "../runner"
# Do not require anything else here. If you need something for your runner, put that in `self.run`.
# This makes sure the boot time of our seeds stays low.

module Seeds
  class Runner
    class Actions < Seeds::Runner
      class << self
        def help
          <<~EOF
          Seed workflows with workflow runs in github/hub repository

          Seeding
          - Enables Actions/workflow feature flags
          - Creates the Actions GitHub app
          - Creates workflows in the github/hub repository
          - Creates workflow runs with different outcomes for those workflows
          - Creates Actions survey
          - Emits usage data for each workflow run to meuse

          Example usage:
          $ bin/seed actions -w 20 -c 10 # Create 10 workflows with 20 runs each
          EOF
        end

        def run(options = { workflow_run_count: 20, workflow_count: nil })
          # Delay loading these at it makes the script app slow because it boots github
          require_relative "../../create-launch-github-app"

          enable_feature_flags

          app = create_and_install_github_app repo: hub_repo

          workflows = create_workflows(count: options[:workflow_count])

          puts "Creating #{options[:workflow_run_count]} runs for each workflow with usage data"
          options[:workflow_run_count].times do |i|
            workflows.each do |w|
              workflow_run = create_workflow_run(
                repo: hub_repo,
                app: app,
                name: w[:name],
                actor: mona,
                workflow_file_path: w[:workflow_file_path],
                # Create at least one successful run
                status: i < 1 ? ::CheckRun.statuses[:completed] : nil,
                conclusion: i < 1 ? ::CheckRun.conclusions[:success] : nil
              )
            end
          end

          puts "Creating Actions survey"
          create_survey
        end

        def mona
          @mona ||= Seeds::Objects::User.monalisa
        end

        def hub_repo
          @hub_repo ||= Seeds::Objects::Repository.hub_repo
        end

        def create_workflows(count:)
          if count.nil? || !count.positive?
            default_workflows
          else
            create_multiple_workflows(count)
          end
        end

        private

        def default_workflows
          puts "Creating workflows from template"

          workflows = [
            {
              name: "CI",
              template_id: "blank"
            },
            { name: "Node CI",
              template_id: "nodejs"
            }
          ]

          workflows.each do |w|
            w[:workflow_file_path] = create_workflow_from_template actor: mona, repo: hub_repo, template_id: w[:template_id]
          end

          workflows
        end

        def create_multiple_workflows(count)
          puts "Creating #{count} workflows"

          workflows = []
          files = {}

          (1..count).each do |i|
            name = "ci-#{'%03d' % i}"
            workflow = { name: name, workflow_file_path: ".github/workflows/#{name}.yml" }
            workflows << workflow

            content = File.read(Rails.root.join("script", "seeds", "data", "actions", "workflow_templates", "sample.yml"))
            files[workflow[:workflow_file_path]] = "name: #{name}\n" + content
          end

          Seeds::Objects::Commit.create(
            repo: hub_repo,
            message: "Add #{count} workflows",
            committer: mona,
            files: files
          )

          workflows
        end

        def enable_feature_flags
          puts "Enable feature flags for Actions"

          # Register and enable these feature flags
          [].each do |feature_flag|
            Seeds::Objects::FeatureFlag.toggle(action: "enable", feature_flag: feature_flag)
          end

          # Register and disable these feature flags
          [
            :actions_disable_scheduled_workflows,
            :actions_disable_status_postbacks,
            :actions_invoke_build_via_queue,
            :actions_scheduled_publish_to_queue,
            :actions_scheduled_process_via_queue,
            :actions_use_installation_token,
          ].each do |feature_flag|
            Seeds::Objects::FeatureFlag.toggle(action: "disable", feature_flag: feature_flag)
          end
        end

        def create_and_install_github_app(repo:)
          name = GitHub.launch_github_app_name
          puts "Creating GitHub Actions app with name '#{name}'"


          app = Integration.find_by(name: name)
          if !app.present?
            app = CreateLaunchGitHubApp.new.create_app
          else
            puts "App already exists."
          end

          puts "Installing app on #{repo.nwo} repository"
          installer = repo.owner.organization? ? repo.owner.admins.first : repo.owner
          owner_installation = app.installations_on(repo.owner).first
          if owner_installation.present?
            IntegrationInstallation::Editor.append(
              owner_installation,
              repositories: [repo],
              editor: installer,
              entry_point: :seeds_runners_actions_create_and_install_github_app
            )
          else
            app.install_on(
              repo.owner,
              repositories: [repo],
              installer: installer,
              entry_point: :seeds_runners_actions_create_and_install_github_app
            )
          end

          app
        end

        def create_workflow_from_template(actor:, repo:, template_id:)
          puts "Adding workflow from template #{template_id} to the repo"

          workflow_file_path = ".github/workflows/#{template_id}.yaml"

          Seeds::Objects::Commit.create(
            repo: repo,
            message: "Add workflow #{template_id}",
            committer: actor,
            files: {
              workflow_file_path => File.read(Rails.root.join("script", "seeds", "data", "actions", "workflow_templates", "#{template_id}.yml"))
            }
          )

          workflow_file_path
        end

        def create_workflow_run(repo:, app:, name:, actor:, workflow_file_path:, event: "push", status: nil, conclusion: nil)
          # Touch file for a commit
          branch_name = repo.default_branch
          commit = Seeds::Objects::Commit.create(repo: repo, committer: actor, branch_name: branch_name)

          if event == "push"
            push = Push.create!(
              before: commit.first_parent_oid,
              after: commit.oid,
              ref: "refs/heads/#{branch_name}",
              repository_id: repo.id,
              pusher: actor,
              pushed_at: Time.now
            )
          end

          status = status || ::CheckRun.statuses.values.sample
          completed = status == ::CheckRun.statuses[:completed]
          conclusion = conclusion || ::CheckRun.conclusions.values.sample
          success = conclusion == ::CheckRun.conclusions[:success]

          check_suite = Seeds::Objects::CheckSuite.create(
            repo: repo,
            app: app,
            push: push,
            head_branch: branch_name,
            head_sha: push.after,
            attrs: {
              name: name,
              status: status,
              conclusion: conclusion,
              workflow_file_path: workflow_file_path,
              event: event,
              explicit_completion: true,
              check_runs_rerunnable: false, # Individual GitHub Actions check runs are not re-runnable
              external_id: SecureRandom.uuid,
            })

          # create check_run with steps
          rand(1..4).times.each do |run|
            started_at = Time.now.utc - (rand(1..20).minutes)
            # If the check suite is completed, mark check run as completed, too, otherwise use random status.
            check_run_status = completed ? ::CheckRun.statuses[:completed] : ::CheckRun.statuses.values.sample
            check_run_completed = check_run_status == ::CheckRun.statuses[:completed]
            check_run_conclusion = if check_run_completed
              success ? ::CheckRun.conclusions[:success] : ::CheckRun.conclusions.values.sample
            else
              nil
            end
            check_run = check_suite.check_runs.create!(
              name:  SecureRandom.uuid,
              display_name: "Job #{run}",
              status: check_run_status,
              completed_at: check_run_completed ? Time.now.utc : nil,
              conclusion: check_run_conclusion,
              started_at: started_at,
              number: run,
              repository: repo,
              external_id: SecureRandom.uuid
            )

            # Create some annotations on the first check run if failed
            Seeds::Objects::CheckAnnotation.create_examples_for_check_run(check_run) if !success && run == 1

            rand(1..5).times.each do |step|
              check_step_status = check_step_status ? ::CheckRun.statuses[:completed] : ::CheckRun.statuses.values.sample
              check_step_completed = check_step_status == ::CheckRun.statuses[:completed]
              check_step_conclusion = if check_step_completed
                success ? ::CheckRun.conclusions[:success] : ::CheckRun.conclusions.values.sample
              else
                nil
              end
              check_run.steps.build(
                name: "Step #{step}",
                number: step,
                started_at: Time.new(2019, 5, 3, 12, 0, 0).utc,
                completed_at: check_step_completed ? Time.new(2019, 5, 3, 12, 1, 0).utc : nil,
                completed_log_url: "https://logs.github.com/some-unique-slug-step1",
                completed_log_lines: rand(10..30),
                status: check_step_status,
                conclusion: check_step_conclusion
              )
            end

            check_run.save!

            check_suite.save!

            # Emit usage to meuse of billing purposes
            # Normally a run would have to be completed for there to be any billing information, but we're creating data for everyone single run here regardless
            # For running meuse locally see https://github.com/github/meuse/blob/main/docs/dotcom-codespace.md
            minute_duration = rand(1..10)
            compute_usage = ::Billing::Actions::ComputeUsage.new(
              job_id: check_run.id,
              actor_id: actor.id,
              owner_id: repo.owner.id,
              owner: repo.owner,
              check_run_id: check_run.id,
              repository_id: repo.id,
              repository: repo,
              duration_in_milliseconds: minute_duration * 60000,
              job_runtime: random_billing_runtime,
              start_time: minute_duration.minute.ago,
              end_time: Time.now,
            )

            usage = compute_usage.to_meuse
            GlobalInstrumenter.instrument("meuse.metered_usage", usage)
          end
        end

        def create_survey
          require "github/transitions/20200227183944_create_actions_survey"

          if Survey.connection.select_value(Arel.sql("SELECT id FROM surveys WHERE slug = :slug", slug: GitHub::Transitions::CreateActionsSurvey::SURVEY_SLUG)).present?
            puts "Actions survey already exists."
          else
            puts "Creating Actions survey"

            transition = GitHub::Transitions::CreateActionsSurvey.new(dry_run: false)
            transition.perform
          end
        end

        def random_billing_runtime
          available_runtime = %w[
            MACOS
            LINUX
            WINDOWS
            linux_4_core
            linux_8_core
            linux_16_core
            linux_32_core
            linux_64_core
            windows_4_core
            windows_8_core
            windows_16_core
            windows_32_core
            windows_64_core
          ]
          available_runtime.sample
        end
      end
    end
  end
end
