# frozen_string_literal: true
module Enterprise
  module ConfigApply
    # Consul contains methods related to Consul integration, mostly for clustering and HA
    module Consul
      def consul_debug_level
        raw_config.dig("app", "consul", "debug-level") || "WARN"
      end

      def consul_datacenter(node_name = cluster_node_name)
        return "default" if single_node?

        consul_dc = cluster_value(node_name, "consul-datacenter")
        if !consul_dc.nil?
          consul_dc
        elsif cluster_ha_enabled?
          node_name + "-dc"
        else
          cluster_datacenter(node_name)
        end
      end

      def consul_all_datacenters
        return [consul_datacenter] if single_node?

        cluster_nodes("consul-server", true).map do |node|
          consul_datacenter(node["_node_key"])
        end.uniq
      end

      # consul_leader_healthy? queries the Consul REST API to determine if a
      # leader has been elected.
      # NOTE: an HTTP response of 200 OK is returned whether a leader is elected or not
      def consul_leader_healthy?(dc = consul_primary_datacenter)
        leader = consul_get_call("status/leader?dc=#{dc}", retries: 5)
        !leader.nil? && leader.to_s != '""'
      end

      # wait_for_consul_leader retries consul_leader_healthy? in a loop
      def wait_for_consul_leader(dc: consul_primary_datacenter, timeout: nil)
        wait_for_service_status("consul")

        log "Waiting for Consul leader"

        timeout ||= cluster_regular_enabled? ? 240.0 : 60.0
        loop_with_timeout(timeout) do
          if consul_leader_healthy?(dc)
            # Confirm route to datacenter
            log "Consul has elected a leader"
            return
          end
          sleep 0.1
        end

        log "Consul leader not detected within #{timeout}s"
      end

      def path_to_dc?(dc = consul_primary_datacenter)
        !!consul_api_call(:get, "kv/ghe/cluster/primary-datacenter", nil, datacenter: dc, log_errors: false, retries: 5)
      end

      def wait_for_path_to_dc(dc: consul_primary_datacenter, timeout: nil)
        wait_for_service_status("consul")

        log "Waiting for path to DC #{dc}"
        timeout ||= cluster_regular_enabled? ? 240.0 : 60.0
        loop_with_timeout(timeout) do
          if path_to_dc?(dc)
            log "Path to datacenter established"
            return
          end
          sleep 1
        end
        log "Could not establish path to datacenter within #{timeout}s."
      end

      # Should we enable Consul ACL? For now, we disabled it for all modes
      def enable_consul_acl?
        false
      end

      # Check if Consul KV ACL is enabled.
      # Returns true if the `kv put` fails (non-zero exit),
      # or false if it succeeds, which can only happen if ACLs aren't in use
      def consul_kv_acl_enabled?
        system("consul-cli kv write consul_kv_acl_enabled false > /dev/null 2>&1")
        $?.exitstatus != 0
      end

      def consul_token_flag
        # Note the string has a leading space so that we don't end up with two spaces in the command in the case where no token is needed.
        consul_kv_acl_enabled? ? " --token #{secret_value('consul', 'acl-config-sync-token')}" : ""
      end

      def consul_kv_get(path, opts = {})
        # Default to returning raw values, rather than metadata
        opts = {params: {raw: true}}.merge(opts)
        consul_get_call("kv/#{path}", opts)
      end

      def consul_kv_put(path, payload, opts = {})
        consul_put_call("kv/#{path}", payload, opts)
      end

      def consul_kv_delete(path, opts = {})
        consul_delete_call("kv/#{path}", opts)
      end

      def consul_get_call(path, opts = {})
        consul_api_call(:get, path, nil, opts)
      end

      def consul_put_call(path, payload, opts = {})
        consul_api_call(:put, path, payload, opts)
      end

      def consul_delete_call(path, opts = {})
        consul_api_call(:delete, path, nil, opts)
      end

      def consul_api_call(method, path, payload, opts = {})
        options = {
          retries: 0,
          datacenter: nil,
          log_errors: true,
          params: {}
        }.merge(opts)

        uri = URI.parse("http://localhost:8500/v1/" + path)
        # Direct writes to the primary datacenter if we're running HA. This avoids keys getting clobbered by
        # consul-replicate.
        params = options[:params]
        params["dc"] = options[:datacenter] if options[:datacenter] && cluster_ha_enabled?
        uri.query = URI.encode_www_form(params) if !params.empty?

        header = { 'Content-Type': "text/json", 'X-Consul-Token': secret_value("consul", "acl-master-token") }
        http = Net::HTTP.new(uri.host, uri.port)
        request = Net::HTTP.const_get(method.capitalize).new(uri.request_uri, header)
        if payload
          request.body = payload.is_a?(String) ? payload : payload.to_json
        end

        try ||= 0
        response = http.request(request)

        case response
        when Net::HTTPSuccess
          response.body
        when Net::HTTPClientError, Net::HTTPServerError
          log "Error with consul API #{method.upcase} request path: #{request.path}, request body: #{request.body}, response: #{response.body}" if options[:log_errors]
        else
          log "Unknown response with consul API #{method.upcase} request"
        end
      rescue Timeout::Error, Errno::ECONNRESET, Errno::ECONNREFUSED, Errno::ENOENT, Net::HTTPError, Net::ReadTimeout, EOFError => e
        log "consul_api_call Exception: #{e}"
        log "consul_api_call Response: #{response}"
        if try < options[:retries]
          try += 1
          sleep 5
          retry
        else
          raise
        end
      end

      # accumulation of methods needed up properly bootstrap consul ACL system
      def consul_acl_update
        return unless enabled_service?("consul") && consul_server?

        log "Setting up Consul ACLs"
        wait_for_consul_leader

        consul_acl_set_agent_token
        consul_acl_update_agent_policy
        consul_acl_set_anon_policy
        consul_acl_set_consul_template_token
        consul_acl_set_consul_replicate_token if cluster_ha_enabled? || cluster_dr_enabled?

        log "Restarting Consul to apply ACLs"
        system_log("sudo systemctl reload consul")

        wait_for_consul_leader
        log "Done setting up Consul ACLs"
      end

      # returns the consul acl datacenter for node
      def consul_acl_datacenter
        return consul_datacenter unless cluster_enabled?
        return cluster_datacenter unless consul_server?
        return consul_primary_datacenter if cluster_ha_enabled?
      end

      # Return whether the current node is the master acl server
      def consul_acl_replication_master_server?
        return false unless consul_server?

        cluster_enabled? || consul_primary_datacenter == consul_datacenter
      end

      # creates a consul template token that is
      # used in consul-template config
      def consul_acl_set_consul_template_token
        body = {
          "ID" => secret_value("consul", "acl-template-token"),
          "Name" => "Consul Template Token",
          "Type" => "client",
          "Rules" => <<~HCL
            node "" { policy = "read" }
            key "ghe" { policy = "read" }
            key "mysql" { policy = "read" }
            key "consul-template/dedup/" { policy = "write" }
            session "" { policy = "write" }
            service "" { policy = "read" }
            agent "" { policy = "read" }
          HCL
        }
        consul_put_call("acl/create", body, retries: 5)
      end

      # creates a consul replicate token that is
      # read only on the primary and write on the replica
      def consul_acl_set_consul_replicate_token
        body = {
          "ID" => secret_value("consul", "acl-replicate-token"),
          "Name" => "Consul Replicate Token",
          "Type" => "client",
          "Rules" => <<~HCL
            node "" { policy = "read" }
            key "ghe" { policy = "write" }
            service "" { policy = "read" }
          HCL
        }
        consul_put_call("acl/create", body, retries: 5)
      end

      # This will update the Agent Token Policy to allow node updates
      def consul_acl_update_agent_policy
        body = {
          "ID" => secret_value("consul", "acl-agent-token"),
          "Name" => "Agent Token",
          "Type" => "client",
          "Rules" => <<~HCL
            node "" { policy = "write" }
            service "" { policy = "read" }
          HCL
        }
        consul_put_call("acl/update", body, retries: 5)
      end

      # This will add the `ghe-config secrets.consul.acl-agent-token` as the acl_agent_token in consul
      def consul_acl_set_agent_token
        body = { "Token" => secret_value("consul", "acl-agent-token") }
        consul_put_call("agent/token/acl_agent_token", body, retries: 5)
      end

      # This will create the anonymous policy to used for consul calls that has no explicit token defined
      def consul_acl_set_anon_policy
        body = {
          "ID" => "anonymous",
          "Type" => "client",
          "Rules" => <<~HCL
            node "" { policy = "read" }
            service "consul" { policy = "read" }
          HCL
        }
        consul_put_call("acl/update", body, retries: 5)
      end

      # Return list of hostnames that have are consul server by consul datacenter
      def list_consul_servers_with_consul_dc(consul_dc, skip_offline = true)
        cluster_nodes("consul-server", skip_offline).select do |node|
          consul_datacenter(node["_node_key"]) == consul_dc
        end.map { |n| n["hostname"] }
      end

      # Return list of hostnames that have a given role and consul datacenter
      def consul_hostnames_with_role(role, consul_dc, skip_offline = true)
        cluster_nodes(role, skip_offline).select  do |node|
          consul_datacenter(node["_node_key"]) == consul_dc
        end.map { |n| n["hostname"] }
      end

      # Return list of cluster nodes where consul-server is enabled
      # in a given datacenter.
      # Note that all nodes run the Consul agent (daemon);
      # it's a matter of whether the agent is in "server" or "client" mode
      def consul_servers(consul_dc)
        single_node? ? [cluster_node_name] : list_consul_servers_with_consul_dc(consul_dc)
      end

      def consul_primary_datacenter
        return "default" if single_node?

        consul_dc = cluster_value("primary-datacenter")

        return consul_dc unless consul_dc.nil?
        return cluster_ha_primary + "-dc" if cluster_ha_enabled?

        "default"
      end

      def consul_primary_datacenter?
        consul_primary_datacenter == consul_datacenter
      end

      # Get the IPs for the primary nodes (for config file `retry_join_wan`)
      def primary_dc_consul_servers_ips
        return [] unless cluster_multi_dc?

        consul_servers(consul_primary_datacenter).map { |s| node_ip(s) }
      end

      # Return whether the current node needs to run
      # consul-replicate.
      def consul_replicate?
        consul_server? && !consul_primary_datacenter? && (cluster_ha_replica_enabled? || cluster_dr_enabled?)
      end

      # Return whether the current node needs to run the
      # Consul agent in "server" mode; if false it'll run in "client" mode.
      def consul_server?
        single_node? ||
          consul_servers(consul_datacenter).include?(cluster_node_name)
      end

      def update_consul_primary_dc
        run_oneshot_service("ghe-dc-setup")
      end

      module ViewHelpers
        def mysql_consul_tags
          if mysql_master? || cluster_ha_enabled?
            %w[primary replica]
          else
            ["replica"]
          end
        end

        def local_consul_servers_ips(node_name = cluster_node_name)
          consul_servers(consul_datacenter(node_name)).map { |s| node_ip(s) }
        end

        # Force `advertise_addr` to localhost for single-node and HA cluster
        # to avoid using public IP on EC2 (Issue #14327). The only scenarios
        # where the real IP should be advertised (e.g. for service discovery)
        # is full clustering.
        def consul_advertise_addr(node_name = cluster_node_name)
          cluster_regular_enabled? ? node_ip(node_name) : "127.0.0.1"
        end

        # The `retry_join` IP list should be just localhost for single-node
        # or an HA primary/replica, because the intent is to list the "peer"
        # IPs in the same datacenter.  The local node's IP from `cluster.conf`
        # is excluded for the same reason as `consul_advertise_addr`, but
        # surfaced as a bug in #15040.
        def consul_retry_join_ips(node_name = cluster_node_name)
          return ["127.0.0.1"] if single_node? || local_consul_servers_ips(node_name).size <= 1

          local_consul_servers_ips(node_name).reject { |ip| ip == node_ip(node_name) }
        end
      end
      include ViewHelpers
    end
  end
end
