# frozen_string_literal: true

module Enterprise
  module ConfigApply
    # Migrations contains methods that run database migrations
    module Migrations
      def database_migrations
        [
          Enterprise::ConfigApply::Resources::GHESManage::Migration,
          Enterprise::ConfigApply::Resources::Packages::Migration
        ]
      end

      def run_migrations
        return unless ghes_cluster_delegate?

        migration_run_id = Time.now.strftime("%Y%m%d-%H%M%S")
        migration_log_dir = Enterprise::ConfigApply::Resources::MigrationEvents.build_migration_log_dir(self, migration_run_id)
        FileUtils.mkdir_p(migration_log_dir)

        users_migration = Enterprise::ConfigApply::Resources::Users::Migration.new(apply: self)

        trace_event("configapply.migrations", description: "Running migrations") do |span|
          migrators = database_migrations.map { |m| m.new(apply: self, migration_run_id: migration_run_id) }

          # ghe-migrations requires a full migration list to be created before running the migrations
          # This operation is temporarily handled by both the migrators and the ghe-run-migrations script
          # until all the migrations from ghe-run-migrations are transitioned to Config Apply Resources
          migrators.each(&:add_to_migration_list)

          instrument_system("/usr/local/share/enterprise/ghe-service-wait-mysql", "Waiting for MySQL to be ready")
          mysql.reseed

          # This migration should run before the ghe-run-migrations script.
          # Once all the migrations from ghe-run-migrations are transitioned to Config Apply Resources,
          # this migration should be part of the resource_classes array.
          users_migration.migrate
          users_migration.expire_sessions

          logger.info "Running resource migrations"
          begin
            migrators.each(&:migrate)
          rescue Enterprise::ConfigApply::Resources::MigrationError => e
            logger.error "Migration failed: #{e.message}"
            raise e
          end

          need_schema_update = migrators.any?(&:need_schema_update?) ? "1" : "0"

          logger.info "Checking to see if post live migrations need to be run"
          instrument_system("MIGRATION_RUN_ID=\"#{migration_run_id}\" /usr/local/share/enterprise/ghe-run-post-live-migrations", "Running ghe-run-post-live-migrations", check_exit: true)

          logger.info "Running ghe-run-migrations"
          instrument_system("MIGRATION_RUN_ID=\"#{migration_run_id}\" NEED_SCHEMA_UPDATE=#{need_schema_update} /usr/local/share/enterprise/ghe-run-migrations", "Running ghe-run-migrations", check_exit: true)

          msg = "Performing Elasticsearch index updates"
          Enterprise::ConfigApply::PreflightPage.set_message(msg)
          logger.info(msg)
          es = Resources::Elasticsearch.new(apply: self)
          es.wait_for_healthy
          # this is gated to only run on a cluster failover:
          es.promote_indices
          es.rebuild_indices

          # Some migrations modify configuration files on the cluster delegate node.
          # Those configuration files could be used on the other nodes and
          # we need to make sure they are synced before we move on to the next phase.
          update_configs_on_all_nodes

          # Remove the preflights page, to allow enterprise-manage to track the progress of config-apply
          # ghe-single-config-apply cleanup will rerender the preflights page if necessary
          PreflightPage.remove_page
        end

        # If uuids are missing from cluster.conf, don't attempt to update
        # fileservers for git, pages and storage
        if single_node? || all_node_uuids_available?
          instrument_call("update_fileservers", "Updating fileservers")
          instrument_call("update_pages_fileservers", "Updating Pages fileservers")
          instrument_call("update_storage_fileservers", "Updating Storage fileservers")
        end

        instrument_call("update_oauth_applications", "Updating OAuth applications", log_event: false)
        instrument_call("run_mysql_queries", "Running MySQL queries to update fileservers")
        # gc all of the dispatch jobs
        instrument_system("nomad system gc", "gc all of the Nomad dispatch jobs")
      end

      # True if all nodes in the cluster config have a `uuid`; false if any don't
      def all_node_uuids_available?
        cluster_nodes.all? { |node| node.include?("uuid") }
      end

      def update_oauth_applications
        return unless ghes_cluster_delegate?

        # ensure oauth tokens are up to date (after hostname changes, ssl changes, or ghe-import-mysql)
        # todo: combine this with the oauth queires in ghe-storage-prepare
        scheme = if raw_config["github-ssl"]["enabled"]
                   "https"
                 else
                   "http"
                 end

        uri = "#{scheme}://#{raw_config['github-hostname']}"

        gist_callback_uri = if raw_config["subdomain-isolation"]
                              "#{scheme}://gist.#{raw_config['github-hostname']}/auth/github/callback"
                            else
                              "#{uri}/gist/auth/github/callback"
                            end

        mysql_query "UPDATE `oauth_applications` SET `callback_url` = '#{gist_callback_uri}', `raw_data` = NULL WHERE `name` = 'GitHub Gist'"
        mysql_query "UPDATE `oauth_applications` SET `callback_url` = '#{uri}/hookshot/auth/githubber/callback', `raw_data` = NULL WHERE `name` = 'GitHub Hookshot'"
        mysql_query "UPDATE `oauth_applications` SET `callback_url` = '#{uri}/pages/auth/githubber/callback', `raw_data` = NULL WHERE `name` = 'GitHub Pages'"
      end

      def mysql_query(query)
        @mysql_query_buffer ||= []
        @mysql_query_buffer << "#{query};"
      end

      def run_mysql_queries
        if @mysql_query_buffer && @mysql_query_buffer.size > 0
          log "Running #{@mysql_query_buffer.size} MySQL queries"
          @mysql_query_buffer.each { |q| log q }
          t0 = Time.now
          File.open("/data/user/tmp/migration.sql", "w") do |f|
            f.write(@mysql_query_buffer.join("\n") + "\n")
          system_log(%{/usr/local/share/enterprise/github-mysql -f /data/user/tmp/migration.sql})
          end
          log_time "MySQL queries", t0
        else
          logger.warn("Warning: No buffered MySQL queries found to execute")
        end
      end

      def update_configs_on_all_nodes
        return unless File.exist?("/etc/github/cluster") && File.read("/etc/github/cluster").chomp.length > 0

        PreflightPage.set_message("Updating configuration on all nodes.")

        trace_event("configapply.migrations.cluster_config_update") do |span|
          Command.new("sudo ghe-cluster-config-update -x").run!
        end
      end
    end
  end
end
