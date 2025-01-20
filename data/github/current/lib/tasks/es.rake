# frozen_string_literal: true
namespace :es do
  desc "Create Elasticsearch indices"
  task :setup => :environment do
    app = Elastomer::App.new
    app.setup
  end

  desc "Reconcile Elasticsearch indices"
  task :reconcile => :environment do
    Elastomer.config.read_timeout = 30.seconds.to_i
    app = Elastomer::App.new
    app.repair
  end

  desc "Create and populate Elasticsearch indices"
  task :bootstrap => :environment do
    purge = GitHub.enterprise?
    app = Elastomer::App.new(:purge => purge)
    app.bootstrap
  end

  desc "Upgrade out of date Elasticsearch indices"
  task :upgrade => [:upgrade_indices, :upgrade_audit_logs]

  desc "Delete, recreate, and populate Elasticsearch indices"
  task :reset => :environment do
    app = Elastomer::App.new
    app.reset
  end

  task :upgrade_indices => :environment do
    Elastomer.config.read_timeout = 30.seconds.to_i
    purge = GitHub.enterprise?
    app = Elastomer::App.new(:purge => purge)
    app.upgrade
  end

  task :upgrade_audit_logs => :environment do
    Elastomer.config.read_timeout = 30.seconds.to_i
    RebuildAuditLogsJob.perform_now(lucene_check: "5.2.0")
  end

  desc "Bootstrap the audit log indexes to fix development issues"
  task :bootstrap_audit_logs => :environment do
    app = Elastomer::App.new(cluster: GitHub.es_audit_log_cluster)

    if app.es_audit_logger.index.exists?
      puts "Dropping audit_log index"
      puts app.es_audit_logger.drop_index
    end

    puts "Trigger an inline audit-log creation..."
    GitHub.audit.inline { GitHub.audit.log("test.event", { action: "test.event" }) }
    puts "Create an alias..."
    alx = app.es_audit_logger.generate_index
    app.es_audit_logger.get_cluster_all_audit_log_indices.each do |index|
      app.es_audit_logger.index.cluster.update_aliases({ add: { index: index , alias: alx } })
    end
  end

  namespace :test do
    desc "Create the Elasticsearch test indices"
    task :prepare => :environment do
      ActiveRecord::Base.establish_connection(:mysql1_primary) # rubocop:disable GitHub/DoNotCallMethodsOnActiveRecordBase

      Elastomer.setup(:postfix => "test")
      app = Elastomer::App.new(:purge => true, :env => "test")
      app.bootstrap
    end
  end

  namespace :enterprise do
    desc "Setup in enterprise environment"
    # if the "cluster" value is passed in, then app.setup is only run against that cluster
    task :setup, [:cluster] => [:environment] do |_t, args|
      if GitHub.es_clusters.empty?
        Rake::Task["es:setup"].invoke
      else
        if args[:cluster].blank?
          primary_app = Elastomer::App.new(cluster: GitHub.primary_datacenter)
          primary_app.setup

          replica_clusters = GitHub.es_clusters.keys - [GitHub.primary_datacenter]
          replica_clusters.each do |cluster|
            app = Elastomer::App.new(primary_cluster: false, cluster: cluster)
            app.setup
          end
        else
          all_clusters = GitHub.es_clusters.keys
          unless all_clusters.include?(args[:cluster])
            raise ArgumentError, "\"#{args[:cluster]}\" is not a known cluster"
          end

          if GitHub.primary_datacenter == args[:cluster]
            app = Elastomer::App.new(cluster: GitHub.primary_datacenter)
          else
            app = Elastomer::App.new(primary_cluster: false, cluster: args[:cluster])
          end
          app.setup
        end

        # Mark templates on different clusters as not writable
        writable_templates = Elastomer.router.writable_templates(Elastomer::Indexes::AuditLog)
        writable_templates.each do |template|
          next if GitHub.es_clusters.keys.include?(template.cluster)

          template.primary = false
          template.writable = false
          template.save!
        end
      end
    end

    desc "Upgrade in enterprise environment"
    task :upgrade => :environment do
      if GitHub.es_clusters.empty?
        Rake::Task["es:upgrade"].invoke
      else
        primary_app = Elastomer::App.new(cluster: GitHub.primary_datacenter)
        primary_app.upgrade

        Elastomer.config.read_timeout = 30.seconds.to_i
        RebuildAuditLogsJob.perform_now(cluster: GitHub.primary_datacenter, lucene_check: "5.2.0")

        replica_clusters = GitHub.es_clusters.keys - [GitHub.primary_datacenter]

        replica_clusters.each do |cluster|
          app = Elastomer::App.new(primary_cluster: false, cluster: cluster)
          app.upgrade

          RebuildAuditLogsJob.perform_now(cluster: cluster, primary_cluster: false)
        end
      end
    end

    desc "Promote indices by cluster"
    task :promote_indices, [:cluster] => :environment do |_, args|
      app = Elastomer::App.new(cluster: args[:cluster])

      app.each_index_class do |index_class|
        index_name = app.latest_index_name(index_class)
        index = index_class.new(index_name, args[:cluster])
        app.promote_to_primary(index)
      end

      old_primary = Elastomer.router.primary_template(Elastomer::Indexes::AuditLog)
      old_primary.is_primary = false
      old_primary.save!

      audit_logs_template = Elastomer.router.writable_templates(Elastomer::Indexes::AuditLog, args[:cluster])
        .sort { |a, b| b.created_at <=> a.created_at }.first

      audit_logs_template.is_primary = true
      audit_logs_template.save!

      Elastomer.router.index_map.all_index_slices(audit_logs_template.fullname).each do |index_config|
        app.promote_to_primary(index_config.index)
      end
    end

    desc "Wait for Elasticsearch cluster health to be 'status'"
    task :wait_for_status, [:status] => [:environment] do |_t, raw_args|
      args = raw_args.with_defaults(:status => "green")

      app = Elastomer::App.new
      params = {
        :wait_for_status => args[:status],
        :timeout => "30s",
        :wait_for_no_relocating_shards => true
      }

      health = app.client.cluster.health params
      puts health
    end

    desc "Show Elasticsearch cluster and nodes statuses"
    task :status => :environment do
      app = Elastomer::App.new
      failed = false

      %w[cluster.pending_tasks\
         cluster.state\
         nodes.hot_threads\
         nodes.stats\
         cluster.get_aliases].each do |debug|
        begin
          puts(eval "app.client.#{debug}") # rubocop:disable Security/Eval
        rescue ElastomerClient::Client::Error
          puts "Failed to retrieve #{debug}."
          failed = true
        end
      end

      raise if failed
    end

    desc "Update Elasticsearch shard allocation"
    task :update_shard_allocation, [:allocation] => [:environment] do |_t, args|
      app = Elastomer::App.new
      allocation = args[:allocation]
      settings = app.client.cluster.get_settings :flat_settings => true

      persistent = settings["persistent"]
      # prevent ElastomerClient::Client::RequestError:ActionRequestValidationException[Validation Failed: 1: no settings to update;]
      if persistent && persistent["cluster.routing.allocation.enable"] == allocation
        puts "No settings to update."
        next
      end

      previous = persistent["cluster.routing.allocation.enable"]
      if previous
        puts "Updating from '#{previous}' to '#{allocation}'."
      else
        puts "Updating to '#{allocation}'."
      end

      app.client.cluster.update_settings \
        :persistent => { "cluster.routing.allocation.enable" => allocation },
        :flat_settings => true
    end

    desc "Exclude an IP address from Elasticsearch shard allocation"
    task :exclude_allocation, [:ip_address] => [:environment] do |_t, args|
      ip_address = args[:ip_address]

      # Validate IP address format
      unless ip_address =~ /\A(?:[0-9]{1,3}\.){3}[0-9]{1,3}\z/
        puts "Invalid IP address format."
        next
      end

      app = Elastomer::App.new
      settings = app.client.cluster.get_settings

      existing_ips = settings&.dig("persistent", "cluster", "routing", "allocation", "exclude", "_ip") || []
      if existing_ips.include?(ip_address)
        puts "Node is already excluded from shard allocation."
        next
      end

      updated_ips = existing_ips + [ip_address]

      puts "Updating setting 'persistent.cluster.routing.allocation.exclude._ip' from '#{existing_ips}' to '#{updated_ips}'."

      app.client.cluster.update_settings :persistent => { "cluster.routing.allocation.exclude._ip" => updated_ips }
    end

    desc "Remove node exclusion from Elasticsearch shard allocation"
    task :remove_allocation_exclusion, [:ip_address] => [:environment] do |_t, args|
      ip_address = args[:ip_address]

      # Validate IP address format
      unless ip_address =~ /\A(?:[0-9]{1,3}\.){3}[0-9]{1,3}\z/
        puts "Invalid IP address format."
        next
      end

      app = Elastomer::App.new
      settings = app.client.cluster.get_settings

      current_ips = settings&.dig("persistent", "cluster", "routing", "allocation", "exclude", "_ip") || []

      unless current_ips.include?(ip_address)
        puts "IP address not found in exclusion from shard allocation."
        next
      end

      updated_ips = current_ips.reject { |ip| ip == ip_address }

      puts "Updating setting 'persistent.cluster.routing.allocation.exclude._ip' from '#{current_ips}' to '#{updated_ips}'."

      if updated_ips.empty?
        if app.client.version_support.es_version_8_plus?
          # Reset setting in 8.x by passing nil
          updated_ips = nil
        else
          # Reset setting in 5.x by passing array with nil element
          updated_ips = [nil]
        end
      end

      app.client.cluster.update_settings :persistent => { "cluster.routing.allocation.exclude._ip" => updated_ips }
    end

    desc "Rebuild audit log search indices"
    task :rebuild_audit_logs => :environment do
      RebuildAuditLogsJob.perform_later(cluster: GitHub.es_audit_log_cluster)
    end
  end
end
