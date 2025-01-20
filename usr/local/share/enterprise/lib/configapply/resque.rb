# frozen_string_literal: true
module Enterprise
  module ConfigApply
    module Resque
      # Resque::ViewHelpers holds methods that are only called by ERb templates,
      # like ViewHelpers but focused on Resque related methods
      module ViewHelpers
        def resqued_jobs_enabled
          return app_override("github", "resqued-jobs-enabled") unless app_override("github", "resqued-jobs-enabled").nil?
          return true if single_node?

          cluster_value_true?(cluster_node_name, "job-server")
        end

        def resqued_maintenance_enabled
          return app_override("github", "resqued-maintenance-enabled") unless app_override("github", "resqued-maintenance-enabled").nil?
          return true if single_node?
          return true if cluster_config.empty?

          cluster_value_true?(cluster_node_name, "git-server")
        end

        def resqued_low_workers
          value_override = app_override("github", "resqued-low-workers").to_i
          # if override value is nil or not a valid input, to_i will return 0
          return value_override if value_override > 0

          if dev_mode
            1
          else
            total_workers - resqued_high_workers
          end
        end

        def resqued_high_workers
          value_override = app_override("github", "resqued-high-workers").to_i
          # if override value is nil or not a valid input, to_i will return 0
          return value_override if value_override > 0

          if dev_mode
            1
          else
            if cpus >= 3
              2
            else
              1
            end
          end
        end

        def resqued_maint_workers
          value_override = app_override("github", "resqued-maint-workers").to_i
          # if override value is nil or not a valid input, to_i will return 0
          return value_override if value_override > 0

          # Allow for more parallel spokes maintenance & repair jobs.
          # Each worker can run a single job that will consume up to one CPU core
          # Allow for up to 5% of the available CPU cores, capped at 8 workers max
          (cpus * 5 / 100).floor.clamp(1, 8)
        end
      end
      include ViewHelpers
    end
  end
end
