# frozen_string_literal: true
module Enterprise
  module ConfigApply
    # PhaseSystemServices handles the "system services" (1st of 4) phase from #main
    module PhaseSystemServices
      # Hostname is right now pretty confusing. The problem comes from the fact
      # that we use hostname also in the system configuration, but it actually
      # means the domain name under which GHE is available.
      #
      # In a cluster setup, each node has it's own configured hostname, and the
      # github-hostname configuration value is the domain name the cluster is
      # accessible from in for example a browser.
      def hostname
        return cluster_node_name if cluster_enabled?

        # Here we use the configured domain name as a convenience. This is to
        # make it clear for admins what they are logged into. For ghe.io it
        # turns into ghe-io, so an admin who logs in sees admin@ghe-io as the
        # shell console.
        raw_config["github-hostname"].tr(".", "-")
      end

      def mysql_wait_timeout
        raw_config["mysql-wait-timeout"] || 600
      end

      def redis_wait_timeout
        raw_config["redis-wait-timeout"] || 600
      end

      def es_wait_timeout
        raw_config["es-wait-timeout"] || 300
      end

      def config_phase_system_services
        t0 = Time.now

        # Disable failovers while running configuration
        system_log("/usr/local/share/enterprise/ghe-orchestrator-client -c disable-global-recoveries") if cluster_regular_enabled?

        # prepare es system settings
        es_config_settings(raw_config)

        log_status "Preparing storage device", :configuring

        instrument_system("/usr/local/share/enterprise/ghe-storage-prepare", "Preparing storage", check_exit: true)

        log_status "Preparing storage device", :done
        log_status "Updating configuration", :configuring

        updated_services = instrument_call("update_configs", "Getting updated services")

        # set hostname to the right thing
        reload_fluent_bit = false
        if updated_services.delete?("hostname")
          system_log("hostnamectl set-hostname #{hostname}")
          reload_fluent_bit = true
        end

        # emulate old ssl-certificate service
        if updated_services.delete?("ssl-certificate") && !cluster_enabled?
          instrument_system("/usr/local/share/enterprise/ghe-ssl-update-self-signed", "Updating self-signed certificate")
        end

        FileUtils.mkdir_p("/data/user/common")
        File.write "/data/user/common/enabled", Time.now.to_i.to_s

        log_status "Updating configuration", :done
        log_status "Reloading system services", :configuring

        tz = (@config["timezone"] && @config["timezone"]["identifier"]) || "UTC"
        timezone_file = "/usr/share/zoneinfo/#{tz}"

        unless File.identical?("/etc/localtime", timezone_file)
          FileUtils.ln_sf(timezone_file, "/etc/localtime")
          File.open("/etc/timezone", "w") { |f| f.write(tz) }
          system_log("dpkg-reconfigure --frontend noninteractive tzdata")
          if $? != 0
            log "couldn't update timezone"
            @failures["timezone"] = "couldn't update timezone"
          end
        end

        instrument_call("get_service_list", "Getting service list")

        updated_services.delete("consul-replicate") unless cluster_ha_enabled? || cluster_dr_enabled?

        # we can only call set_service_state after the call to get_service_list, because that initialises required arrays
        if reload_fluent_bit
          # reload fluent-bit so we pickup the hostname change
          set_service_state("fluent-bit", true)
        end

        (BASE_SERVICES + SYS_SYSTEMD_SERVICES).each do |service|
          set_service_state(service, enabled_service?(service), :none) unless FAKE_SERVICES.include?(service)
        end

        # Restart resolvconf if /etc/resolvconf/resolv.conf.d/head has been modified since the last configuration run
        updated_services += ["resolvconf"] if File.new("/etc/resolvconf/resolv.conf.d/head").mtime.to_i > raw_config["configuration-id"].to_i

        instrument_call("update_firewall", "Updating firewall rules")

        ok, _ = system_log("/bin/systemctl is-active docker")
        if !ok
          instrument_system("/bin/systemctl start docker", "Starting docker")
        end

        # consul needs to be restarted before services that depend on it can be restarted
        if updated_services.delete?("consul")
          instrument_call("transition_service('consul', @services['consul'], :running, :reload)", "Reloading consul", name: "transition-consul-reload")
        end

        if updated_services.delete?("nomad-cleanup-required")
          instrument_system("/usr/local/share/enterprise/ghe-nomad-handle-change", "Handling changes to Nomad config")
        end

        # check if we need to reload systemd configs
        system_log("/bin/systemctl daemon-reload") if updated_services.delete?("systemd")

        changed_app_services = []
        attributes = {
          "command" => "set_service_state(...",
          "description" => "Setting service state on updated_services"
        }
        trace_event(attributes["description"], attributes) do |span|
          updated_services.each do |service|
            if FAKE_SERVICES.include?(service)
              next
            end
            ## Nomad services are reloaded by the nomad job module when template files change
            if SYS_NOMAD_SERVICES.include?(service)
              next
            end
            if APP_SYSTEMD_SERVICES.include?(service)
              changed_app_services << service
              next
            end
            if TOGGLE_SERVICES.include?(service)
              dna_key = DNA_ALIASES[service] || service
              if raw_config[dna_key] && raw_config[dna_key]["enabled"]
                set_service_state(service, :running, :reload)
              else
                set_service_state(service, :stopped)
              end
            else
              set_service_state(service, enabled_service?(service), :reload)
            end
            @service_sockets << SYSTEMD_SERVICE_SOCKETS[service] if enabled_service?(service) && SYSTEMD_SERVICE_SOCKETS[service] && !cluster_ha_replica?
          end
        end # end trace_event set_service_state

        SYS_NOMAD_SERVICES.each do |service|
          @service_sockets << NOMAD_SERVICE_SOCKETS[service] if enabled_service?(service) && NOMAD_SERVICE_SOCKETS[service] && !cluster_ha_replica?
        end

        update_consul_primary_dc if consul_server? && consul_primary_datacenter?

        instrument_call("transition_service_list", "Transitioning service list")

        if cluster_rebalance_enabled? && ghes_nomad_delegate?
          instrument_system("systemctl unmask cluster-rebalance.timer", "Enabling Cluster-Rebalance daemon")
          instrument_system("systemctl unmask cluster-rebalance.service", "Enabling Cluster-Rebalance daemon")
          instrument_system("systemctl enable cluster-rebalance.timer", "Enabling Cluster-Rebalance daemon")
          instrument_system("systemctl start cluster-rebalance.timer", "Starting Cluster-Rebalance daemon")
        else
          instrument_system("systemctl mask cluster-rebalance.timer", "Masking cluster-rebalance.timer")
          instrument_system("systemctl mask cluster-rebalance.service", "Masking cluster-rebalance.service")
        end

        log "synchronizing admin password..."
        instrument_system("/usr/local/bin/ghe-set-password --sync", "Syncing passwords")

        consul_acl_update if enable_consul_acl?

        # Wait up to 30 minutes for this phase's `systemctl --no-block` calls to finish
        instrument_call("wait_for_systemd_jobs(ALL_SYSTEMD_SERVICES, 1800.0)", "Waiting for systemd jobs", name: "wait_for_systemd_jobs(ALL_SYSTEMD_SERVICES)")

        # Wait for Nomad to be ready to take connections
        instrument_call("wait_for_service_status('nomad')", "Waiting for service status of 'nomad'")
        instrument_call("wait_for_nomad", "Waiting for Nomad itself to be available and ready to take connections")

        # Ensure Nomad is eligible to schedule jobs if it is online and not marked ineligible in NES
        instrument_call("nomad_ensure_eligibility", "Ensuring Nomad scheduling eligibility") if !cluster_value_true?(cluster_node_name, "offline") && (!nes_enabled? || nes_node_eligible?)

        # Consul-template needs a SIGHUP to reload in case that any template consul-template.d watches change
        # This command has "|| true" since consul could be not running in initial configuration
        instrument_system("/usr/local/share/enterprise/ghe-nomad-signal -l consul-template SIGHUP 2>&1 || true", "Reload Consul-template") if updated_services.delete?("consul-template")

        # If haproxy-cluster-proxy-config.timer is disabled signal Consul-Template for a reload
        # This prevents cases where it may keep attempting to reload HAProxy services even after starting 
        cluster_proxy_config_inactive = instrument_system("systemctl is-active haproxy-cluster-proxy-config.timer | grep inactive", "Checking haproxy-cluster-proxy-config status")
        data_proxy_config_inactive = instrument_system("systemctl is-active haproxy-data-proxy-config.timer | grep inactive", "Checking haproxy-data-proxy-config status")
        if nomad_job_running?("consul-template") && (cluster_proxy_config_inactive || data_proxy_config_inactive)
          instrument_system("/usr/local/share/enterprise/ghe-nomad-signal -l consul-template SIGHUP", "Reloading consul-template")
        end

        # If haproxy-frontend's config was change & it is already running send the local instance SIGUSR2 to reload config
        # Deleting this service from updated_services doesn't matter as that structure is only used when determining whether to start Systemd jobs
        if updated_services.delete?("haproxy-frontend")
          system_log("ghe-ssl-ca-certificate-install -c /etc/haproxy/ssl.crt")
          if nomad_job_running?("haproxy-frontend")
            system_log("/usr/local/share/enterprise/ghe-nomad-signal -l haproxy-frontend SIGUSR2")
          end
        end

        # Run Nomad System Jobs
        instrument_call("nomad_render_sys_jobs", "Rendering Nomad system jobs")
        instrument_call("nomad_run_sys_jobs", "Running Nomad system jobs")

        # memcached is only expected to be running in primary dc or active replica
        if primary_datacenter_or_active_replica_or_cache? || cluster_dr_replica?
          SYS_NOMAD_SERVICES << "memcached"
        end
        ## if telegraf is not enabled, remove it from SYS_NOMAD_SERVICES
        if !telegraf_enabled?
          SYS_NOMAD_SERVICES.delete("telegraf")
        end
        system_log("sudo systemctl stop nomad-jobs.timer")
        instrument_call("nomad_apply_jobs_and_wait_for_healthy(SYS_NOMAD_SERVICES)", "Applying Nomad System jobs (and waiting for them to be healthy)")
        system_log("sudo systemctl start nomad-jobs.timer")

        # Start & enable HAProxy config managers
        instrument_system("sudo systemctl enable haproxy-cluster-proxy-config.service", "Enabling haproxy-cluster-proxy-config.service")
        instrument_system("sudo systemctl start haproxy-cluster-proxy-config.service", "Starting haproxy-cluster-proxy-config.service")
        instrument_system("sudo systemctl enable haproxy-cluster-proxy-config.timer", "Enabling haproxy-cluster-proxy-config.timer")
        instrument_system("sudo systemctl start haproxy-cluster-proxy-config.timer", "Starting haproxy-cluster-proxy-config.timer")
        instrument_system("sudo systemctl enable haproxy-data-proxy-config.service", "Enabling haproxy-data-proxy-config.service")
        instrument_system("sudo systemctl start haproxy-data-proxy-config.service", "Starting haproxy-data-proxy-config.service")
        instrument_system("sudo systemctl enable haproxy-data-proxy-config.timer", "Enabling haproxy-data-proxy-config.timer")
        instrument_system("sudo systemctl start haproxy-data-proxy-config.timer", "Starting haproxy-data-proxy-config.timer")

        if mysql_enabled?
          # ensure that we're able to query against mysql, then
          # load initial mysql schema and user setup for local db
          instrument_call("wait_for_mysql_running", "Waiting for MySQL to be running")
          instrument_system("/usr/local/share/enterprise/systemd-scripts/mysql-setup-database", "Setting up the MySQL database")
        end

        log "waiting for services to restart..."
        # TODO instrument_call each call to wait_for_socket
        instrument_call("@service_sockets.each { |ss| wait_for_socket(ss) }", "Waiting for services to restart", name: "wait_for_socket")
        instrument_call("update_mysql_primary", "Updating MySQL primary")
        instrument_call("update_mysql_server_id", "Updating MySQL server ID")
        instrument_call("wait_for_redis_available", "Waiting for Redis to become available")
        instrument_call("update_redis_primary", "Updating Redis primary")
        instrument_call("wait_for_es_available", "Waiting for Elasticsearch to become available")

        # Wait for MySQL master to become reachable
        if ghes_cluster_delegate?
          command = "/usr/local/share/enterprise/ghe-service-wait-mysql 10"
          attributes = {
            "command" => command,
            "description" => "Waiting for MySQL master to become reachable"
          }
          trace_event("/usr/local/share/enterprise/ghe-service-wait-mysql", attributes) do |span|
            begin
              timeout = mysql_wait_timeout
              mysql_wait_attempts = 0
              loop_with_timeout(timeout) do
                log "Waiting for mysql to be available, attempt count: #{mysql_wait_attempts += 1}"
                ok, _ = system_log(command) # 10 second timeout included
                break if ok
              end
            rescue PhaseHelpers::LoopTimeoutError
              err_msg = "Timed out waiting #{timeout}s for MySQL master to be reachable!"
              log err_msg
              raise ConfigApplyException.new(err_msg, exit_status: 1)
            end
          end # end trace_event usr/local/share/enterprise/ghe-service-wait-mysql
        end

        # Now that haproxy-frontend is fielding requests turn off haproxy-pre-config.service
        system_log("/usr/local/share/enterprise/ghe-set-haproxy-pre-config disable")

        # Configure OpenTelemetry Collector
        instrument_system("/usr/local/share/enterprise/ghe-otelcol-configure", "Configuring OpenTelemetry Collector")

        log_status "Reloading system services", :done

        s = changed_app_services
        log_time "System services", t0
        s
      end
    end
  end
end
