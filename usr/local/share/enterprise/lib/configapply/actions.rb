# frozen_string_literal: true

module Enterprise
  module ConfigApply
    module Actions
      def actions_schedule_tasks_per_tick
        return "10" if raw_config.dig("app", "actions", "schedule-tasks-per-tick").nil? || raw_config.dig("app", "actions", "schedule-tasks-per-tick").empty?
        raw_config.dig("app", "actions", "schedule-tasks-per-tick")
      end

      def actions_schedule_loop_sleep_duration
        return "1m" if raw_config.dig("app", "actions", "schedule-tasks-per-tick").nil? || raw_config.dig("app", "actions", "schedule-loop-sleep-duration").empty?
        raw_config.dig("app", "actions", "schedule-loop-sleep-duration")
      end

      def actions_launch_debug
        return false if raw_config.dig("app", "actions", "launch-debug").nil?
        raw_config.dig("app", "actions", "launch-debug")
      end

      def actions_enabled?
        !!raw_config.dig("app", "actions", "enabled")
      end

      def actions_ever_enabled?
        !!raw_config.dig("app", "actions", "enabled") || File.file?("/data/user/actions/states/actions_state")
      end

      def actions_updates_disabled?
        !!raw_config.dig("app", "actions", "updates-disabled")
      end

      def actions_test_org_created?
        return !actions_test_org.nil? && !actions_test_org.empty?
      end

      def actions_test_org
        return raw_config.dig("app", "actions", "actions-org")
      end

      # Returns the minimum amount of memory, in MBs, required to run MSSQL.
      def mssql_minimum_alloc
        (2 * GIGABYTE / MEGABYTE.to_f).floor
      end

      # Returns the amount of memory, in MBs, allocated to MSSQL on this node.
      def memory_budget_mssql_mb
        allocation = (memory_budget("mssql-server") / MEGABYTE.to_f).floor
        minimum = mssql_minimum_alloc

        if actions_ever_enabled? && allocation < minimum
          logger.warn "WARNING: The current MSSQL memory allocation (#{allocation} MBs) is less than the recommended minimum of #{minimum} MBs. MSSQL startup may fail."
        end

        return allocation
      end

      def actions_blob_storage_connection_string
        return actions_storage_azure_connection_string if actions_blob_storage_provider == "azure"
        return actions_storage_s3_connection_string    if actions_blob_storage_provider == "s3"
        return actions_storage_gcs_connection_string   if actions_blob_storage_provider == "gcs"
      end

      def actions_rate_limiting_enabled
        return false if raw_config.dig("actions-rate-limiting", "enabled").nil?
        raw_config.dig("actions-rate-limiting", "enabled")
      end

      def actions_rate_limiting_queue_runs_per_minute
        return 1000 if raw_config.dig("actions-rate-limiting", "queue-runs-per-minute").nil?
        raw_config.dig("actions-rate-limiting", "queue-runs-per-minute")
      end

      private

      def actions_blob_storage_provider
        secret_value("actions", "storage", "blob-provider")
      end

      def actions_storage_provider_auth_type
        secret_value("actions", "storage", "auth-type")
      end

      def actions_storage_azure_connection_string
        if actions_storage_provider_auth_type == "oidc"
          tenant_id = secret_value("actions", "storage", "azure-oidc", "tenant-id")
          client_id = secret_value("actions", "storage", "azure-oidc", "client-id")
          storage_account = secret_value("actions", "storage", "azure-oidc", "storage-account")
          endpoint_suffix = secret_value("actions", "storage", "azure-oidc", "endpoint-suffix")
          connection_string ="TenantId=#{tenant_id};ClientId=#{client_id};StorageAccount=#{storage_account};EndpointSuffix=#{endpoint_suffix};EnterpriseIdentifier=#{raw_config['github-hostname']}"
          connection_string

        else
          secret_value("actions", "storage", "azure", "connection-string")
        end
      end

      def actions_storage_gcs_connection_string
        path_prefix = "#{raw_config['github-hostname']}/actions"
        if actions_storage_provider_auth_type == "oidc"
          service_url = secret_value("actions", "storage", "gcs-oidc", "service-url")
          bucket_name = secret_value("actions", "storage", "gcs-oidc", "bucket-name")
          workload_id = secret_value("actions", "storage", "gcs-oidc", "workload-id")
          service_acc = secret_value("actions", "storage", "gcs-oidc", "service-acc")
          connection_string = "BucketName=#{bucket_name};ServiceUrl=#{service_url};WorkloadProviderId=#{workload_id};ServiceAccount=#{service_acc};PathPrefix=#{path_prefix};EnterpriseIdentifier=#{raw_config['github-hostname']}"
        else
          service_url = secret_value("actions", "storage", "gcs", "service-url")
          bucket_name = secret_value("actions", "storage", "gcs", "bucket-name")
          access_key_id = secret_value("actions", "storage", "gcs", "access-key-id")
          access_secret = secret_value("actions", "storage", "gcs", "access-secret")
          force_path_style = secret_value("actions", "storage", "gcs", "force-path-style")
          connection_string = "BucketName=#{bucket_name};AccessKeyId=#{access_key_id};SecretAccessKey=#{access_secret};ServiceUrl=#{service_url};PathPrefix=#{path_prefix}"
          connection_string = "#{connection_string};ForcePathStyle=#{force_path_style}" unless force_path_style.nil?
        end
        connection_string
      end

      def actions_storage_s3_connection_string
        path_prefix = "#{raw_config['github-hostname']}/actions"
        if actions_storage_provider_auth_type == "oidc"
          bucket_name = secret_value("actions", "storage", "s3-oidc", "bucket-name")
          role_arn = secret_value("actions", "storage", "s3-oidc", "role-arn")
          region = secret_value("actions", "storage", "s3-oidc", "region")
          sts_endpoint = secret_value("actions", "storage", "s3-oidc", "sts-endpoint")
          connection_string = "BucketName=#{bucket_name};RoleARN=#{role_arn};Region=#{region};PathPrefix=#{path_prefix};EnterpriseIdentifier=#{raw_config['github-hostname']}"
          connection_string = "#{connection_string};STSEndpoint=#{sts_endpoint}" unless sts_endpoint.nil? || sts_endpoint.strip.empty?
        else
          service_url = secret_value("actions", "storage", "s3", "service-url")
          bucket_name = secret_value("actions", "storage", "s3", "bucket-name")
          access_key_id = secret_value("actions", "storage", "s3", "access-key-id")
          access_secret = secret_value("actions", "storage", "s3", "access-secret")
          force_path_style = secret_value("actions", "storage", "s3", "force-path-style")
          connection_string = "BucketName=#{bucket_name};AccessKeyId=#{access_key_id};SecretAccessKey=#{access_secret};ServiceUrl=#{service_url};PathPrefix=#{path_prefix}"
          connection_string = "#{connection_string};ForcePathStyle=#{force_path_style}" unless force_path_style.nil?
        end
        connection_string
      end
    end
  end
end
