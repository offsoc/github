# Generated by the protocol buffer compiler.  DO NOT EDIT!
# source: admin/v1/service.proto

require 'google/protobuf'

require 'google/protobuf/timestamp_pb'
require 'google/protobuf/duration_pb'
require 'google/protobuf/wrappers_pb'
require 'hydro/schemas/blackbird/v0/entities/epoch_mode_pb'
Google::Protobuf::DescriptorPool.generated_pool.build do
  add_file("admin/v1/service.proto", :syntax => :proto3) do
    add_message "blackbirdmw.admin.v1.GetRepoStatusRequest" do
      optional :repo_nwo, :string, 1
      optional :corpus, :string, 2
      optional :repo_id, :uint32, 3
    end
    add_message "blackbirdmw.admin.v1.GetRepoStatusResponse" do
      optional :repo_id, :uint32, 1
      optional :repo_nwo, :string, 2
      optional :is_public, :bool, 3
      repeated :serving_ingests, :message, 8, "blackbirdmw.admin.v1.RepoIngest"
      repeated :indexer_ingests, :message, 9, "blackbirdmw.admin.v1.RepoIngest"
      optional :github_details, :message, 6, "blackbirdmw.admin.v1.GitHubRepositoryAPIResponse"
      optional :deleted_at, :message, 7, "google.protobuf.Timestamp"
      optional :database_repository, :message, 11, "blackbirdmw.admin.v1.DatabaseRepository"
    end
    add_message "blackbirdmw.admin.v1.RepoIngest" do
      optional :corpus, :string, 1
      optional :epoch_id, :uint32, 2
      repeated :snapshot_entries, :message, 6, "blackbirdmw.admin.v1.SnapshotEntry"
    end
    add_message "blackbirdmw.admin.v1.GitHubRepositoryAPIResponse" do
      optional :error, :string, 1
      optional :repository, :message, 2, "blackbirdmw.admin.v1.GitHubRepositoryDetails"
    end
    add_message "blackbirdmw.admin.v1.GitHubRepositoryDetails" do
      optional :id, :uint32, 1
      optional :network_id, :uint32, 2
      optional :owner_id, :uint32, 3
      optional :owner_login, :string, 4
      optional :owner_spammy, :bool, 17
      optional :name, :string, 5
      optional :public, :bool, 6
      optional :archived, :bool, 7
      optional :disk_usage, :uint64, 8
      optional :pushed_at, :message, 9, "google.protobuf.Timestamp"
      optional :created_at, :message, 10, "google.protobuf.Timestamp"
      optional :license_name, :string, 11
      optional :num_watchers, :int32, 12
      optional :num_stars, :int32, 13
      optional :has_readme, :bool, 14
      optional :public_fork_count, :int32, 15
      optional :paying_customer, :bool, 16
      optional :is_fork, :bool, 18
      map :experiments, :string, :string, 19
      optional :updated_at, :message, 20, "google.protobuf.Timestamp"
      optional :archived_at, :message, 21, "google.protobuf.Timestamp"
    end
    add_message "blackbirdmw.admin.v1.DatabaseRepository" do
      optional :repo_id, :uint32, 1
      optional :owner_id, :uint32, 2
      optional :owner_login, :string, 3
      optional :name, :string, 4
      optional :is_public, :bool, 5
      optional :source_topic, :string, 6
      optional :deleted_at, :message, 7, "google.protobuf.Timestamp"
      optional :is_archived, :bool, 8
      optional :pushed_at, :message, 9, "google.protobuf.Timestamp"
      optional :created_at, :message, 10, "google.protobuf.Timestamp"
      optional :has_license, :bool, 11
      optional :num_watchers, :int32, 12
      optional :num_stars, :int32, 13
      optional :has_readme, :bool, 14
      optional :public_fork_count, :int32, 15
      optional :commit_seq_no, :int64, 16
      optional :commit_oid, :string, 17
      optional :network_id, :int32, 18
      optional :license_name, :string, 19
      optional :is_fork, :bool, 20
      map :experiments, :string, :string, 21
      optional :repo_seq_no, :int64, 22
    end
    add_message "blackbirdmw.admin.v1.SnapshotEntry" do
      optional :entry_id, :uint64, 1
      optional :parent_entry_id, :uint64, 2
      optional :base_oid, :string, 3
      optional :head_oid, :string, 4
      optional :crawl_started_at, :message, 5, "google.protobuf.Timestamp"
      optional :crawl_finished_at, :message, 6, "google.protobuf.Timestamp"
      optional :serving_ts, :message, 7, "google.protobuf.Timestamp"
      optional :serving_offset, :int64, 8
      optional :entry_state, :string, 9
      map :experiments, :string, :string, 10
      optional :repo_id, :uint32, 11
      optional :owner_id, :uint32, 12
      optional :network_id, :uint32, 13
      optional :nwo, :string, 14
      optional :is_repo_public, :bool, 15
      optional :is_repo_archived, :bool, 16
      optional :repo_score, :float, 17
      optional :ref_name, :string, 18
      optional :permanent_error, :string, 19
    end
    add_message "blackbirdmw.admin.v1.IndexRepoRequest" do
      optional :repo_nwo, :string, 1
      optional :force_reindex, :bool, 3
      optional :corpus, :string, 4
      optional :repo_id, :uint32, 5
    end
    add_message "blackbirdmw.admin.v1.IndexRepoResponse" do
      optional :repository_id, :uint32, 1
    end
    add_message "blackbirdmw.admin.v1.IndexRepoListRequest" do
      repeated :repo_ids, :uint32, 1
      optional :corpus, :string, 2
    end
    add_message "blackbirdmw.admin.v1.IndexRepoListResponse" do
      optional :repos_queued, :uint32, 1
    end
    add_message "blackbirdmw.admin.v1.ProbeRepoRequest" do
      optional :corpus, :string, 1
      optional :repo_nwo, :string, 2
      optional :path, :string, 3
    end
    add_message "blackbirdmw.admin.v1.ProbeRepoResponse" do
      optional :verified, :uint32, 1
      repeated :missing, :string, 2
      repeated :extra, :string, 3
      optional :num_trailing_zeros, :uint32, 4
    end
    add_message "blackbirdmw.admin.v1.BackfillCorpusRequest" do
      optional :corpus, :string, 1
      optional :reason, :string, 2
      optional :bootstrap, :bool, 14
      optional :limit, :uint32, 5
      optional :epoch_id, :uint32, 9
      optional :epoch_mode, :enum, 17, "hydro.schemas.blackbird.v0.entities.EpochMode"
      optional :num_masks, :uint32, 15
      optional :query, :string, 16
    end
    add_message "blackbirdmw.admin.v1.BackfillCorpusResponse" do
      optional :epoch_id, :uint32, 1
      optional :num_repositories, :uint32, 2
    end
    add_message "blackbirdmw.admin.v1.BeginBackfillCorpusRequest" do
      optional :corpus, :string, 1
      optional :reason, :string, 2
      optional :epoch_id, :uint32, 3
      optional :skip_mst, :bool, 4
      optional :bootstrap, :bool, 5
      optional :epoch_mode, :enum, 6, "hydro.schemas.blackbird.v0.entities.EpochMode"
    end
    add_message "blackbirdmw.admin.v1.BeginBackfillCorpusResponse" do
    end
    add_message "blackbirdmw.admin.v1.IncrementalCompactionOptions" do
      optional :radix, :uint32, 1
      optional :min_subtree_byte_size, :uint32, 2
    end
    add_message "blackbirdmw.admin.v1.CompactCorpusRequest" do
      optional :corpus, :string, 1
      optional :compaction_type, :enum, 2, "blackbirdmw.admin.v1.CompactionType"
      optional :incremental_options, :message, 3, "blackbirdmw.admin.v1.IncrementalCompactionOptions"
    end
    add_message "blackbirdmw.admin.v1.CompactCorpusResponse" do
      optional :epoch_id, :uint32, 1
      optional :serving_offset, :uint64, 2
    end
    add_message "blackbirdmw.admin.v1.PinCorpusRequest" do
      optional :corpus, :string, 1
      optional :serving_ts, :int64, 2
    end
    add_message "blackbirdmw.admin.v1.PinCorpusResponse" do
    end
    add_message "blackbirdmw.admin.v1.UnpinCorpusRequest" do
      optional :corpus, :string, 1
    end
    add_message "blackbirdmw.admin.v1.UnpinCorpusResponse" do
    end
    add_message "blackbirdmw.admin.v1.CorpusStatus" do
      optional :corpus_name, :string, 1
      optional :corpus_id, :uint32, 2
      optional :status, :string, 3
      optional :staleness_seconds, :uint64, 4
      optional :corruption, :float, 5
      optional :serving, :bool, 8
      optional :indexing, :bool, 9
      optional :epoch_id, :uint32, 10
      optional :shard_error, :string, 12
      optional :ingest_mode, :string, 13
      optional :filter_blobs, :bool, 14
      optional :cluster_name, :string, 15
      optional :pinned_serving_ts, :message, 16, "google.protobuf.Int64Value"
      optional :cache_cluster, :string, 17
      optional :health_score, :float, 18
      optional :epoch_description, :string, 19
      optional :max_repos_indexed, :uint64, 20
      optional :healing, :bool, 21
      optional :shadow_traffic_percent, :float, 22
      optional :active_epoch, :bool, 23
      optional :epoch_mode, :enum, 24, "hydro.schemas.blackbird.v0.entities.EpochMode"
      optional :binary_version, :string, 25
      optional :index_version, :uint32, 26
      optional :serving_ts, :int64, 27
      optional :serving_offset, :int64, 28
      repeated :hosts, :message, 29, "blackbirdmw.admin.v1.HostStatus"
    end
    add_message "blackbirdmw.admin.v1.HostStatus" do
      optional :hostname, :string, 1
      optional :epoch_id, :uint32, 2
      optional :binary_version, :string, 3
      optional :index_version, :uint32, 4
      repeated :shards, :message, 5, "blackbirdmw.admin.v1.ShardStatus"
    end
    add_message "blackbirdmw.admin.v1.ShardStatus" do
      optional :shard_id, :uint32, 1
      optional :serving_ts, :int64, 2
      optional :serving_offset, :int64, 3
    end
    add_message "blackbirdmw.admin.v1.ListStampsRequest" do
    end
    add_message "blackbirdmw.admin.v1.ListStampsResponse" do
      repeated :stamps, :string, 1
    end
    add_message "blackbirdmw.admin.v1.GetCorpusStatusRequest" do
    end
    add_message "blackbirdmw.admin.v1.GetCorpusStatusResponse" do
      optional :deploy_env, :string, 1
      repeated :statuses, :message, 2, "blackbirdmw.admin.v1.CorpusStatus"
    end
    add_message "blackbirdmw.admin.v1.SetCorpusQueryStateRequest" do
      optional :corpus, :string, 1
      optional :serving, :bool, 2
      optional :force, :bool, 3
    end
    add_message "blackbirdmw.admin.v1.SetCorpusQueryStateResponse" do
    end
    add_message "blackbirdmw.admin.v1.SetServingCorpusRequest" do
      optional :corpus, :string, 1
    end
    add_message "blackbirdmw.admin.v1.SetServingCorpusResponse" do
    end
    add_message "blackbirdmw.admin.v1.SetCorpusIndexingStateRequest" do
      optional :corpus, :string, 1
      optional :indexing, :bool, 2
    end
    add_message "blackbirdmw.admin.v1.SetCorpusIndexingStateResponse" do
    end
    add_message "blackbirdmw.admin.v1.SetCorpusHealingStateRequest" do
      optional :corpus, :string, 1
      optional :healing, :bool, 2
    end
    add_message "blackbirdmw.admin.v1.SetCorpusHealingStateResponse" do
    end
    add_message "blackbirdmw.admin.v1.SetCorpusShadowTrafficRequest" do
      optional :corpus, :string, 1
      optional :percent, :float, 2
    end
    add_message "blackbirdmw.admin.v1.SetCorpusShadowTrafficResponse" do
    end
    add_message "blackbirdmw.admin.v1.SetCorpusFilterBlobsRequest" do
      optional :corpus, :string, 1
      optional :filter_blobs, :bool, 2
    end
    add_message "blackbirdmw.admin.v1.SetCorpusFilterBlobsResponse" do
    end
    add_message "blackbirdmw.admin.v1.SetCorpusCacheClusterRequest" do
      optional :corpus, :string, 1
      optional :cache_cluster, :string, 2
    end
    add_message "blackbirdmw.admin.v1.SetCorpusCacheClusterResponse" do
    end
    add_message "blackbirdmw.admin.v1.SetEpochDescriptionRequest" do
      optional :epoch_id, :uint32, 1
      optional :description, :string, 2
    end
    add_message "blackbirdmw.admin.v1.SetEpochDescriptionResponse" do
    end
    add_message "blackbirdmw.admin.v1.GetSimilarReposRequest" do
      optional :repo_nwo, :string, 1
      optional :corpus, :string, 2
      optional :epoch_id, :uint32, 3
      optional :num_snapshots, :uint32, 4
      optional :entries_per_snapshot, :uint32, 5
    end
    add_message "blackbirdmw.admin.v1.GetSimilarReposResponse" do
      repeated :similar_repos, :message, 1, "blackbirdmw.admin.v1.SimilarRepo"
    end
    add_message "blackbirdmw.admin.v1.SimilarRepo" do
      optional :repo_nwo, :string, 1
      optional :is_public, :bool, 2
      optional :repo_id, :uint32, 3
      optional :is_archived, :bool, 4
      optional :repo_score, :float, 5
    end
    add_message "blackbirdmw.admin.v1.GetRateLimitQuotaRequest" do
      optional :login, :string, 1
    end
    add_message "blackbirdmw.admin.v1.GetRateLimitQuotaResponse" do
      repeated :quotas, :message, 1, "blackbirdmw.admin.v1.Quota"
    end
    add_message "blackbirdmw.admin.v1.Quota" do
      optional :type, :string, 1
      optional :short_term_rate, :double, 2
      optional :long_term_rate, :double, 3
      optional :banned_seconds, :double, 4
    end
    add_message "blackbirdmw.admin.v1.ResetRateLimitQuotaRequest" do
      optional :login, :string, 1
    end
    add_message "blackbirdmw.admin.v1.ResetRateLimitQuotaResponse" do
    end
    add_message "blackbirdmw.admin.v1.ComputeMstRequest" do
      optional :limit, :uint32, 5
      optional :epoch_id, :uint32, 9
      optional :num_masks, :uint32, 10
      optional :query, :string, 8
    end
    add_message "blackbirdmw.admin.v1.ComputeMstResponse" do
      optional :total_time, :message, 1, "google.protobuf.Duration"
      optional :query_time, :message, 2, "google.protobuf.Duration"
      optional :mst_time, :message, 3, "google.protobuf.Duration"
      optional :traverse_time, :message, 4, "google.protobuf.Duration"
      optional :num_repos, :uint32, 5
      optional :max_depth, :uint32, 6
      optional :flat_cost, :uint64, 7
      optional :mst_cost, :uint64, 8
      optional :host, :string, 9
      optional :max_encoding_size, :uint32, 10
      optional :max_subtree_size, :uint32, 11
      optional :root_children, :uint32, 12
    end
    add_message "blackbirdmw.admin.v1.ShardAssignmentsRequest" do
      optional :corpus, :string, 1
      optional :offset, :message, 2, "google.protobuf.Int64Value"
    end
    add_message "blackbirdmw.admin.v1.ShardAssignmentsResponse" do
      repeated :host_assignments, :message, 1, "blackbirdmw.admin.v1.HostAssignment"
      optional :algorithm_version, :uint32, 2
      optional :epoch_id, :uint32, 3
      optional :cluster, :string, 4
      optional :index_version, :uint32, 5
      optional :offset, :int64, 6
      optional :snapshot_time, :message, 7, "google.protobuf.Timestamp"
    end
    add_message "blackbirdmw.admin.v1.HostAssignment" do
      optional :hostname, :string, 1
      repeated :assigned_shards, :message, 2, "blackbirdmw.admin.v1.AssignedShards"
    end
    add_message "blackbirdmw.admin.v1.AssignedShards" do
      optional :shard_id, :uint32, 1
      optional :state, :string, 2
    end
    add_message "blackbirdmw.admin.v1.ClusterHostsRequest" do
      optional :corpus, :string, 1
    end
    add_message "blackbirdmw.admin.v1.ClusterHostsResponse" do
      repeated :hosts, :string, 1
    end
    add_message "blackbirdmw.admin.v1.ChangeEpochRequest" do
      optional :epoch_id, :uint32, 1
      optional :cluster, :string, 2
    end
    add_message "blackbirdmw.admin.v1.ChangeEpochResponse" do
    end
    add_message "blackbirdmw.admin.v1.BranchEpochRequest" do
      optional :source_epoch, :uint32, 1
      optional :source_corpus, :string, 2
      optional :corpus, :string, 3
      optional :branch_ts, :int64, 4
      optional :reason, :string, 5
      optional :epoch_mode, :enum, 6, "hydro.schemas.blackbird.v0.entities.EpochMode"
    end
    add_message "blackbirdmw.admin.v1.BranchEpochResponse" do
      optional :epoch_id, :uint32, 1
    end
    add_enum "blackbirdmw.admin.v1.CompactionType" do
      value :COMPACTION_TYPE_INVALID, 0
      value :COMPACTION_TYPE_INCREMENTAL, 1
      value :COMPACTION_TYPE_FULL, 2
    end
  end
