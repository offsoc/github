require 'time'

module Enterprise
  module ConfigApply
    # ViewHelpers holds methods that are only called by ERb templates and consul templates
    # mostly small wrappers that pull business logic out of the templates.
    #
    # A method should go in a ViewHelpers* module if it's used in this way,
    # even if it fits the "topic" of another module.  The intent is to expose
    # these as "mere entrypoints" into ConfigApply, that don't have other methods
    # depending on them.
    #
    # Note, these methods are still available within ConfigApply::Run if needed.
    module ViewHelpers
      PROXY_SERVICES_LOCAL = %w[
        actions-artifactcache
        actions-mps
        actions-pipelines
        actions-token
        alambic
        babeld
        codeload
        dependabot-api
        ghes-manage-gateway
        lfs-server
        msteams
        nes
        packages
        pages_lua
        registry
        slack
        static-maintenance
      ].freeze

      # Names of ConfigApply methods to be invoked by #dump_exportable_methods
      # A "simple" method requires no params, is side-effect free (no writes
      # or external queries), and will not cause an infinite loop.
      # Similar to the list of allowed methods in `ghe-call-configrb`.
      EXPORTABLE_METHODS_SIMPLE = %w[
        actions_enabled?
        actions_ever_enabled?
        actions_launch_debug
        actions_rate_limiting_enabled
        actions_rate_limiting_queue_runs_per_minute
        actions_schedule_loop_sleep_duration
        actions_schedule_tasks_per_tick
        actions_test_org
        actions_test_org_created?
        alambic_db_fetch_enabled
        alambic_db_fetch_enabled?
        alambic_node_count
        all_app_config
        auth_cas_enabled?
        auth_ldap_enabled?
        auth_oauth_enabled?
        auth_saml_enabled?
        babeld_curl_timeout
        babeld_max_threads
        babeld_min_threads
        babeld_emit_percent
        chatops_msteams_enabled?
        chatops_slack_enabled?
        babeld_use_ed25519
        cluster_datacenter
        cluster_dr_enabled?
        cluster_ha_enabled?
        cluster_enabled?
        cluster_ha_primary
        cluster_ha_primary_external_ip
        cluster_ha_primary_ip
        cluster_ha_primary?
        cluster_index
        cluster_interface
        cluster_node_name
        cluster_nodes_in_datacenter_count
        cluster_rebalance_apps?
        cluster_rebalance_apps
        cluster_rebalance_schedule
        cluster_rebalance_timeout?
        cluster_rebalance_timeout
        cluster_rebalance_workers?
        cluster_rebalance_workers
        cluster_regular_enabled?
        cluster_replica?
        cluster_roles
        cluster_vpn_subnet
        code_scanning_enabled?
        code_scanning_disable_java_buildless_enabled?
        code_scanning_disable_csharp_buildless_enabled?
        codeload_path
        codeload_subdomain
        consul_acl_datacenter
        consul_advertise_addr
        consul_all_datacenters
        consul_datacenter
        consul_primary_datacenter
        consul_primary_datacenter?
        consul_retry_join_ips
        consul_server?
        checks_retention_enabled?
        dependabot_enabled?
        dependabot_rules_enabled?
        dependency_graph_enabled?
        dev_mode
        docker_disabled?
        container_disabled?
        container_readonly?
        domain_host_ips
        es_clusters_json
        es_heap_size
        es_worker_count
        external_mysql_enabled?
        file_asset_host
        file_asset_subdomain
        ghes_cluster_delegate?
        ghes_nomad_delegate?
        git_repld_enabled?
        git_server?
        git_server_count
        gitauth_git_protocol_enabled
        gitauth_unicorns
        gitauth_rsa_sha1_cutoff
        github_ernicorns
        github_unicorns
        gitrpcd_enabled?
        go_githooks_enabled?
        graphite_gunicorn_workers
        haproxy_nbthread
        hookshot_go_conns_per_queue
        hookshot_go_worker_count
        hookshot_go_worker_http_timeout
        http2hydro_enabled?
        hosts_nodes
        ident_host
        job_plus_git_server_count
        job_server_count
        lariat_cachedir
        lariat_min_space
        license_modified_at
        migrations_enabled?
        memcache_nodes
        memcache_memory_mb
        metrics_server?
        metrics_servers
        metrics_servers_ips
        minio_enabled?
        mysql_kill_timeout
        mysql_master
        mysql_master_port
        mysql_master?
        mysql_password
        mysql_replica_ports
        mysql_replicas
        mysql_server_id
        mysql_username
        mssql_master
        mssql_master_ip
        nes_enabled?
        node_ip
        node_uuid
        nomad_all_datacenters
        nomad_cluster_roles
        nomad_datacenter
        nomad_primary_datacenter
        nomad_server_bootstrap_expect
        nomad_server_enabled
        nomad_server_peers
        nonvoting_fileserver_count
        nonvoting_pages_fileserver_count
        nonvoting_storage_fileserver_count
        normalized_hostname
        packages_debug?
        packages_docker_enabled_state
        packages_container_enabled_state
        packages_enabled?
        packages_maven_enabled_state
        packages_npm_enabled_state
        packages_npm_upstreaming_enabled_state
        packages_nuget_enabled_state
        packages_rubygems_enabled_state
        packages_container_blob_redirection_enabled_state
        pages_enabled?
        postfix_enabled?
        prometheus_enabled?
        redis_master
        redis_master?
        release_version
        resqued_high_workers
        resqued_jobs_enabled
        resqued_low_workers
        resqued_maint_workers
        resqued_maintenance_enabled
        saml_certificate_hexdigest
        sanitized_http_proxy
        scheme
        search_nodes
        search_nodes_by_datacenter
        secret_scanning_enabled?
        single_node?
        spokesd_enabled?
        spokesd_storage_policy
        telegraf_enabled?
        timerd_node_count
        two_factor_enabled?
        voting_fileserver_count
        voting_pages_fileserver_count
        voting_storage_fileserver_count
        vpn_node_ip
        vulnerability_alerting_and_settings_enabled?
        web_plus_active_replica_count
        web_server?
        web_server_count
        webserver_nodes
        webserver_nodes_by_datacenter
        wireguard_enabled?
        wireguard_hub_and_spoke?
        wireguard_mtu
        wireguard_peers
      ].freeze

      EXPORTABLE_CONFIG_VALUE_SETTINGS = %w[
        abuse-rate-limiting.enabled
        api-rate-limiting.enabled
        github-hostname
        github-ssl.enabled
        http-noproxy
        license.expire-at
        mapping.enabled
        private-mode
        saml.encrypted-assertions
        saml.disable-admin-demote
        saml.idp-initiated-sso
        smtp.enabled
        subdomain-isolation
        webite-analytics.enabled
      ].freeze

      def git_server?
        return true if single_node?

        git_servers.include?(cluster_node_name)
      end

      def metrics_server?
        return false if single_node?

        metrics_servers.include?(cluster_node_name)
      end

      def web_server?
        return true if single_node?

        webserver_nodes.include?(cluster_node_name)
      end

      def pages_enabled?
        !!(raw_config["pages"] && raw_config["pages"]["enabled"])
      end

      def babeld_curl_timeout
        if timeout = config_value("app", "babeld", "curl-timeout")
          timeout.to_i
        else
          10
        end
      end

      def babeld_min_threads
        if threads = config_value("app", "babeld", "threads-min")
          threads.to_i
        else
          24
        end
      end

      def babeld_max_threads
        if threads = config_value("app", "babeld", "threads-max")
          threads.to_i
        else
          [babeld_min_threads, 4096].max
        end
      end

      def babeld_emit_percent
        if percent = config_value("app", "babeld", "emit-percent")
          [[percent.to_i, 100].min, 0].max
        else
          100
        end
      end

      def babeld_use_ed25519
        enabled = config_value("app", "babeld", "host-key-ed25519")
        # Explicitly set this to true or false since we use it in a template.
        !!enabled
      end

      def gitauth_git_protocol_enabled
        enabled = config_value("app", "gitauth", "git-protocol")
        enabled ? 1 : 0
      end

      def gitauth_rsa_sha1_cutoff
        value = config_value("app", "gitauth", "rsa-sha1")
        result = case value
        when false
          "1970-01-01T00:00:00Z"
        when String
          Time.parse(value).utc.iso8601
        when nil
          "2022-08-01T00:00:00Z"
        end
        # The environment variable contains two space-separate entries, one for employees and one for other users.  We
        # will never trigger the employee case here, but the correct value must still be provided.
        "#{result} #{result}"
      end

      def graphite_gunicorn_workers
        if workers = config_value("graphite", "gunicorn-workers")
          workers.to_i
        else
          # Temporarily default to 1, since when multiple graphs that display process metrics attempt to read the
          # same RRD files it results in 500s
          1
        end
      end

      def single_node_hostname
        @config["github-hostname"].tr(".", "-") if cluster_ha_enabled? || single_node?
      end

      def is_gce?
        File.file?("/etc/default/instance_configs.cfg")
      end

      def is_aws?
        File.file?("/etc/github/ec2-ami")
      end

      def domain_host_names(prefix = "")
        "#{prefix}#{raw_config['github-hostname']}"
      end

      def normalized_hostname
        if Resolv::IPv4::Regex.match?(raw_config["github-hostname"])
          raw_config["github-hostname"].tr(".", "-")
        else
          raw_config["github-hostname"]
        end
      end

      # proxy_service_local? supports #proxy_host to force
      # a "localhost" string for certain services
      def proxy_service_local?(service)
        PROXY_SERVICES_LOCAL.include?(service)
      end

      # proxy_host renders the needed backend host formatted for haproxy-frontend.cfg.erb
      # e.g. 'primary 1.2.3.4:8000'
      def proxy_host(service, port)
        if cluster_ha_replica_active? && !proxy_service_local?(service)
          "primary #{cluster_ha_primary_ip}:#{port}"
        else
          "localhost 127.0.0.1:#{port}"
        end
      end

      # sanitized_http_proxy forces config value `http-proxy` to always have
      # a protocol, defaulting to `http://`
      #
      # * scheme is `http` by default, override by passing a different `scheme`
      #   keyword argument
      def sanitized_http_proxy(scheme: "http")
        p = config_value("http-proxy").to_s
        return p if p.empty? || p.include?("://")

        "#{scheme}://#{p}"
      end

      def dynamic_config_owned_overrides
        {
          "github" => %w[resqued-low-workers resqued-high-workers resqued-jobs-enabled resqued-maint-workers resqued-maintenance-enabled]
        }
      end

      def scheme
        if config_value("github-ssl", "enabled")
          "https"
        else
          "http"
        end
      end

      def ident_host
        if @config["identicons-host"] == "dotcom"
          "https://identicons.github.com"
        else
          "#{scheme}://#{@config["github-hostname"]}"
        end
      end

      def codeload_path
        @config["subdomain-isolation"] ? "" : "/_codeload"
      end

      def codeload_subdomain
        @config["subdomain-isolation"] ? "codeload." : ""
      end

      def auth_cas_enabled?
        @config["auth-mode"] == "cas" && @config["cas"]
      end

      def auth_ldap_enabled?
        @config["auth-mode"] == "ldap" && @config["ldap"]
      end

      def auth_oauth_enabled?
        @config["auth-mode"] == "github_oauth" && @config["github-oauth"]
      end

      def auth_saml_enabled?
        @config["auth-mode"] == "saml" && @config["saml"]
      end

      def two_factor_enabled?
        ["default", "ldap"].include? @config["auth-mode"]
      end

      def git_repld_enabled?
        File.exist?("/etc/github/repl-state") && !cluster_ha_enabled?
      end

      def license_modified_at
        File.mtime("/data/user/common/enterprise.ghl").to_i if File.exist?("/data/user/common/enterprise.ghl")
      end

      def saml_certificate_hexdigest
        # rubocop:disable GitHub/InsecureHashAlgorithm
        Digest::SHA1.hexdigest(@config["saml"]["certificate"]) if auth_saml_enabled?
      end

      def file_asset_subdomain
        @config["subdomain-isolation"] ? "uploads." : ""
      end

      def file_asset_host
        "#{scheme}://#{file_asset_subdomain}#{@config["github-hostname"]}/"
      end

      def ldap_tls_verify_mode
        config_value("ldap", "verify-certificate") ? OpenSSL::SSL::VERIFY_PEER : OpenSSL::SSL::VERIFY_NONE
      end


      def es_clusters_json
        @config["elasticsearch"]["clusters"].to_json
      end

      def release_version
        contents = File.read("/etc/github/enterprise-release")

        contents.lines.map do |line|
          if line =~ /\ARELEASE_VERSION=\"(.*)\"/
            $1
          else
            nil
          end
        end.compact.first
      end

      def app_override(app, env_var)
        # node specific override
        if cluster_enabled?
          return cluster_value(cluster_node_name, "app", app, env_var) unless cluster_value(cluster_node_name, "app", app, env_var).nil?
        end
        # cluster wide or single node override
        return raw_config_value("app", app, env_var) unless raw_config_value("app", app, env_var).nil?

        nil
      end

      def app_config_for(app)
        apps = raw_config["app"]
        output = ""
        if apps && vars = apps[app]
          output << vars.inject("") do |str, (key, val)|
            # if dynamic config owns the configuration do not render these values
            next str if dynamic_config_owned_overrides[app] && dynamic_config_owned_overrides[app].include?(key)

            str << "export ENTERPRISE_#{key.tr('-', '_').upcase}=#{val.to_s.dump}\n"
            str
          end
        end
        if cluster_enabled?
          apps = cluster_value(cluster_node_name, "app")
          if apps && vars = apps[app]
            output << vars.inject("") do |str, (key, val)|
              # if dynamic config owns the configuration do not render these values
              next str if dynamic_config_owned_overrides[app] && dynamic_config_owned_overrides[app].include?(key)

              str << "export ENTERPRISE_#{key.tr('-', '_').upcase}=#{val.to_s.dump}\n"
              str
            end
          end
        end
        output
      end

      # this is used in nomad.d/config.hcl.erb on each node
      # it outputs all of the values under an "app." key in github.conf and cluster.conf
      # cluster.conf will override github.conf values for the current node, if present
      # cluster.conf can also contribute new values. These and up in the client meta section
      # of /etc/nomad.d/config.hcl on each node.
      # see also /usr/local/bin/ghe-app-config-for which uses the
      # github.conf and cluster.conf to emit intepolated env vars into the given nomad
      # job description which match the keys output here. This enables node specific
      # env vars.
      def all_app_config
        apps = raw_config["app"]
        h = {}
        if apps
          apps.each do |app, vars|
            vars.each do |key, val|
              h["app.#{app}.#{key}"] = "#{val.to_s.dump}"
            end
          end
        end
        if cluster_enabled?
          apps = cluster_value(cluster_node_name, "app")
          if apps
            apps.each do |app, vars|
              vars.each do |key, val|
                h["app.#{app}.#{key}"] = "#{val.to_s.dump}"
              end
            end
          end
        end
        output = ""
        output << h.inject("") do |str, (key, val)|
          str << "#{key} = #{val}\n    "
        end
        output.strip.chomp
      end

      # tls_config_options turns `github-ssl.tls-mode` into a string
      # suitable for inclusion in the Postfix or HAProxy config file.
      #
      # Counterintuitively, github.conf lists what TLS modes *are* enabled,
      # while the rendered strings for config files are inverted,
      # listing the protocol versions that will be *disabled*.
      #
      # config_type is either "smtp" or "haproxy"
      # Example tls-mode config value: "tlsv12;tlsv13"
      def tls_config_options(config_type)
        return "" if !config_value("github-ssl", "enabled") || config_value("github-ssl", "tls-mode").to_s.empty?

        # Versions of TLS which are already deprecated in GHES
        # We need this list since we can explicitly reject
        # connection using deprecated TLS
        tls_deprecated_versions = {
          "tlsv10" => "TLSv1",
          "tlsv11" => "TLSv1.1",
        }

        # The available TLS versions are listed as a mapping between
        # the github.conf config values (based on HAProxy's format)
        # and the strings Postfix's config needs (so, haproxy => postfix)
        # Important: Make sure to match ghe-config-check's is-valid-tls-mode values
        tls_versions = {
          "tlsv12" => "TLSv1.2",
          "tlsv13" => "TLSv1.3" # currently not accepted by Postfix; #17673
        }

        ghe_config_versions = config_value("github-ssl", "tls-mode").split(";")
        tls_versions_disabled = tls_deprecated_versions.merge(tls_versions.reject { |k, _v| ghe_config_versions.include?(k) })

        case config_type
        when "haproxy"
          tls_versions_disabled.map { |k, _v| " no-" + k }.join
        when "smtp"
          tls_versions_disabled.reject { |k, _v| k == "tlsv13" }.map { |_k, v| ", !" + v }.join
        end
      end

      def localize_snmp_key(key, alg)
        computed_engineID = "80001f8804#{@engineID.unpack1('H*')}"
        buf = ""
        key.sub!(/^0x/, "")
        [key, computed_engineID, key].each { |prt| buf += [prt].pack("H*") }
        alg == "SHA" ? Digest::SHA1.hexdigest(buf) : Digest::MD5.hexdigest(buf)
      end

      # fix config settings names
      def dump_exportable_config_settings
        h = {}
        EXPORTABLE_CONFIG_VALUE_SETTINGS.each do |s|
          keys = s.split(".")
          sanitized_key = keys.map { |k| k.tr("-", "_") }.join("_")
          h[sanitized_key] = config_value(*keys) || ""
        end
        h
      end

      # dump_exportable_methods runs all methods needed for template rendering, as a hash
      def dump_exportable_methods
        h = { "_errors" => {} }

        # Invoke each method by name; make a new hash with the names as keys
        h.merge! EXPORTABLE_METHODS_SIMPLE.map { |m|
          # rename `wireguard_enabled?` to `is_wireguard_enabled`
          sanitized_name = m.gsub(/(.+)\?$/, 'is_\1')

          [sanitized_name, begin
                send(m.to_sym)
                           rescue StandardError => e
                             h["_errors"][sanitized_name] = e
                             nil
              end]
        }.to_h

        h.merge!  dump_exportable_config_settings

        ALL_SERVICES.each do |s|
          sanitized_name = s.gsub("-", "_")
          h["is_enabled_service_#{sanitized_name}"] = enabled_service?(s)
          h["is_eap_enabled_#{sanitized_name}"] = eap_enabled?(s)
        end

        SYS_NOMAD_SERVICES.each do |s|
          if CONFIG_FILES.any? { |config_file, services| services.include?(s) }
            sanitized_name = s.gsub("-", "_")
            h["hash_of_config_file_for_nomad_service_#{sanitized_name}"] = hash_of_config_file_for_nomad_service(s)
          end
        end

        h
      end
    end
  end
end
