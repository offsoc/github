# typed: true
# frozen_string_literal: true

require_relative "../runner"
# Do not require anything else here. If you need something for your runner, put that in `self.run`.
# This makes sure the boot time of our seeds stays low.

module Seeds
  class Runner
    class GhesActionsJobExecution < Seeds::Runner
      def self.help
        <<~HELP
        Seeds the ghes_actions_job_execution table with records
        HELP
      end

      @@event_types = %w[push pull_request]
      @@repo_visibility = %w[PUBLIC PRIVATE INTERNAL]
      @@runtime = %w[MACOS WINDOWS UBUNTU]
      @@runtime_version = ["1.0.0", "1.1.0"]
      @@runner_properties = [{ :machine_label => "Ubuntu" }, { :machine_label => "Windows" }]
      @@runner_type = %w[RUNNER_TYPE_SELF_HOSTED RUNNER_TYPE_HOSTED RUNNER_TYPE_CUSTOM]
      @@check_run_conclusions = %w[NEUTRAL SUCCESS FAILURE CANCELLED ACTION_REQUIRED TIMED_OUT SKIPPED STALE]

      def self.run(options = { days: 1, executions_per_day: 100 })
        puts "Creating #{options[:executions_per_day]} records for #{options[:days]} days"
        now = Time.now
        i = 0
        while i < options[:days]
          j = 0
          while j < options[:executions_per_day] do
            created_at = now - i.days
            started_at = created_at + rand(1..10).minutes
            finished_at = started_at + rand(1..10).minutes
            billable_ms = (finished_at - started_at) * 1000

            ::GhesActionsJobExecution.create!(
              event_id: SimpleUUID::UUID.new,
              invoking_event_type: @@event_types.sample,
              workflow_repository_id: 1,
              workflow_repository_global_id: "1",
              workflow_repository_visibility: @@repo_visibility.sample,
              workflow_build_id: 1,
              job_id: "1",
              job_runtime: @@runtime.sample,
              job_runtime_version: @@runtime_version.sample,
              job_check_run_id: 1,
              started_at: started_at,
              finished_at: finished_at,
              runner_properties: @@runner_properties.sample,
              runner_type: @@runner_type.sample,
              job_execution_billable_ms: billable_ms,
              job_check_run_conclusion: @@check_run_conclusions.sample,
              organization_id: 1,
              created_at: now - i.days)
            j += 1
          end
          i += 1
        end
      end
    end
  end
end
