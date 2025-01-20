# frozen_string_literal: true

module Enterprise
  module ConfigApply
    module CodeScanning
      def code_scanning_enabled?
        !!raw_config.dig("app", "code-scanning", "enabled")
      end

      def code_scanning_disable_java_buildless_enabled?
        !!raw_config.dig("app", "code-scanning", "disable-java-buildless")
      end

      def code_scanning_disable_csharp_buildless_enabled?
        !!raw_config.dig("app", "code-scanning", "disable-csharp-buildless")
      end

      def code_scanning_app_services
        if code_scanning_enabled?
          # When the unicorns are ready to serve requests then we can start the
          # code scanning indexing process as this relies on an internal dotcom API
          # to fetch repository metadata.
          system_log("nomad job periodic force -detach turboscan-repo-indexer")

          # If Actions is enabled, we need to restore any CodeQL Action release tags that were deleted in the init-actions-graph step above.
          if actions_enabled? && ghes_cluster_delegate?
            ok, _ = system_log("/usr/local/bin/github-env bin/rake --trace enterprise:codeql_action:restore_release_tags[]")
            if !ok
              log_status "Restoring CodeQL Action release tags", :failed
              exit(1)
            end
          end
        end
      end
    end
  end
end
