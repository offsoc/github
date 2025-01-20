# frozen_string_literal: true

require_relative "mode_helpers"
module Enterprise
  module ConfigApply
    module Nomad
      include Enterprise::ConfigApply::ModeHelpers
      def nomad_debug_level
        raw_config.dig("app", "nomad", "debug-level") || "INFO"
      end

      def nomad_datacenter
        consul_datacenter
      end

      def nomad_primary_datacenter
        consul_primary_datacenter
      end

      def nomad_primary_datacenter?
        consul_primary_datacenter?
      end

      def nomad_all_datacenters
        consul_all_datacenters
      end

      def nomad_server_enabled
        consul_server?.to_s
      end

      def ghes_nomad_delegate?
        return true if single_node? || cluster_ha_enabled? || mysql_master? || mysql_master_replica?
        if external_mysql_enabled?
          return true if cluster_node_name == cluster_nodes_in_datacenter(cluster_datacenter).first
        end
        false
      end

      def nomad_server_peers
        if single_node? || cluster_ha_enabled?
          [node_ip + ":4647"]
        else
          cluster_nodes_in_datacenter(cluster_datacenter, "consul").map { |s| node_ip(s) + ":4647" }
        end
      end

      def nomad_server_bootstrap_expect
        (nomad_server_peers.size / 2) + 1
      end

      def nomad_cluster_roles
        cluster_roles.join(",")
      end

      def nomad_render_jobs(job_dir = "*")
        return unless ghes_nomad_delegate?

        if tracer
          render_template_func = ->(key, template_group) do
            trace_event("nomad_render_jobs", {"description" => "Rendering nomad jobs #{key}/*"}) do
              template_rendering_thread(template_group)
            end
          end
        else
          render_template_func = ->(key, template_group) { template_rendering_thread(template_group) }
        end

        normalized_job_dir = Array(job_dir).join(",")

        # Group and sort templates by directory. Sorting is important to ensure
        # that the partials like 00-env are rendered before the main jobspec templates.
        # Process each group in a separate thread and wait for all threads to finish
        Dir.glob("/etc/consul-templates/etc/nomad-jobs/{#{normalized_job_dir}}/*.ctmpl")
          .group_by(&File.method(:dirname))
          .transform_values(&:sort)
          .map(&render_template_func)
          .each(&:join)

        nil
      end

      def template_rendering_thread(template_group)
        Thread.new(template_group) do |template_group|
          template_group.each do |nomad_job_template|
            next if File.directory?(nomad_job_template)

            nomad_job_file = nomad_job_template[21..-7]  # scrape off "/etc/consul-templates" prefix and ".ctmpl" suffix

            system_log("sudo consul-template -once -template #{nomad_job_template}:#{nomad_job_file}")
            ret = $?
            if ret && ret.exitstatus > 0
              raise ConfigApplyException.new("Failed to render nomad job #{nomad_job_template}", exit_status: ret.exitstatus )
            end
          end
        end
      end

      def nomad_render_sys_jobs
        return unless ghes_nomad_delegate?

        jobs_to_render = [
          # TODO: is it an issue that this may render when haproxy-frontend is already running?
          "haproxy",
          *("actions" if actions_ever_enabled?),
          *("launch" if actions_ever_enabled?),
          *("mssql" if actions_ever_enabled?),
          *("minio" if minio_enabled?),
          *("mysql" unless external_mysql_enabled?),
          "consul-template",
          "00-common",
          "alambic",
          *("dependabot" if dependabot_enabled?),
          *("dependency-graph-api" if dependency_graph_enabled?), # needed for ghe-run-migrations
          *("dependency-snapshots-api" if dependency_graph_enabled?), # needed for ghe-run-migrations
          "governor",
          "github", # needed for git-daemon template and github-env
          "elasticsearch",
          "es8-auditlog-migration",
          "kafka-lite",
          "redis",
          "memcached",
          "postfix",
          "nginx",
          "aqueduct-lite", # needed for ghe-run-migrations
          "graphite-web",
          "spokesd", # required during backup/restore
          *("telegraf" if telegraf_enabled?),
          *("http2hydro" if http2hydro_enabled?),
          *("nes" if nes_enabled?),
        ]

        nomad_render_jobs(jobs_to_render)
      end

      # We only want one machine in the cluster to initiate Nomad jobs.
      # So let's use the same logic as ghes_nomad_delegate? which designates this task to the mysql master.
      def nomad_run_sys_jobs
        instrument_system("/usr/local/share/enterprise/ghe-docker-load-images", "Loading docker images")
        return unless ghes_nomad_delegate?

        instrument_system("/usr/local/share/enterprise/ghe-nomad-jobs wait-nomad-nodes", "Waiting for Nomad nodes to be ready", check_exit: true)

        queue_nomad_job("/etc/nomad-jobs/consul-template/consul-template.hcl")
        queue_nomad_job("/etc/nomad-jobs/haproxy/haproxy-frontend.hcl")
        queue_nomad_job("/etc/nomad-jobs/haproxy/haproxy-data-proxy.hcl")
        queue_nomad_job("/etc/nomad-jobs/haproxy/haproxy-cluster-proxy.hcl")
        queue_nomad_job("/etc/nomad-jobs/kafka-lite/kafka-lite.hcl")
        queue_nomad_job("/etc/nomad-jobs/redis/redis.hcl")
        queue_nomad_job("/etc/nomad-jobs/redis/redis-aof-cron.hcl")
        queue_nomad_job("/etc/nomad-jobs/memcached/memcached.hcl") if primary_datacenter_or_active_replica_or_cache? || cluster_dr_replica?

        if cluster_ha_replica_cache?
          instrument_system("nomad stop -yes elasticsearch", "Stopping the Nomad Elasticsearch job")
        else
          queue_nomad_job("/etc/nomad-jobs/elasticsearch/elasticsearch.hcl")
          queue_nomad_job("/etc/nomad-jobs/elasticsearch/es8-auditlog-migration.hcl") if es8_upgrade_needed?
        end

        instrument_system("nomad stop -yes es8-auditlog-migration", "Stopping the Nomad Elasticsearch Audit Log Migrator") unless es8_upgrade_needed?

        queue_nomad_job("/etc/nomad-jobs/nginx/nginx.hcl")
        queue_nomad_job("/etc/nomad-jobs/github/git-daemon.hcl")
        queue_nomad_job("/etc/nomad-jobs/governor/governor.hcl")
        queue_nomad_job("/etc/nomad-jobs/github/env.hcl")
        queue_nomad_job("/etc/nomad-jobs/dependabot/env.hcl") if dependabot_enabled?
        queue_nomad_job("/etc/nomad-jobs/dependency-graph-api/dependency-graph-api-env.hcl") if dependency_graph_enabled?
        queue_nomad_job("/etc/nomad-jobs/dependency-snapshots-api/env.hcl") if dependency_graph_enabled?
        queue_nomad_job("/etc/nomad-jobs/graphite-web/graphite-web.hcl")
        # === JOBS AUTOMATICALLY UPDATED ===

        if actions_enabled?
          queue_nomad_job("/etc/nomad-jobs/mssql/mssql.hcl")

          # Make sure new mssql container has correct servername to match hostname. In ghe-repl-start for example,
          # hostname can get changed in phase 1, then this gets called in phase 2 to apply it to the mssql container
          system_log("/usr/local/bin/ghe-actions-check -s mssql")
          system_log("/usr/local/share/enterprise/ghe-mssql-update-servername")

          # Don't stop mssql here if actions isn't enabled, since
          # configapply expects actions to remain healthy until app phase
        end

        if minio_enabled?
          queue_nomad_job("/etc/nomad-jobs/minio/minio.hcl")
        else
          instrument_system("nomad stop -yes minio", "Stopping Minio Nomad job")
        end

        if postfix_enabled?
          queue_nomad_job("/etc/nomad-jobs/postfix/postfix.hcl")
        else
          instrument_system("nomad stop -yes postfix", "Stopping Postfix Nomad job")
        end

        if !external_mysql_enabled?
          queue_nomad_job("/etc/nomad-jobs/mysql/mysql.hcl")
        else
          instrument_system("nomad stop -yes mysql", "Stopping MySQL Nomad job")
        end

        queue_nomad_job("/etc/nomad-jobs/alambic/alambic.hcl")

        queue_nomad_job("/etc/nomad-jobs/aqueduct-lite/aqueduct-lite.hcl")

        if spokesd_enabled?
          queue_nomad_job("/etc/nomad-jobs/spokesd/spokesctl.hcl")
        else
          instrument_system("nomad stop -yes spokesctl", "Stopping spokesctl Nomad job")
        end

        if nes_enabled?
          queue_nomad_job("/etc/nomad-jobs/nes/nes.hcl")
        else
          instrument_system("nomad stop -yes nes", "Stopping NES Nomad job")
        end

        if telegraf_enabled?
          queue_nomad_job("/etc/nomad-jobs/telegraf/telegraf.hcl")
        else
          instrument_system("nomad stop -yes telegraf", "Stopping Telegraf Nomad job")
        end

        if http2hydro_enabled?
          queue_nomad_job("/etc/nomad-jobs/http2hydro/http2hydro.hcl")
        else
          instrument_system("nomad stop -yes http2hydro", "Stopping http2hydro Nomad job")
        end

      end

      def nomad_run_app_jobs
        system_log("/usr/local/share/enterprise/ghe-docker-load-images")
        return unless ghes_nomad_delegate?

        wait_for_service_status("nomad")
        wait_for_nomad # wait for nomad itself to be available

        queue_nomad_job("/etc/nomad-jobs/authzd/authzd.hcl")

        queue_nomad_job("/etc/nomad-jobs/authnd/authnd.hcl")
        queue_nomad_job("/etc/nomad-jobs/authnd/authnd-notifier.hcl")

        queue_nomad_job("/etc/nomad-jobs/kredz/kredz-varz.hcl")
        queue_nomad_job("/etc/nomad-jobs/kredz/kredz.hcl")
        queue_nomad_job("/etc/nomad-jobs/kredz/kredz-hydro-consumer.hcl")

        if nomad_primary_datacenter?
          if actions_enabled?
            # Put ghe-actions-start and configure behind app.actions.updates-disabled flag so it can be skipped if needed
            unless actions_updates_disabled?
              ok, _ = system_log("/usr/local/bin/ghe-actions-start --phase app && /usr/local/bin/ghe-actions-configure")
              if !ok
                log_status "Failed to configure Actions", :failed
                exit(1)
              end
            end
          else
            nomad_stop_actions
            nomad_stop_mssql
          end
        else
          # Make sure mssql is stopped on replica(s) if actions is not enabled
          if !actions_enabled?
            nomad_stop_mssql
          end
        end

        if dependabot_enabled?
          queue_nomad_job("/etc/nomad-jobs/dependabot/api.hcl")
          queue_nomad_job("/etc/nomad-jobs/dependabot/aqueduct-worker.hcl")
          queue_nomad_job("/etc/nomad-jobs/dependabot/hydro-consumer.hcl")
          queue_nomad_job("/etc/nomad-jobs/dependabot/timerd.hcl")
        else
          system_log("nomad stop -yes dependabot-api")
          system_log("nomad stop -yes dependabot-aqueduct-worker")
          system_log("nomad stop -yes dependabot-hydro-consumer")
          system_log("nomad stop -yes dependabot-timerd")
        end

        if dependency_graph_enabled?
          queue_nomad_job("/etc/nomad-jobs/dependency-graph-api/dependency-graph-api.hcl")
          queue_nomad_job("/etc/nomad-jobs/dependency-snapshots-api/dependency-snapshots-api.hcl")
          queue_nomad_job("/etc/nomad-jobs/dependency-graph-api/dependency-graph-api.aqueduct-worker.hcl")
          queue_nomad_job("/etc/nomad-jobs/dependency-graph-api/dependency-graph-api.processor-manifest-file-changed-worker.hcl")
          queue_nomad_job("/etc/nomad-jobs/dependency-graph-api/dependency-graph-api.processor-manifest-file-deleted-worker.hcl")
        else
          system_log("nomad stop -yes dependency-graph-api-service")
          system_log("nomad stop -yes dependency-graph-api-env")
          system_log("nomad stop -yes dependency-snapshots-api-service")
          system_log("nomad stop -yes dependency-snapshots-api-env")
          system_log("nomad stop -yes dependency-graph-api-aqueduct-worker")
          system_log("nomad stop -yes dependency-graph-api-processor-manifest-file-changed-worker")
          system_log("nomad stop -yes dependency-graph-api-processor-manifest-file-deleted-worker")
        end

        if packages_enabled?
          queue_nomad_job("/etc/nomad-jobs/packages/packages.hcl")
          queue_nomad_job("/etc/nomad-jobs/packages-v2/packages-v2.hcl")
          queue_nomad_job("/etc/nomad-jobs/packages-v2/azcleancpsrc.hcl")
        else
          system_log("nomad stop -yes packages")
          system_log("nomad stop -yes packages-v2")
          system_log("nomad stop -yes azcleancpsrc")
        end

        if packages_enabled? && !container_disabled?
          queue_nomad_job("/etc/nomad-jobs/packages-v2/packages-v2-download-count-aggregator.hcl")
        else
          system_log("nomad stop -yes packages-v2-download-count-aggregator")
        end

        if gitrpcd_enabled?
          queue_nomad_job("/etc/nomad-jobs/gitrpcd/gitrpcd.hcl")
        else
          system_log("nomad stop -yes gitrpcd")
        end

        if spokesd_enabled?
          queue_nomad_job("/etc/nomad-jobs/spokesd/spokesd.hcl")
          queue_nomad_job("/etc/nomad-jobs/spokesd/spokes-sweeper.hcl")
          queue_nomad_job("/etc/nomad-jobs/spokesd/spokesctl.hcl")
        else
          system_log("nomad stop -yes spokesctl")
          system_log("nomad stop -yes spokes-sweeper")
          system_log("nomad stop -yes spokesd")
        end

        queue_nomad_job("/etc/nomad-jobs/driftwood/driftwood.hcl") if streaming_enabled?

        queue_nomad_job("/etc/nomad-jobs/hookshot-go/hookshot-go.hcl")

        queue_nomad_job("/etc/nomad-jobs/github/stream-processors.hcl")

        queue_nomad_job("/etc/nomad-jobs/turboghas/turboghas.hcl")
        queue_nomad_job("/etc/nomad-jobs/turboghas/turboghas-sync.hcl")

        if code_scanning_enabled?
          queue_nomad_job("/etc/nomad-jobs/turboscan/turboscan.hcl")
          queue_nomad_job("/etc/nomad-jobs/turboscan/turboscan-archiver.hcl")
          queue_nomad_job("/etc/nomad-jobs/turboscan/turboscan-garbage-collector.hcl")
          queue_nomad_job("/etc/nomad-jobs/turboscan/turboscan-repo-deleter.hcl")
          queue_nomad_job("/etc/nomad-jobs/turboscan/turboscan-repo-indexer.hcl")
          queue_nomad_job("/etc/nomad-jobs/turboscan/turboscan-stale-validation-runs.hcl")
          queue_nomad_job("/etc/nomad-jobs/turboscan/turboscan-scheduled-analyses-runner.hcl")
        else
          system_log("nomad stop -yes turboscan")
          system_log("nomad stop -yes turboscan-archiver")
          system_log("nomad stop -yes turboscan-garbage-collector")
          system_log("nomad stop -yes turboscan-repo-deleter")
          system_log("nomad stop -yes turboscan-repo-indexer")
          system_log("nomad stop -yes turboscan-stale-validation-runs")
          system_log("nomad stop -yes turboscan-scheduled-analyses-runner")
        end

        if secret_scanning_enabled?
          queue_nomad_job("/etc/nomad-jobs/token-scanning-service/token-scanning-api.hcl")
          queue_nomad_job("/etc/nomad-jobs/token-scanning-service/token-scanning-scans-api.hcl")
          queue_nomad_job("/etc/nomad-jobs/token-scanning-service/token-scanning-hydro-consumer.hcl")
          queue_nomad_job("/etc/nomad-jobs/token-scanning-service/token-scanning-incremental-worker.hcl")
          queue_nomad_job("/etc/nomad-jobs/token-scanning-service/token-scanning-backfill-worker.hcl")
          queue_nomad_job("/etc/nomad-jobs/token-scanning-service/token-scanning-content-backfill-worker.hcl")
          queue_nomad_job("/etc/nomad-jobs/token-scanning-service/token-scanning-hcs-upgrade-backfill-worker.hcl")
          queue_nomad_job("/etc/nomad-jobs/token-scanning-service/token-scanning-udp-backfill-worker.hcl")
          queue_nomad_job("/etc/nomad-jobs/token-scanning-service/token-scanning-hcs-upgrade-backfill-scheduler.hcl")
          queue_nomad_job("/etc/nomad-jobs/token-scanning-service/token-scanning-encrypted-secrets-backfill-scheduler.hcl")
          queue_nomad_job("/etc/nomad-jobs/token-scanning-service/token-scanning-dispatch.hcl")
          queue_nomad_job("/etc/nomad-jobs/token-scanning-service/token-scanning-content-scan-worker.hcl")
          queue_nomad_job("/etc/nomad-jobs/token-scanning-service/token-scanning-reposync-worker.hcl")
          queue_nomad_job("/etc/nomad-jobs/token-scanning-service/token-scanning-jobgroup-worker.hcl")
          queue_nomad_job("/etc/nomad-jobs/token-scanning-service/token-scanning-partner-validity-check-scheduler.hcl")
          queue_nomad_job("/etc/nomad-jobs/token-scanning-service/token-scanning-partner-validity-check-worker.hcl")
          queue_nomad_job("/etc/nomad-jobs/token-scanning-service/token-scanning-content-backfill-scheduler.hcl")
        else
          system_log("nomad stop -yes token-scanning-api")
          system_log("nomad stop -yes token-scanning-scans-api")
          system_log("nomad stop -yes token-scanning-hydro-consumer")
          system_log("nomad stop -yes token-scanning-incremental-worker")
          system_log("nomad stop -yes token-scanning-backfill-worker")
          system_log("nomad stop -yes token-scanning-content-backfill-worker")
          system_log("nomad stop -yes token-scanning-hcs-upgrade-backfill-worker")
          system_log("nomad stop -yes token-scanning-encrypted-secrets-backfill-scheduler")
          system_log("nomad stop -yes token-scanning-udp-backfill-worker")
          system_log("nomad stop -yes token-scanning-hcs-upgrade-backfill-scheduler")
          system_log("nomad stop -yes token-scanning-dispatch")
          system_log("nomad stop -yes token-scanning-content-scan-worker")
          system_log("nomad stop -yes token-scanning-reposync-worker")
          system_log("nomad stop -yes token-scanning-jobgroup-worker")
          system_log("nomad stop -yes token-scanning-partner-validity-check-scheduler")
          system_log("nomad stop -yes token-scanning-partner-validity-check-worker")
          system_log("nomad stop -yes token-scanning-content-backfill-scheduler")
        end

        if chatops_slack_enabled?
          queue_nomad_job("/etc/nomad-jobs/slack/slack.hcl")
        else
          system_log("nomad stop -yes slack")
        end

        if chatops_msteams_enabled?
          queue_nomad_job("/etc/nomad-jobs/msteams/msteams.hcl")
        else
          system_log("nomad stop -yes msteams")
        end

        if !single_node? || ernicorn_single_node_enabled?
          queue_nomad_job("/etc/nomad-jobs/github/ernicorn.hcl")
        end

        queue_nomad_job("/etc/nomad-jobs/treelights/treelights.hcl")
        queue_nomad_job("/etc/nomad-jobs/gpgverify/gpgverify.hcl")
        queue_nomad_job("/etc/nomad-jobs/mail-replies/mail-replies.hcl")

        if pages_enabled?
          queue_nomad_job("/etc/nomad-jobs/pages/pages.hcl") if primary_datacenter_or_active_replica?
          if actions_enabled? && nomad_primary_datacenter?
            queue_nomad_job("/etc/nomad-jobs/pages/pages-deployer-worker.hcl")
            queue_nomad_job("/etc/nomad-jobs/pages/pages-deployer-api.hcl")
          else
            nomad_stop_pages_deployer
          end
        else
          nomad_stop_pages
        end

        queue_nomad_job("/etc/nomad-jobs/babeld/babeld.hcl") if primary_datacenter_or_active_replica_or_cache?
        queue_nomad_job("/etc/nomad-jobs/lfs-server/lfs-server.hcl") if primary_datacenter_or_active_replica_or_cache?
        queue_nomad_job("/etc/nomad-jobs/alive/alive.hcl")
        queue_nomad_job("/etc/nomad-jobs/codeload/codeload.hcl") if primary_datacenter_or_active_replica?
        queue_nomad_job("/etc/nomad-jobs/github/timerd.hcl")
        queue_nomad_job("/etc/nomad-jobs/github/resqued.hcl")
        queue_nomad_job("/etc/nomad-jobs/github/unicorn.hcl") if primary_datacenter_or_active_replica_or_cache?
        queue_nomad_job("/etc/nomad-jobs/github/gitauth.hcl") if primary_datacenter_or_active_replica_or_cache?
        queue_nomad_job("/etc/nomad-jobs/notebooks/notebooks.hcl")
        queue_nomad_job("/etc/nomad-jobs/viewscreen/viewscreen.hcl")
        queue_nomad_job("/etc/nomad-jobs/grafana/grafana.hcl")

        if cluster_rebalance_enabled?
          queue_nomad_job("/etc/nomad-jobs/cluster-rebalance/cluster-rebalance.hcl")
        else
          system_log("nomad stop -yes cluster-rebalance")
        end
      end

      def nomad_run_github_jobs
        return unless ghes_nomad_delegate?

        queue_nomad_job("/etc/nomad-jobs/github/env.hcl")
        queue_nomad_job("/etc/nomad-jobs/github/git-daemon.hcl")
        queue_nomad_job("/etc/nomad-jobs/github/stream-processors.hcl")
        if !single_node? || ernicorn_single_node_enabled?
          queue_nomad_job("/etc/nomad-jobs/github/ernicorn.hcl")
        end
        queue_nomad_job("/etc/nomad-jobs/github/timerd.hcl")
        queue_nomad_job("/etc/nomad-jobs/github/resqued.hcl")
        queue_nomad_job("/etc/nomad-jobs/github/unicorn.hcl") if primary_datacenter_or_active_replica_or_cache?
        queue_nomad_job("/etc/nomad-jobs/github/gitauth.hcl") if primary_datacenter_or_active_replica_or_cache?
      end

      def primary_datacenter_or_active_replica?
        nomad_primary_datacenter? || cluster_ha_replica_active?
      end

      def primary_datacenter_or_active_replica_or_cache?
        nomad_primary_datacenter? || cluster_ha_replica_active? || cluster_ha_replica_cache?
      end

      def nomad_apply_jobs_and_wait_for_healthy(nomad_services)
        instrument_system("/usr/local/share/enterprise/ghe-nomad-jobs apply-wait-all-queues", "ghe-nomad-jobs apply-wait-all-queues")
        instrument_call("wait_for_nomad_jobs_to_be_running(nomad_services, 500.0)", "Waiting for nomad jobs to be running", name: "wait_for_nomad_jobs_to_be_running", nomad_services: nomad_services)
        instrument_system("/usr/local/share/enterprise/ghe-nomad-jobs wait-health-checks #{nomad_services.join(' ')}", "ghe-nomad-jobs wait-health-checks", check_exit: true)
      end

      def wait_for_nomad(timeout = 240, no_leader_timeout = 5)
        log "Waiting for nomad to be available"
        no_leader_retries = no_leader_timeout
        timeout.times do
          _, err, status = Open3.capture3("nomad node status --self")
          if status == 0
            log "Nomad is available"
            return
          elsif err.include? "No cluster leader"
            if no_leader_retries == 0
              log "Restarting Nomad"
              system_log("sudo systemctl restart nomad")
              no_leader_retries = no_leader_timeout
            else
              no_leader_retries -= 1
            end
          end
          sleep 1
        end
        # TODO this was originally this:
        # log "Nomad did not become available within #{timeout} seconds", :failed
        # is this actually supposed to be a call to log_status?
        log "Nomad did not become available within #{timeout} seconds"
        exit(1)
      end

      def nomad_job_running?(nomad_job)
        ok, _ = system_log("ghe-nomad-api jobs?prefix=#{nomad_job} 2>&1 | jq -e '.[] | select(.Status == \"running\")'")
        return ok
      end

      def nomad_ensure_eligibility(timeout = 60)
        return true if nomad_is_eligible?
        instrument_system("nomad node eligibility -enable -self", "Enabling Nomad scheduling eligibility")

        # Wait up to a minute for the node to respond with eligible status
        loop_with_timeout(timeout) do
          return true if nomad_is_eligible?
          sleep 1
        end

        # If Nomad fails to become eligible notify logs and fail
        log "Nomad did not return its status as eligible for job placement in time.", :failed
        exit(1)
      end

      private

      def queue_nomad_job(nomad_job)
        name = File.basename(nomad_job, ".*")
        if tracer
          instrument_system("/usr/local/share/enterprise/ghe-nomad-jobs queue #{nomad_job}", "Queueing Nomad job #{nomad_job}", name: "/usr/local/share/enterprise/ghe-nomad-jobs queue", check_exit: true)
        else
          system_log("/usr/local/share/enterprise/ghe-nomad-jobs queue #{nomad_job}")
        end
      end

      def wait_for_nomad_jobs_to_be_running(services = APP_NOMAD_SERVICES, timeout = 500.0)
        nomad_job_names ||= []
        services.each do |service|
          nomad_job_names << service if enabled_service?(service)
        end
        loop_with_timeout(timeout) do
          nomad_job_names.delete_if do |job_name|
            check_job_cmd = "/usr/local/bin/ghe-nomad-check-job -j #{job_name}"
            out = ""
            out, err, status = Open3.capture3(check_job_cmd) { |f| f.read }
            case status.to_i
            when 0
              if out == ""
                log "Job " + job_name + " is ready."
                next true
              else
                log "Waiting for " + job_name + ", status: " + out
              end
            when 1
              log "Waiting for #{job_name}, status: #{err}"
            end
            false
          end
          break if nomad_job_names.empty?
          sleep 1
        end
        true
      rescue PhaseHelpers::LoopTimeoutError
        log "Timed out waiting #{timeout}s for nomad jobs: " + nomad_job_names.join(", ")
        false
      end

      def nomad_stop_mssql
        return unless ghes_nomad_delegate?
        system_log("nomad stop -yes mssql")
      end

      def nomad_stop_pages
        return unless ghes_nomad_delegate?
        system_log("nomad stop -yes pages")
        nomad_stop_pages_deployer
      end

      def nomad_stop_pages_deployer
        return unless ghes_nomad_delegate?
        system_log("nomad stop -yes pages-deployer-worker")
        system_log("nomad stop -yes pages-deployer-api")
      end

      def nomad_stop_actions
        return unless ghes_nomad_delegate?
        if File.exist?("/usr/local/bin/ghe-actions-stop")
          system_log("/usr/local/bin/ghe-actions-stop")
        end
      end

      def nomad_is_eligible?
        # Return true if node is eligible for scheduling
        return !! system_log("nomad node status -self -json | jq -er '.SchedulingEligibility == \"eligible\"'")
      end
    end
  end
end
