# frozen_string_literal: true
module Enterprise
  module ConfigApply
    # orchestrator: HA for MySQL
    module Orchestrator
      # We intentionally have two distinct functions, mysql_nodes and raft_nodes.
      # Today, our convention is to run orchestrator services on mysql hosts, but this doesn't
      # have to be the case, and in the future we may deploy orchestrator on different nodes.
      def mysql_nodes
        node_hostnames = cluster_nodes_in_datacenter(cluster_datacenter, "mysql")
        node_hostnames.map { |hostname| node_ip(hostname) }
      end

      def raft_nodes
        node_hostnames = cluster_nodes_in_datacenter(cluster_datacenter, "mysql")
        node_hostnames.map { |hostname| node_ip(hostname) }
      end

      def recover_cluster_filters
        if cluster_value("mysql-auto-failover") == true
          ["*"]
        else
          []
        end
      end

      def orchestrator_enabled?
        #############################################################################################################################
        # Only run orchestrator service if:
        # 1. ghes operating mode is 'regular cluster'
        # 2. AND node has 'mysql-server' role, in order to respect `services_map.json` config
        # 3. AND external_mysql feature(BYODB) is disabled
        # 4. AND node is not offline
        # ###########################################################################################################################
        return false if external_mysql_enabled?

        if cluster_regular_enabled?
          cluster_roles.include?("mysql-server") &&
            !cluster_value_true?(cluster_node_name, "offline")
        else
          false
        end
      end

      def detect_data_center_query
        return "" unless cluster_regular_enabled?

        # Example results following query:
        # select CASE @@hostname
        #   WHEN 'build-dr-primary-main' THEN 'primary'
        #   WHEN 'build-dr-primary-node1' THEN 'primary'
        #   WHEN 'build-dr-primary-node2' THEN 'primary'
        #   WHEN 'build-dr-primary-node3' THEN 'primary'
        #   WHEN 'build-dr-secondary-main' THEN 'secondary'
        #   WHEN 'build-dr-secondary-node1' THEN 'secondary'
        #   WHEN 'build-dr-secondary-node2' THEN 'secondary'
        #   WHEN 'build-dr-secondary-node3' THEN 'secondary'
        # END

        options = cluster_nodes.map do |node|
          node_dc = node["datacenter"]
          node_dc = "default" if node_dc.to_s.empty?
          hostname = node["hostname"]
          "WHEN '#{hostname}' THEN '#{node_dc}'"
        end.join(" ")

        "SELECT CASE @@hostname #{options} END"
      end

      module ViewHelpers
        def orchestrator_api_nodes
          raft_nodes.map { |ip| format("http://%s:3000/api", ip) }
        end

        def orchestrator_config
          {
            "Debug" => true,
            "EnableSyslog" => false,
            "ListenAddress" => ":3000",
            "MySQLTopologyUser" => "orchestrator",
            "MySQLTopologyPassword" => "${MYSQL_ORCHESTRATOR_PASSWORD}",
            "MySQLTopologyCredentialsConfigFile" => "",
            "MySQLTopologySSLPrivateKeyFile" => "",
            "MySQLTopologySSLCertFile" => "",
            "MySQLTopologySSLCAFile" => "",
            "MySQLTopologySSLSkipVerify" => true,
            "MySQLTopologyUseMutualTLS" => false,
            "MySQLTopologyUseMixedTLS" => false,
            "BackendDB" => "sqlite",
            "SQLite3DataFile" => "/var/lib/orchestrator/orchestrator.sqlite3",
            "MySQLConnectTimeoutSeconds" => 1,
            "DefaultInstancePort" => 3306,
            "DiscoverByShowSlaveHosts" => true,
            "DiscoverySeeds" => mysql_nodes,
            "InstancePollSeconds" => 5,
            "DiscoveryIgnoreReplicaHostnameFilters" => [],
            "UnseenInstanceForgetHours" => 240,
            "SnapshotTopologiesIntervalHours" => 0,
            "InstanceBulkOperationsWaitTimeoutSeconds" => 10,
            "HostnameResolveMethod" => "default",
            "MySQLHostnameResolveMethod" => "@@hostname",
            "SkipBinlogServerUnresolveCheck" => true,
            "ExpiryHostnameResolvesMinutes" => 60,
            "RejectHostnameResolvePattern" => "",
            "ReasonableReplicationLagSeconds" => 10,
            "ProblemIgnoreHostnameFilters" => [],
            "VerifyReplicationFilters" => false,
            "ReasonableMaintenanceReplicationLagSeconds" => 20,
            "CandidateInstanceExpireMinutes" => 60,
            "AuditLogFile" => "",
            "AuditToSyslog" => false,
            "RemoveTextFromHostnameDisplay" => ":3306",
            "ReadOnly" => false,
            "AuthenticationMethod" => "",
            "HTTPAuthUser" => "",
            "HTTPAuthPassword" => "",
            "AuthUserHeader" => "",
            "PowerAuthUsers" => [
              "*"
            ],
            "ClusterNameToAlias" => {},
            "ReplicationLagQuery" => "",
            "DetectClusterAliasQuery" => "SELECT 'ghe' FROM DUAL",
            "DetectClusterDomainQuery" => "",
            "DetectInstanceAliasQuery" => "",
            "DetectPromotionRuleQuery" => "",
            "DataCenterPattern" => "",
            "DetectDataCenterQuery" => detect_data_center_query,
            "PhysicalEnvironmentPattern" => "",
            "PromotionIgnoreHostnameFilters" => [],
            "DetectSemiSyncEnforcedQuery" => "",
            "ServeAgentsHttp" => false,
            "UseSSL" => false,
            "UseMutualTLS" => false,
            "SSLSkipVerify" => false,
            "SSLPrivateKeyFile" => "",
            "SSLCertFile" => "",
            "SSLCAFile" => "",
            "SSLValidOUs" => [],
            "URLPrefix" => "",
            "StatusEndpoint" => "/api/status",
            "StatusSimpleHealth" => true,
            "StatusOUVerify" => false,
            "StaleSeedFailMinutes" => 60,
            "SeedAcceptableBytesDiff" => 8192,
            "PseudoGTIDPattern" => "",
            "PseudoGTIDPatternIsFixedSubstring" => false,
            "PseudoGTIDMonotonicHint" => "asc:",
            "DetectPseudoGTIDQuery" => "",
            "BinlogEventsChunkSize" => 10_000,
            "SkipBinlogEventsContaining" => [],
            "ReduceReplicationAnalysisCount" => true,
            "FailureDetectionPeriodBlockMinutes" => 60,
            "RecoveryPeriodBlockSeconds" => 3600,
            "RecoveryIgnoreHostnameFilters" => [],
            "RecoverMasterClusterFilters" => recover_cluster_filters,
            "RecoverIntermediateMasterClusterFilters" => recover_cluster_filters,
            "OnFailureDetectionProcesses" => [],
            "PreFailoverProcesses" => [],
            "PostFailoverProcesses" => [
              "/usr/local/share/enterprise/ghe-orchestrator-post-failover '{successorHost}'"
            ],
            "PostUnsuccessfulFailoverProcesses" => [],
            "PostMasterFailoverProcesses" => [],
            "PostIntermediateMasterFailoverProcesses" => [],
            "CoMasterRecoveryMustPromoteOtherCoMaster" => true,
            "DetachLostReplicasAfterMasterFailover" => true,
            "ApplyMySQLPromotionAfterMasterFailover" => true,
            "PreventCrossDataCenterMasterFailover" => true,
            "PreventCrossRegionMasterFailover" => true,
            "MasterFailoverDetachReplicaMasterHost" => false,
            "MasterFailoverLostInstancesDowntimeMinutes" => 0,
            "PostponeReplicaRecoveryOnLagMinutes" => 0,
            "OSCIgnoreHostnameFilters" => [],
            "RaftEnabled" => true,
            "RaftBind" => node_ip(cluster_node_name),
            "RaftDataDir" => "/var/lib/orchestrator",
            "DefaultRaftPort" => 10_008,
            "RaftNodes" => raft_nodes,
            "ConsulAddress" => "localhost:8500",
            "ConsulCrossDataCenterDistribution" => false
          }
        end
      end
      include ViewHelpers
    end
  end
end
