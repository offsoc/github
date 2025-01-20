# frozen_string_literal: true

namespace :enterprise do
  namespace :fileserver do
    namespace :pages do
      desc "Disable unknown pages servers"
      task :mark_unknown_offline => :environment do |_task, args|
        abort "This should only be used in GitHub Enterprise" unless GitHub.single_or_multi_tenant_enterprise?
        known_hosts = args.extras
        Page::FileServer.where.not(host: known_hosts).each do |fs|
          fs.online = false
          fs.save!
        end
      end

      desc "register a pages fileserver"
      task :register, [:hostname] => :environment do |_task, args|
        abort "This should only be used in GitHub Enterprise" unless GitHub.single_or_multi_tenant_enterprise?

        Rails.logger.info "Creating pages file server '#{args[:hostname]}'..."
        fileserver = Page::FileServer.find_or_initialize_by(host: args[:hostname])
        fileserver.online = true
        fileserver.embargoed = false
        fileserver.disk_free = 100000
        fileserver.disk_used = 0
        fileserver.save!

        Rails.logger.info "Creating pages partitions..."
        (0..7).each do |partition|
          partition = Page::Partition.find_or_initialize_by(
            host: args[:hostname],
            partition: partition
          )
          partition.disk_free = 1000000
          partition.disk_used = 0
          partition.save!
        end
      end
    end

    namespace :storage do
      desc "Disable unknown storage servers"
      task :mark_unknown_offline => :environment do |_task, args|
        abort "This should only be used in GitHub Enterprise" unless GitHub.single_or_multi_tenant_enterprise?

        known_hosts = args.extras
        Storage::FileServer.where.not(host: known_hosts).each do |fs|
          fs.online = false
          fs.save!
        end
      end

      desc "Register a storage fileserver"
      task :register, [:hostname] => :environment do |_task, args|
        abort "This should only be used in GitHub Enterprise" unless GitHub.single_or_multi_tenant_enterprise?

        Rails.logger.info "Creating storage file server '#{args[:hostname]}'..."
        fileserver = Storage::FileServer.find_or_initialize_by(host: args[:hostname])
        fileserver.online =  true
        fileserver.embargoed = false
        fileserver.save!
      end
    end

    namespace :git do
      desc "Disable unknown git servers"
      task :mark_unknown_offline => :environment do |_task, args|
        abort "This should only be used in GitHub Enterprise" unless GitHub.single_or_multi_tenant_enterprise?

        known_hosts = args.extras
        GitHub::DGit::SpokesSQL.run <<-SQL, hosts: known_hosts
          UPDATE fileservers SET online=0 WHERE host NOT IN :hosts;
        SQL
      end

      desc "Register a git fileserver"
      task :register, [:hostname, :fqdn, :site, :dc] => :environment do |_task, args|
        abort "This should only be used in GitHub Enterprise" unless GitHub.single_or_multi_tenant_enterprise?

        host = args[:hostname]
        fqdn = args[:fqdn]
        site = args[:site]
        dc   = args[:dc]

        Rails.logger.info "Creating git file server '#{host}/#{dc}'..."
        sql = GitHub::DGit::SpokesSQL.new <<-SQL, host: host, fqdn: fqdn, site: site, dc: dc
          REPLACE INTO fileservers (host, fqdn, site, datacenter, rack, online, non_voting)
          VALUES
            (:host, :fqdn, :site, :dc, "?", 1, 0)
        SQL
        sql.run
      end
    end
  end
end
