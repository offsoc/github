# frozen_string_literal: true
module Enterprise
  module ConfigApply
    # PhaseAppServices handles the "application services" (3rd of 4) phase from #main
    module PhaseAppServices
      def config_phase_app_services(changed_app_services = [])
        log_status "Preparing storage device", :done
        log_status "Updating configuration", :done
        log_status "Reloading system services", :done
        log_status "Running migrations", :done
        log_status "Reloading application services", :configuring

        t0 = Time.now

        if cluster_ha_replica_enabled?
          if !File.exist?("/etc/github/repl-running") || File.read("/etc/github/repl-running") != `stat --printf='%Y' /proc/1`
            FileUtils.rm_f("/etc/github/repl-running")
            log "Starting replication..."
            instrument_system("sudo -u admin ghe-repl-start -c", "Starting replication", check_exit: true)
          end
          instrument_call("update_mysql_replication", "Updating MySQL replication")
          instrument_call("update_redis_replication", "Updating Redis replication")
          instrument_call("update_mssql_replication", "Updating MSSQL replication")
        elsif cluster_ha_replica_disabled?
          if File.exist?("/etc/github/repl-running")
            log "Stopping replication..."
            instrument_system("sudo -u admin ghe-repl-stop -c", "Stopping replication", check_exit: true)
          end
        else
          # Wait for MySQL to be healthy before continuing. This is currently required to work around a possible race condition
          # on cluster DR deployments. Nomad will restart MySQL if it has been stopped during the apply process.
          instrument_system("/usr/local/share/enterprise/ghe-service-wait-mysql", "Wait for MySQL to be healthy")
          log "Updating mysql, redis and mssql replication."
          instrument_call("update_mysql_replication", "Updating MySQL replication")
          instrument_call("update_redis_replication", "Updating Redis replication")
          instrument_call("update_mssql_replication", "Updating MSSQL replication")
        end

        # Put static placeholder page into place on HA and cluster DR replica nodes
        if cluster_replica?
          instrument_system("sudo /usr/local/share/enterprise/ghe-replica-mode-html", "Putting static placeholder page into place")
        end

        # Auto update check is only enabled on primary or standalone node.
        if cluster_ha_primary? || single_node?
          instrument_call("update_auto_update_job", "Updating auto update job if enabled")
        end

        # generate opensearch.xml
        instrument_system("/usr/local/bin/github-env bin/opensearch", "Generating opensearch.xml", log_event: false)

        instrument_call("get_service_list", "Getting service list")

        (APP_SYSTEMD_SERVICES + CLUSTER_SERVICES).each do |service|
          set_service_state(service, enabled_service?(service) ? :running : :stopped, changed_app_services.include?(service) ? :reload : :none)
          @service_sockets << SYSTEMD_SERVICE_SOCKETS[service] if enabled_service?(service) && SYSTEMD_SERVICE_SOCKETS[service] && !cluster_ha_replica?
        end

        APP_NOMAD_SERVICES.each do |service|
          @service_sockets << NOMAD_SERVICE_SOCKETS[service] if enabled_service?(service) && NOMAD_SERVICE_SOCKETS[service] && !cluster_ha_replica?
        end

        instrument_call("transition_service_list", "Transitioning service list")

        # Wait up to 2 minutes for this phase's `systemctl --no-block` calls to finish
        instrument_call("wait_for_systemd_jobs(ALL_SYSTEMD_SERVICES, 120.0)", "Waiting for systemd jobs", name: "wait_for_systemd_jobs(ALL_SYSTEMD_SERVICES)")

        # Run Nomad Application Jobs
        instrument_call("nomad_render_jobs", "Rendering Nomad jobs")
        instrument_call("nomad_run_app_jobs", "Running Nomad App jobs")
        instrument_call("nomad_apply_jobs_and_wait_for_healthy(APP_NOMAD_SERVICES)", "Applying Nomad App jobs (and waiting for them to be healthy)")

        log "waiting for services to restart..."
        instrument_call("@service_sockets.each { |ss| wait_for_socket(ss) }", "Waiting for services to restart", name: "wait_for_socket")

        if enabled_service?("github-timerd")
          instrument_system("/usr/local/bin/ghe-nomad-check-job -j github-timerd", "Starting the timerd service", check_exit: true)
        end

        if enabled_service?("github-resqued")
          instrument_system("/usr/local/bin/ghe-nomad-check-job -j github-resqued", "Starting the resqued service", check_exit: true)
        end

        # Initialize actions graph, only on single node or primary node in cluster
        if actions_enabled? && ghes_cluster_delegate?
          log "running ghe-run-init-actions-graph"
          instrument_system("/usr/local/share/enterprise/ghe-run-init-actions-graph", "Initializing the Actions graph", check_exit: true)
        end

        # check if secret scanning pre-reqs exist on the VMs (only when the service backed behaviour is enabled via configuration)
        if secret_scanning_enabled?
          instrument_call("check_secret_scanning_pre_reqs", "Checking if secret scanning pre-reqs exist")
        end

        # Once the unicorn is ready to serve requests, we need to remove the preflight page.
        if cluster_roles.include?("web-server") && primary_datacenter_or_active_replica?
          log "Running github-unicorn-post-start"
          instrument_system("/usr/local/bin/github-unicorn-post-start", "Finalizing github-unicorn service", check_exit: true)
        end

        if ghes_cluster_delegate?
          # Elasticsearch indices upgrade could take a long time and also will cause problem if
          # there are multiple runs of es:enterprise:upgrade. Prevent this by checking if there
          # was already an elasticsearch-upgrade.service being triggered.
          ok, _ = system_log("[ \"$(systemctl is-active elasticsearch-upgrade.service)\" = \"inactive\" ]")
          if ok
            # Kick off the indices upgrade, but don't block.
            instrument_system("/bin/systemctl --no-block start elasticsearch-upgrade.service", "Upgrading Elasticsearch indices (non-blocking)")
          end
        end

        if packages_enabled? && ghes_cluster_delegate?
          queue_nomad_job("/etc/nomad-jobs/packages-v2/packages-v2-index-repair.hcl")
        end

        BOOT_PAGES.each_pair do |service, file|
          next if !enabled_service?(service) || cluster_replica?

          attributes = {
            "description" => "Waiting for service #{service} boot page to be disabled"
          }
          trace_event(attributes["description"], attributes) do |span|
            timeout = 0
            while File.exist?(file)
              if timeout > 300
                err = "boot page for #{service} failed to disappear: #{file}"
                log err
                @failures["boot_page_for_" + service] = err
                break
              end
              timeout += 1
              sleep 1
            end
          end # end trace_event
        end

        code_scanning_app_services
        security_configurations_app_services

        # many jobs may have been stopped during this phase — clean them up from Nomad
        instrument_system("nomad system gc", "Running Nomad system gc")

        log_time "App Services", t0
      end
    end
  end
end
