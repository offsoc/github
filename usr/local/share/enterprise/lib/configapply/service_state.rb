# frozen_string_literal: true
module Enterprise
  module ConfigApply
    # ServiceState contains methods that query and manipulate the running state
    # of systemd service units (i.e. wraps systemctl)
    module ServiceState
      ESCAPE_ROUTINES = {
        /\.sh\.erb$/ => ->(str) { str.split("'").join("'\\''") },
        /collectd\.conf\.erb$/ => ->(str) { str.gsub(/\\/, '\\\\').gsub(/"/, '\"') }
      }.freeze

      def get_service_list
        @services = {}
        (ALL_SYSTEMD_SERVICES).each do |service|
          @services[service] = if service == "systemd"
                                 :running
                               else
                                 system("/bin/systemctl", "--quiet", "is-active", service) ? :running : :stopped
                               end
        end
        @service_transition = @services.dup
        @service_actions = {}
      end

      def set_service_state(service, state, action = nil)
        state ||= :stopped
        state = :running if state == true
        @service_transition[service] = state
        action = :reload if action.nil? && @services[service] == :running && state == :running
        @service_actions[service] = action || :none
        log "Service #{service} needs to be #{state} (#{action})"
      end

      def transition_service_list
        @service_transition.each do |service, state|
          next if service == "systemd"

          action = @service_actions[service]
          current_state = @services[service]
          transition_service(service, current_state, state, action)
        end
      end

      def run_oneshot_service(service, blocking = true)
        log "Running oneshot service #{service}"
        no_block_flag = blocking ? "" : "--no-block "
        system_log("/bin/systemctl #{no_block_flag}start #{service}")
      end

      # wait_for_systemd_jobs blocks until systemd's queue of jobs is empty,
      # and can be used at the end of each "configuration phase"
      # like #config_phase_system_services.
      # If the timeout expires, writes to log and returns false; returns true otherwise
      def wait_for_systemd_jobs(services = ALL_SYSTEMD_SERVICES, timeout = 120.0)
        systemd_unit_names = services.map { |s| s + ".service" }
        list_jobs_cmd = %w[/bin/systemctl list-jobs --no-legend] + systemd_unit_names

        out = ""
        loop_with_timeout(timeout) do
          out = IO.popen(list_jobs_cmd) { |f| f.read }
          # #16862, to maintain stretch forward compatibility, will require that we
          # filter out the "No jobs" line as the stretch systemctl removes this
          # from the output when using --no-legend
          out_filtered = out.lines.reject { |line| line =~ /^No jobs/ }.join
          break if out_filtered == ""

          sleep 0.1
        end
        true
      rescue PhaseHelpers::LoopTimeoutError
        log "Timed out waiting #{timeout}s for systemd jobs: " + out.lines.join(", ")
        false
      end

      def wait_for_service_status(service, expected_status = :running, timeout = 30)
        log "Waiting for #{service} to be #{expected_status}"
        timeout.times do
          status = system("/bin/systemctl", "--quiet", "is-active", service) ? :running : :stopped

          if status == expected_status
            log "#{service} is #{expected_status}"
            return
          else
            sleep 1
          end
        end
        log "#{service} did not transition to state #{expected_status} in #{timeout} seconds"
      end

      def transition_service(service, current_state, state, action, blocking = false)
        log "Service #{service} #{current_state} -> #{state} with action #{action || :none}"
        # Services that need to be running should always be enabled
        no_block_flag = blocking ? "" : "--no-block "
        if state == :running && current_state != :running
          system_log("/bin/systemctl --job-mode=\"replace-irreversibly\" #{no_block_flag}start #{service}")
        elsif state == :stopped && current_state != :stopped
          system_log("/bin/systemctl --job-mode=\"replace-irreversibly\" #{no_block_flag}stop #{service}")
        elsif state == :running && current_state == :running && action == :reload
          if HOTRELOAD_SERVICES.include?(service)
            system_log("/bin/systemctl reload #{service}")
          else
            system_log("/bin/systemctl #{no_block_flag}restart #{service}")
          end
        end
        unit_extension = service.split(".").last == "path" ? "path" : "service"
        service_name = service.split(".").reverse.drop(1).reverse.join(".")
        if state == :running
          system_log("/bin/systemctl enable #{service}.#{unit_extension}") unless NO_INSTALL_SERVICES.include?(service)
        end
        if state == :stopped
          system_log("/bin/systemctl disable #{service}.#{unit_extension}") unless NO_INSTALL_SERVICES.include?(service)
        end
        @services[service] = state
        @service_actions[service] = nil
      end

      def enabled_service?(service)
        return true if BASE_SERVICES.include?(service)
        return true if EAP_SERVICES.include?(service) && eap_enabled?(service)
        return false if service == "consul-replicate" && !consul_replicate?
        return false if service == "wireguard" && !wireguard_enabled?
        return false if service == "postfix" && !postfix_enabled?
        return false if service == "nomad-jobs" && !ghes_nomad_delegate?
        return numa_enabled? if service == "numad"
        return nes_enabled? if service == "nes"
        return dependency_graph_enabled? if service == "dependency-graph-api"
        return dependency_graph_enabled? if service == "dependency-snapshots-api"
        return dependabot_enabled? if service.start_with? "dependabot"
        return mysql_enabled? if ["mysql"].include?(service)
        # Check GHE_CONFIG_PHASE == 3 to make sure `update_mysql_replication` is done, so orchestrator is running in
        # a cluster environment
        return orchestrator_enabled? if service == "orchestrator"
        return (SYS_SERVICES + APP_SERVICES + ["resolvconf"]).include?(service) unless cluster_enabled?

        return (SYS_SERVICES + APP_SERVICES + ["resolvconf"]).include?(service) if SERVICES_MAP[service].nil?
        return false unless cluster_config["cluster"]
        return false if cluster_value_true?(cluster_node_name, "offline")

        enabled = false
        role = ""
        SERVICES_MAP[service].each do |r|
          role = r
          if cluster_value(cluster_node_name) && cluster_value(cluster_node_name, role.delete("!"))
            enabled = true
            break
          end
        end

        # A '!' before the role name in SERVICES_MAP file means enabled in
        # every node except the ones with this role.
        enabled = !enabled if role.start_with?("!")

        if ["alive", "authnd", "authzd", "hookshot-go", "kafka-lite", "kredz-hydro-consumer", "mail-replies", "notebooks", "postfix", "treelights", "viewscreen"].include?(service)
          enabled = enabled && nomad_primary_datacenter?
        end

        if ["codeload", "github-unicorn", "kredz", "kredz-varz", "pages"].include?(service)
          enabled = enabled && primary_datacenter_or_active_replica?
        end

        if ["babeld", "github-gitauth", "lfs-server"].include?(service)
          enabled = enabled && primary_datacenter_or_active_replica_or_cache?
        end

        if ["elasticsearch"].include?(service)
          enabled = enabled && !cluster_ha_replica_cache?
        end

        enabled
      end

      def update_configs(silent = false)
        if raw_config["auth-mode"] == "saml" && raw_config["saml"]
          File.open(raw_config["saml"]["certificate-path"], "w") do |cert_file|
            cert_file << raw_config["saml"]["certificate"]
          end
        end

        updated_services = Set.new
        CONFIG_FILES.each do |config_file, services|
          old_file_contents = File.read(config_file) if File.exist?(config_file)
          tmpl = "/etc/github/templates#{config_file}.erb"
          tmpl_file_contents = File.open(tmpl).read
          begin
            @config = escape_object_for_file(raw_config, tmpl)
            @secrets = secrets_config
            @engineID = node_uuid.delete("-")[0...27]
            b = binding
            rendered_file_contents = ERB.new(tmpl_file_contents, trim_mode: "-").result(b)
          rescue StandardError => e
            log "Exception: #{e}"
            line = e.backtrace.grep(/^\(erb\)/)[0].split(":")[1].to_i
            log "While evaluating line #{line} of the template #{tmpl}:"
            log tmpl_file_contents.split("\n")[line - 1]
            log("Backtrace: " + e.backtrace.join("\n  "))
            log_status "Updating configuration", :failed
            raise
          end

          next unless rendered_file_contents != old_file_contents

          log "would #{old_file_contents.nil? ? 'create' : 'update'} #{config_file}" unless silent
          updated_services += services

          File.unlink(config_file) if File.symlink?(config_file)
          fp = File.open(config_file, "w")
          fp.write(rendered_file_contents)
          fp.close
        end

        updated_services
      end

      def node_uuid
        if File.exist?("/data/user/common/uuid")
          @node_uuid ||= File.read("/data/user/common/uuid").chomp
        else
          "localhost"
        end
      end

      def escape_object_for_file(object, file)
        case object
        when Hash
          Hash[object.map { |k, o| [k, escape_object_for_file(o, file)] }]
        when Array
          object.map { |o| escape_object_for_file(o, file) }
        when String
          if object.empty?
            nil
          else
            _, escaper = ESCAPE_ROUTINES.find { |r, _e| r =~ file }
            escaper ? escaper.call(object) : object
          end
        else
          object
        end
      end

      def hash_of_config_file_for_nomad_service(service)
        hashes = %w[]
        if !SYS_NOMAD_SERVICES.include?(service)
          nil
        else
          CONFIG_FILES.each do |config_file, services|
            if services.include?(service) && File.exist?(config_file)
              hashes << Digest::MD5.hexdigest(File.read(config_file))
            end
          end
          hashes.join(",")
        end
      end
    end
  end
end