end

module Blackbird
  module Admin
    module V1
      GetRepoStatusRequest = ::Google::Protobuf::DescriptorPool.generated_pool.lookup("blackbirdmw.admin.v1.GetRepoStatusRequest").msgclass
      GetRepoStatusResponse = ::Google::Protobuf::DescriptorPool.generated_pool.lookup("blackbirdmw.admin.v1.GetRepoStatusResponse").msgclass
      RepoIngest = ::Google::Protobuf::DescriptorPool.generated_pool.lookup("blackbirdmw.admin.v1.RepoIngest").msgclass
      GitHubRepositoryAPIResponse = ::Google::Protobuf::DescriptorPool.generated_pool.lookup("blackbirdmw.admin.v1.GitHubRepositoryAPIResponse").msgclass
      GitHubRepositoryDetails = ::Google::Protobuf::DescriptorPool.generated_pool.lookup("blackbirdmw.admin.v1.GitHubRepositoryDetails").msgclass
      DatabaseRepository = ::Google::Protobuf::DescriptorPool.generated_pool.lookup("blackbirdmw.admin.v1.DatabaseRepository").msgclass
      SnapshotEntry = ::Google::Protobuf::DescriptorPool.generated_pool.lookup("blackbirdmw.admin.v1.SnapshotEntry").msgclass
      IndexRepoRequest = ::Google::Protobuf::DescriptorPool.generated_pool.lookup("blackbirdmw.admin.v1.IndexRepoRequest").msgclass
      IndexRepoResponse = ::Google::Protobuf::DescriptorPool.generated_pool.lookup("blackbirdmw.admin.v1.IndexRepoResponse").msgclass
      IndexRepoListRequest = ::Google::Protobuf::DescriptorPool.generated_pool.lookup("blackbirdmw.admin.v1.IndexRepoListRequest").msgclass
      IndexRepoListResponse = ::Google::Protobuf::DescriptorPool.generated_pool.lookup("blackbirdmw.admin.v1.IndexRepoListResponse").msgclass
      ProbeRepoRequest = ::Google::Protobuf::DescriptorPool.generated_pool.lookup("blackbirdmw.admin.v1.ProbeRepoRequest").msgclass
      ProbeRepoResponse = ::Google::Protobuf::DescriptorPool.generated_pool.lookup("blackbirdmw.admin.v1.ProbeRepoResponse").msgclass
      BackfillCorpusRequest = ::Google::Protobuf::DescriptorPool.generated_pool.lookup("blackbirdmw.admin.v1.BackfillCorpusRequest").msgclass
      BackfillCorpusResponse = ::Google::Protobuf::DescriptorPool.generated_pool.lookup("blackbirdmw.admin.v1.BackfillCorpusResponse").msgclass
      BeginBackfillCorpusRequest = ::Google::Protobuf::DescriptorPool.generated_pool.lookup("blackbirdmw.admin.v1.BeginBackfillCorpusRequest").msgclass
      BeginBackfillCorpusResponse = ::Google::Protobuf::DescriptorPool.generated_pool.lookup("blackbirdmw.admin.v1.BeginBackfillCorpusResponse").msgclass
      IncrementalCompactionOptions = ::Google::Protobuf::DescriptorPool.generated_pool.lookup("blackbirdmw.admin.v1.IncrementalCompactionOptions").msgclass
      CompactCorpusRequest = ::Google::Protobuf::DescriptorPool.generated_pool.lookup("blackbirdmw.admin.v1.CompactCorpusRequest").msgclass
      CompactCorpusResponse = ::Google::Protobuf::DescriptorPool.generated_pool.lookup("blackbirdmw.admin.v1.CompactCorpusResponse").msgclass
      PinCorpusRequest = ::Google::Protobuf::DescriptorPool.generated_pool.lookup("blackbirdmw.admin.v1.PinCorpusRequest").msgclass
      PinCorpusResponse = ::Google::Protobuf::DescriptorPool.generated_pool.lookup("blackbirdmw.admin.v1.PinCorpusResponse").msgclass
      UnpinCorpusRequest = ::Google::Protobuf::DescriptorPool.generated_pool.lookup("blackbirdmw.admin.v1.UnpinCorpusRequest").msgclass
      UnpinCorpusResponse = ::Google::Protobuf::DescriptorPool.generated_pool.lookup("blackbirdmw.admin.v1.UnpinCorpusResponse").msgclass
      CorpusStatus = ::Google::Protobuf::DescriptorPool.generated_pool.lookup("blackbirdmw.admin.v1.CorpusStatus").msgclass
      HostStatus = ::Google::Protobuf::DescriptorPool.generated_pool.lookup("blackbirdmw.admin.v1.HostStatus").msgclass
      ShardStatus = ::Google::Protobuf::DescriptorPool.generated_pool.lookup("blackbirdmw.admin.v1.ShardStatus").msgclass
      ListStampsRequest = ::Google::Protobuf::DescriptorPool.generated_pool.lookup("blackbirdmw.admin.v1.ListStampsRequest").msgclass
      ListStampsResponse = ::Google::Protobuf::DescriptorPool.generated_pool.lookup("blackbirdmw.admin.v1.ListStampsResponse").msgclass
      GetCorpusStatusRequest = ::Google::Protobuf::DescriptorPool.generated_pool.lookup("blackbirdmw.admin.v1.GetCorpusStatusRequest").msgclass
      GetCorpusStatusResponse = ::Google::Protobuf::DescriptorPool.generated_pool.lookup("blackbirdmw.admin.v1.GetCorpusStatusResponse").msgclass
      SetCorpusQueryStateRequest = ::Google::Protobuf::DescriptorPool.generated_pool.lookup("blackbirdmw.admin.v1.SetCorpusQueryStateRequest").msgclass
      SetCorpusQueryStateResponse = ::Google::Protobuf::DescriptorPool.generated_pool.lookup("blackbirdmw.admin.v1.SetCorpusQueryStateResponse").msgclass
      SetServingCorpusRequest = ::Google::Protobuf::DescriptorPool.generated_pool.lookup("blackbirdmw.admin.v1.SetServingCorpusRequest").msgclass
      SetServingCorpusResponse = ::Google::Protobuf::DescriptorPool.generated_pool.lookup("blackbirdmw.admin.v1.SetServingCorpusResponse").msgclass
      SetCorpusIndexingStateRequest = ::Google::Protobuf::DescriptorPool.generated_pool.lookup("blackbirdmw.admin.v1.SetCorpusIndexingStateRequest").msgclass
      SetCorpusIndexingStateResponse = ::Google::Protobuf::DescriptorPool.generated_pool.lookup("blackbirdmw.admin.v1.SetCorpusIndexingStateResponse").msgclass
      SetCorpusHealingStateRequest = ::Google::Protobuf::DescriptorPool.generated_pool.lookup("blackbirdmw.admin.v1.SetCorpusHealingStateRequest").msgclass
      SetCorpusHealingStateResponse = ::Google::Protobuf::DescriptorPool.generated_pool.lookup("blackbirdmw.admin.v1.SetCorpusHealingStateResponse").msgclass
      SetCorpusShadowTrafficRequest = ::Google::Protobuf::DescriptorPool.generated_pool.lookup("blackbirdmw.admin.v1.SetCorpusShadowTrafficRequest").msgclass
      SetCorpusShadowTrafficResponse = ::Google::Protobuf::DescriptorPool.generated_pool.lookup("blackbirdmw.admin.v1.SetCorpusShadowTrafficResponse").msgclass
      SetCorpusFilterBlobsRequest = ::Google::Protobuf::DescriptorPool.generated_pool.lookup("blackbirdmw.admin.v1.SetCorpusFilterBlobsRequest").msgclass
      SetCorpusFilterBlobsResponse = ::Google::Protobuf::DescriptorPool.generated_pool.lookup("blackbirdmw.admin.v1.SetCorpusFilterBlobsResponse").msgclass
      SetCorpusCacheClusterRequest = ::Google::Protobuf::DescriptorPool.generated_pool.lookup("blackbirdmw.admin.v1.SetCorpusCacheClusterRequest").msgclass
      SetCorpusCacheClusterResponse = ::Google::Protobuf::DescriptorPool.generated_pool.lookup("blackbirdmw.admin.v1.SetCorpusCacheClusterResponse").msgclass
      SetEpochDescriptionRequest = ::Google::Protobuf::DescriptorPool.generated_pool.lookup("blackbirdmw.admin.v1.SetEpochDescriptionRequest").msgclass
      SetEpochDescriptionResponse = ::Google::Protobuf::DescriptorPool.generated_pool.lookup("blackbirdmw.admin.v1.SetEpochDescriptionResponse").msgclass
      GetSimilarReposRequest = ::Google::Protobuf::DescriptorPool.generated_pool.lookup("blackbirdmw.admin.v1.GetSimilarReposRequest").msgclass
      GetSimilarReposResponse = ::Google::Protobuf::DescriptorPool.generated_pool.lookup("blackbirdmw.admin.v1.GetSimilarReposResponse").msgclass
      SimilarRepo = ::Google::Protobuf::DescriptorPool.generated_pool.lookup("blackbirdmw.admin.v1.SimilarRepo").msgclass
      GetRateLimitQuotaRequest = ::Google::Protobuf::DescriptorPool.generated_pool.lookup("blackbirdmw.admin.v1.GetRateLimitQuotaRequest").msgclass
      GetRateLimitQuotaResponse = ::Google::Protobuf::DescriptorPool.generated_pool.lookup("blackbirdmw.admin.v1.GetRateLimitQuotaResponse").msgclass
      Quota = ::Google::Protobuf::DescriptorPool.generated_pool.lookup("blackbirdmw.admin.v1.Quota").msgclass
      ResetRateLimitQuotaRequest = ::Google::Protobuf::DescriptorPool.generated_pool.lookup("blackbirdmw.admin.v1.ResetRateLimitQuotaRequest").msgclass
      ResetRateLimitQuotaResponse = ::Google::Protobuf::DescriptorPool.generated_pool.lookup("blackbirdmw.admin.v1.ResetRateLimitQuotaResponse").msgclass
      ComputeMstRequest = ::Google::Protobuf::DescriptorPool.generated_pool.lookup("blackbirdmw.admin.v1.ComputeMstRequest").msgclass
      ComputeMstResponse = ::Google::Protobuf::DescriptorPool.generated_pool.lookup("blackbirdmw.admin.v1.ComputeMstResponse").msgclass
      ShardAssignmentsRequest = ::Google::Protobuf::DescriptorPool.generated_pool.lookup("blackbirdmw.admin.v1.ShardAssignmentsRequest").msgclass
      ShardAssignmentsResponse = ::Google::Protobuf::DescriptorPool.generated_pool.lookup("blackbirdmw.admin.v1.ShardAssignmentsResponse").msgclass
      HostAssignment = ::Google::Protobuf::DescriptorPool.generated_pool.lookup("blackbirdmw.admin.v1.HostAssignment").msgclass
      AssignedShards = ::Google::Protobuf::DescriptorPool.generated_pool.lookup("blackbirdmw.admin.v1.AssignedShards").msgclass
      ClusterHostsRequest = ::Google::Protobuf::DescriptorPool.generated_pool.lookup("blackbirdmw.admin.v1.ClusterHostsRequest").msgclass
      ClusterHostsResponse = ::Google::Protobuf::DescriptorPool.generated_pool.lookup("blackbirdmw.admin.v1.ClusterHostsResponse").msgclass
      ChangeEpochRequest = ::Google::Protobuf::DescriptorPool.generated_pool.lookup("blackbirdmw.admin.v1.ChangeEpochRequest").msgclass
      ChangeEpochResponse = ::Google::Protobuf::DescriptorPool.generated_pool.lookup("blackbirdmw.admin.v1.ChangeEpochResponse").msgclass
      BranchEpochRequest = ::Google::Protobuf::DescriptorPool.generated_pool.lookup("blackbirdmw.admin.v1.BranchEpochRequest").msgclass
      BranchEpochResponse = ::Google::Protobuf::DescriptorPool.generated_pool.lookup("blackbirdmw.admin.v1.BranchEpochResponse").msgclass
      CompactionType = ::Google::Protobuf::DescriptorPool.generated_pool.lookup("blackbirdmw.admin.v1.CompactionType").enummodule
    end
  end
end
