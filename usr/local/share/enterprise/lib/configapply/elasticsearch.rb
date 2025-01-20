# frozen_string_literal: true
module Enterprise
  module ConfigApply
    module Elasticsearch
      def es_need_to_backup_old_data?
        cluster_regular_enabled? &&
          enabled_service?("elasticsearch") &&
          Dir.exist?("/data/user/elasticsearch") &&
          !File.exist?("/data/user/elasticsearch/.cluster")
      end

      def es_backup_old_data!
        system_log("/usr/local/share/enterprise/ghe-nomad-local-alloc-stop elasticsearch")
        target = "/data/user/elasticsearch-#{Time.now.to_i}"
        FileUtils.mv("/data/user/elasticsearch", "/data/user/elasticsearch-#{Time.now.to_i}")
        log "Old ElasticSearch data moved to #{target}"
        FileUtils.mkdir_p("/data/user/elasticsearch")
        FileUtils.chown_R("elasticsearch", "elasticsearch", "/data/user/elasticsearch")
      end

      def es_default_settings
        config = {}
        config["elasticsearch"] = {}
        config["elasticsearch"]["enabled"] = false
        config["elasticsearch"]["number_of_replicas"] = search_nodes_replica_count
        config["elasticsearch"]["auto_expand_replicas"] = cluster_ha_enabled? ? "0-all" : "0-1"
        config["elasticsearch"]["datacenter"] = cluster_dr_enabled? ? cluster_datacenter : "default"
        num_nodes = search_nodes.size
        config["elasticsearch"]["recover_after_nodes"] ||= cluster_ha_enabled? ? 1 : [num_nodes - 1, 1].max
        config["elasticsearch"]["expected_nodes"] ||= cluster_ha_enabled? ? 1 : num_nodes

        config
      end

      def es_default_cluster_settings
        config = {}
        config["elasticsearch"] = {}
        config["elasticsearch"]["shard_count_for_code_search"] = "5"
        config["elasticsearch"]["shard_count_for_issues"] = "5"
        config["elasticsearch"]["shard_count_for_commits"] = "5"
        config["elasticsearch"]["shard_count_for_pull_requests"] = "5"
        config["elasticsearch"]["shard_count_for_repos"] = "5"
        config["elasticsearch"]["shard_count_for_users"] = "5"
        config["elasticsearch"]["minimum_number_of_master_nodes"] = (search_nodes.size.to_f / 2).floor + 1

        config
      end

      def es_config_settings(config)
        settings = es_default_settings

        settings.merge!(es_default_cluster_settings) if cluster_regular_enabled?

        config.merge!(settings)

        if cluster_regular_enabled?
          config["elasticsearch"]["clusters"]={}
          search_nodes_by_datacenter.each do |dc, dc_info|
            config["elasticsearch"]["clusters"][dc] = { "url" => dc_info["url"] }
          end
        end

        if enabled_service?("elasticsearch")
          # if people define their own elasticsearch section use those values whenever possible
          config["elasticsearch"]["enabled"] = true
          log "search nodes size: #{search_nodes.size}"
        end
      end

      def es8_upgrade_needed?
        if cluster_regular_enabled?
          # In cluster, we need to check whether there's a designated upgrade node
          # for audit log indices.
          designated = consul_kv_get("ghe/es8-auditlog-migration/designated", opts={:log_errors => false})
          return !(designated.nil? || designated == "")
        end
        # For any other scenarios, we only need to run the migration if this file exists
        File.exist?("/data/user/es8-auditlog-migration/run-migration")
      end

      def es_heap_size
        if dev_mode
          "128m"
        else
          # Set HEAP_SIZE to half of allotted memory for Elasticsearch to allow for extra RSS allocation by the JVM
          # and to allow for the container to have some OS-level host caching.
          budget = memory_budget("elasticsearch-server").to_i

          if budget < 2 * GIGABYTE
            "#{(budget / MEGABYTE)/2}m"
          else
            "#{(budget / GIGABYTE)/2}g"
          end
        end
      end

      def wait_for_es_available
        begin
          timeout = es_wait_timeout
          loop_with_timeout(timeout) do
            log "Waiting for Elasticsearch to be available via haproxy-cluster-proxy..."

            es_state = check_server_health("/var/run/haproxy/haproxy-cluster-proxy.sock", "search")
            if es_state[:op_code] == 2
              begin
                uri = URI("http://localhost:9201/_cluster/health")
                response = Net::HTTP.get_response(uri)
                if response.is_a?(Net::HTTPSuccess)
                  data = JSON.parse(response.body)
                  if data["status"] == "green"
                    log "Elasticsearch is healthy!"
                    break
                  else
                    log "Elasticsearch status is not green: #{data["status"]}"
                  end
                else
                  log "Error: Failed to fetch Elasticsearch cluster health. HTTP status code: #{response.code}"
                end
              rescue StandardError => e
                log "Error: #{e.message}"
              end
            end
            sleep(1)
          end
        rescue PhaseHelpers::LoopTimeoutError
          log "Timed out waiting #{timeout}s for Elasticsearch to be healthy"
        end
      end
    end
  end
end
