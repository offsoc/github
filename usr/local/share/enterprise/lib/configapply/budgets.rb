# frozen_string_literal: true
module Enterprise
  module ConfigApply
    # Budgets contains methods that mostly handle memory allocations
    # and number of processes to run, based on the size of the VM it's running on
    module Budgets
      def dev_mode
        return @dev_mode if defined?(@dev_mode)

        @dev_mode = File.exist?("/etc/github/devmode")
      end

      def memory_budget(service_role, force_budget = false)
        # For Cluster mode, compute the total weight for budgets
        # by the roles available on the cluster specification
        # If there is no cluster_roles, fallback to single node logic
        # since total_budget can not be 0 as denominator
        if cluster_regular_enabled? && cluster_roles.length > 0
          return 0 unless cluster_roles(force_budget).include?(service_role)
          total_budget = 0
          cluster_roles.each do |role|
            budget = service_budgets[role]
            total_budget += budget if budget
          end
          total_budget = 100 if total_budget == 0
        else
          # In Single/HA mode, we will use total budget as 100
          # so it will be inline with legacy algorithm so we won't
          # allocate too much memory especially for lower-end specs
          total_budget = 100
        end

        [
          (memory * (service_budgets[service_role].to_i / total_budget.to_f)).to_i,
          service_budget_caps[service_role]
        ].compact.min
      end

      def total_workers
        total_workers = [
          (cpus * 1.5).floor,
          memory_budget("job-server") / (1024 * MEGABYTE)
        ].min

        total_workers.clamp(4, 48)
      end

      def haproxy_nbthread
        nbthread = raw_config_value("haproxy-nbthread")
        # Use any existing legacy setting to map it to nbthread instead if nbthread is not also set
        nbthread ||= raw_config_value("haproxy-nbproc")

        nbthread = nbthread.to_i
        nbthread > 0 ? nbthread : 4
      end

      def memcache_memory_mb
        if dev_mode
          768
        else
          budget = memory_budget("memcache-server")
          budget / 1024 # megabytes
        end
      end

      private

      def service_budgets
        # These are the relative memory budgets (weights) available
        # for each service. In cases where there's only a subset of services
        # on a given node (for example, in clustering, BYO-service, or for optional services),
        # this supports dynamically allocating memory using these weights.
        { "web-server" => 25,
          "job-server" => 25,
          "mysql-server" => mysql_service_budget,
          "mssql-server" => mssql_service_budget,
          "elasticsearch-server" => 8,
          "bare-server" => 2,
          "memcache-server" => memcache_service_budget,
          "git-server" => 10,
          "redis-server" => redis_service_budget }.freeze
      end

      # The percentage of memory allocated to the MSSQL container.  MSSQL has a minimum
      # requirement of 2 GBs.  The default budget is 8, which provides ~2.6 GBs on machines
      # with the minimum system requirement of 32 GBs.
      #
      # Return: Percentage (0-100)
      def mssql_service_budget
        if actions_ever_enabled?
          (config_value("app", "actions", "mssql-service-budget") || 8).to_i
        else
          0
        end
      end

      # The percentage of memory MySQL gets is based on the total number of gigabytes
      # of memory available. Currently if a system has 48GB+ of memory the MySQL
      # budget is 16% otherwise it's 8%. With BYODB, we should return 0
      #
      # Return: Percentage (0-100)
      def mysql_service_budget
        return 0 if external_mysql_enabled?
        memory >= 48 * GIGABYTE ? 16 : 8
      end

      # The percentage of memory Memcache gets is based on the total number of kilobytes
      # of memory available. Currently if a system has 72GB+ of memory the Memcache
      # budget is 8%, 4% if more than 48GB and otherwise it's 2%.
      #
      # Return: Percentage (0-100)
      def memcache_service_budget
        if memory >= 72 * GIGABYTE
          8
        elsif memory >= 48 * GIGABYTE
          4
        else
          2
        end
      end

      # The percentage of memory Redis gets is based on the total number of kilobytes
      # of memory available. Currently if a system has 96 GB+ of memory the Redis
      # budget is 1%, 2% if more than 72GB, 3% if more than 48GB and otherwise it's
      # 4%.
      #
      # Return: Percentage (0-100)
      def redis_service_budget
        if memory >= 96 * GIGABYTE
          1
        elsif memory >= 72 * GIGABYTE
          2
        elsif memory >= 48 * GIGABYTE
          3
        else
          4
        end
      end

      # Some services should have absolute caps on the amount of allocated memory;
      # define those here.
      def service_budget_caps
        {
          "elasticsearch-server" => elasticsearch_budget_cap,
          "mssql-server" => mssql_budget_cap,
          "mysql-server" => mysql_budget_cap
        }
      end

      # Elasticsearch should have no more than a 32 GB heap.
      # If a system has less than 42 GB of RAM, limit the heap size to 75%
      # of the total value. This ensures we leave room for block cache.
      def elasticsearch_budget_cap
        memory < 42 * GIGABYTE ? (memory * 0.75) : 32 * GIGABYTE
      end

      # MSSQL should not use more than 64 GB memory.
      def mssql_budget_cap
        memory < 84 * GIGABYTE ? (memory * 0.75) : 64 * GIGABYTE
      end

      # MySQL should not use more than (by default) 64 GB memory.
      # This can be configured manually via ghe-config, for example "ghe-config mysql.max-memory 256"
      # This is mostly due to the initialisation times large buffer pools bring, combined with the fact that we don't
      # have a good use for such a large buffer pool.
      #
      # If a system has less than 84 GB of RAM, limit MySQL memory to 75%
      # of the total value. This ensures we leave room for block cache.
      #
      def mysql_budget_cap
        memory < 84 * GIGABYTE ? (memory * 0.75) : mysql_max_memory * GIGABYTE
      end

      module ViewHelpers
        def github_unicorns
          value_override = app_override("github", "github-workers").to_i
          # if override value is nil or not a valid input, to_i will return 0
          return value_override if value_override > 0

          if dev_mode
            2
          elsif cluster_ha_replica?
            4
          else
            budget = memory_budget("web-server")
            if budget > 18 * GIGABYTE
              30
            elsif budget > 16 * GIGABYTE
              24
            elsif budget > 8 * GIGABYTE
              16
            elsif budget > 4 * GIGABYTE
              8
            else
              4
            end
          end
        end

        def github_ernicorns
          value_override = app_override("github", "ernicorn-workers").to_i
          # if override value is nil or not a valid input, to_i will return 0
          return value_override if value_override > 0

          if cluster_ha_primary?
            git_servers.count - 1
          elsif dev_mode
            2
          else
            budget = memory_budget("git-server")
            if budget > 15.4 * GIGABYTE
              30
            elsif budget > 7.2 * GIGABYTE
              15
            elsif budget > 6.4 * GIGABYTE
              12
            elsif budget > 3.2 * GIGABYTE
              8
            elsif budget > 1.6 * GIGABYTE
              4
            else
              2
            end
          end
        end

        def gitauth_unicorns
          value_override = app_override("github", "gitauth-workers").to_i
          # if override value is nil or not a valid input, to_i will return 0
          return value_override if value_override > 0

          if dev_mode
            1
          else
            budget = memory_budget("web-server")
            if budget > 16 * GIGABYTE
              6
            elsif budget > 6 * GIGABYTE
              4
            else
              2
            end
          end
        end

        ## Elasticsearch workers count
        def es_worker_count
          # app.github.es-workers overrides the default value 
          value_override = app_override("github", "es-workers").to_i
          # if override value is nil or not a valid input, to_i will return 
          return value_override if value_override > 0

          # Dev mode is enabled for bp-dev testing only
          if dev_mode
            1
          else
            # elasticsearch workers are capped at 16
            max_workers = 16

            [ [ (cpus / 8).floor, max_workers ].min, 1 ].max
          end
        end
      end
      include ViewHelpers
    end
  end
end
