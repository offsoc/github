# frozen_string_literal: true

module Enterprise
  module ConfigApply
    module Resources
      class Elasticsearch
        class NotReadyError < StandardError; end
        class StatusRedError < StandardError; end
        class IndexBuildError < StandardError; end

        extend Enterprise::ConfigApply::Resources::Decorators
        extend Forwardable

        WAIT_FOR_HEALTHY_MAX_ATTEMPTS = 10

        attr_reader :apply

        def_delegators :@apply, :config_diff, :trace_event, :logger, :cluster_failover_file

        # Check Elasticsearch cluster health
        # If the command fails — because the Elasticsearch is red — this method will raise a StatusRedError
        def self.health_check(env_vars: {}, logger: Enterprise::ConfigApply.logger)
          cmd  = Command.new(
            %{/usr/local/bin/ghe-es-wait-for-green --yellow-ok},
            capture: true,
            env_vars: env_vars
          )
          cmd.run!
          cmd.stdout.to_s
        rescue Command::CommandFailedError => e
          logger.error("Elasticsearch health status is red. Error: #{e}")
          raise StatusRedError, e
        end

        def initialize(apply:)
          @apply = apply
        end

        instrument "configapply.migrations.elasticsearch.wait_for_healthy"
        def wait_for_healthy(delay: 1)
          logger.info "Waiting for Elasticsearch to become healthy"
          WAIT_FOR_HEALTHY_MAX_ATTEMPTS.times do |i|
            begin
              return Elasticsearch.health_check
            rescue StatusRedError
              if i == WAIT_FOR_HEALTHY_MAX_ATTEMPTS - 1
                raise NotReadyError, "Timed out waiting for Elasticsearch to become green. Check that all replicas are online, or resolve unassigned shards before proceeding. Please contact GitHub Enterprise Support and provide the full /data/user/common/ghe-config.log log file if you need assistance."
              end
            end

            sleep(delay * i)
          end

          return false
        end

        instrument "configapply.elasticsearch.rebuild_indices"
        def rebuild_indices
          logger.info "Rebuilding Elasticsearch indices"
          if apply.cluster_dr_enabled?
            rebuild_primary_indices
            # this is done asynchronously:
            rebuild_replica_indices
          else
            rebuild_all_indices
          end
        end

        instrument "configapply.elasticsearch.promote_indices"
        run_on_cluster_failover
        def promote_indices
          logger.info "Cluster failover has occurred. Promoting Elasticsearch indices from the failover datacenter"
          Command.new(
            %{
              /usr/local/bin/github-env
                bin/rake
                "es:enterprise:promote_indices[#{apply.nomad_primary_datacenter}]"
            }.gsub!(/[[:space:]]+/, " ").strip!,
          ).run!
        rescue Enterprise::ConfigApply::Command::CommandFailedError
          logger.warn "Failed to promote Elasticsearch indices"
        ensure
          remove_cluster_failover_file
        end

        def rebuild_all_indices
          command.run!
        rescue Enterprise::ConfigApply::Command::CommandFailedError
          raise_index_build_error
        end

        def rebuild_primary_indices
          command(apply.nomad_primary_datacenter).run!
        rescue Enterprise::ConfigApply::Command::CommandFailedError
          raise_index_build_error
        end

        def rebuild_replica_indices
          return unless es_setup_cluster_runnable?

          Command.new(
            %{
              /usr/bin/systemctl
                --no-block
                start
                elasticsearch-setup-cluster@#{replica_datacenter}.service
            }.gsub!(/[[:space:]]+/, " ").strip!,
          ).run
        end

        def command(primary_dc = nil)
          primary_dc = "[\"#{primary_dc}\"]" unless primary_dc.nil?
          @cmd ||= Command.new(
            %{
              /usr/local/bin/github-env
                bin/rake
                --trace
                es:enterprise:update_shard_allocation['all']
                es:enterprise:setup#{primary_dc}
            }.gsub!(/[[:space:]]+/, " ").strip!,
          )
        end

        def es_setup_cluster_runnable?
          cmd = Command.new(
            %{
              /usr/bin/systemctl
                is-active
                elasticsearch-setup-cluster@#{replica_datacenter}.service
            }.gsub!(/[[:space:]]+/, " ").strip!,
            capture: true,
          )
          cmd.run
          # note that the call to systemctl returns a 3 if the service is "inactive":
          # $ systemctl is-active elasticsearch-setup-cluster@primary.service
          # inactive
          # $ echo $?
          # 3
          cmd.stdout.to_s.strip.eql? "inactive"
        end

        def raise_index_build_error
          Command.new(%{/usr/bin/nomad job status elasticsearch}).run
          Command.new(%{/usr/local/bin/ghe-es-wait-for-green --debug}).run
          Command.new(%{curl -s 'http://localhost:9201/_cat/shards?v&h=index,shard,prirep,state,docs,store,ip,node,unassigned.reason,unassigned.details,unassigned.at,unassigned.for&s=index,shard,prirep,ip'}).run
          raise IndexBuildError, "Elasticsearch failed to become green. Check that all replicas are online, or resolve unassigned shards before proceeding. Please contact GitHub Enterprise Support and provide the full /data/user/common/ghe-config.log log file if you need assistance."
        end

        # returns nil if there is no cluster replica
        def replica_datacenter
          replica_delegate = apply.cluster_value("mysql-master-replica")
          apply.cluster_value(replica_delegate, "datacenter")
        end

        def remove_cluster_failover_file
          FileUtils.rm_f(apply.cluster_failover_file)
        end
      end
    end
  end
end
