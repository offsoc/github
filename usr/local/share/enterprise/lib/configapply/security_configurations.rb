# frozen_string_literal: true

module Enterprise
    module ConfigApply
      module SecurityConfigurations
        def security_configurations_app_services
          if ghes_cluster_delegate?
            log "Running security configurations on_boot task"
            ok, _ = system_log("/usr/local/bin/github-env bin/rake --trace enterprise:security_configurations:on_boot")
            if ok
              log "security configurations on_boot successful"
            else
              log "security configurations on_boot task failed"
            end
          end
        end
      end
    end
  end
