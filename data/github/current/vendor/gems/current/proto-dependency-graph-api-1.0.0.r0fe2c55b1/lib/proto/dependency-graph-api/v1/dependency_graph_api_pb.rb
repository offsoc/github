# Generated by the protocol buffer compiler.  DO NOT EDIT!
# source: dependency_graph_api.proto

require "google/protobuf"

require "google/protobuf/timestamp_pb"

Google::Protobuf::DescriptorPool.generated_pool.build do
  add_file("dependency_graph_api.proto", syntax: :proto3) do
    add_message "DependencyGraphAPI.v1.PingRequest" do
    end
    add_message "DependencyGraphAPI.v1.PingResponse" do
      optional :response, :string, 1
    end
    add_message "DependencyGraphAPI.v1.BoomRequest" do
      optional :issue400, :bool, 1
      optional :sleep_seconds, :uint32, 2
    end
    add_message "DependencyGraphAPI.v1.BoomResponse" do
      optional :response, :string, 1
    end
    add_message "DependencyGraphAPI.v1.GetDirectDependenciesRequest" do
      optional :repository_id, :uint64, 1
      repeated :package_managers, :enum, 2, "DependencyGraphAPI.v1.PackageManager"
    end
    add_message "DependencyGraphAPI.v1.GetDirectDependenciesResponse" do
      repeated :repository_ids, :uint64, 1
    end
    add_message "DependencyGraphAPI.v1.ChangedFile" do
      optional :path, :string, 1
      optional :blob_id, :string, 2
    end
    add_message "DependencyGraphAPI.v1.LimitToFiles" do
      repeated :base, :message, 1, "DependencyGraphAPI.v1.ChangedFile"
      repeated :target, :message, 2, "DependencyGraphAPI.v1.ChangedFile"
    end
    add_message "DependencyGraphAPI.v1.RequestPageMetadata" do
      optional :page, :uint32, 1
      optional :per_page, :uint32, 2
    end
    add_message "DependencyGraphAPI.v1.GetSnapshotsDiffRequest" do
      optional :repository_id, :uint64, 1
      optional :base_sha, :string, 2
      optional :target_sha, :string, 3
      optional :limit_to_files, :message, 7, "DependencyGraphAPI.v1.LimitToFiles"
      optional :decompose_updates, :bool, 8
      optional :page_metadata, :message, 9, "DependencyGraphAPI.v1.RequestPageMetadata"
      optional :include_dependency_snapshots, :bool, 10
    end
    add_message "DependencyGraphAPI.v1.ExcludeDependencySnapshotsRequest" do
      optional :repository_id, :uint64, 1
      repeated :snapshot_ids, :uint64, 2
    end
    add_message "DependencyGraphAPI.v1.ExcludeDependencySnapshotsResponse" do
      repeated :excluded_snapshot_ids, :uint64, 1
    end
    add_message "DependencyGraphAPI.v1.GetIncludedDependencySnapshotsRequest" do
      optional :repository_id, :uint64, 1
    end
    add_message "DependencyGraphAPI.v1.GetIncludedDependencySnapshotsResponse" do
      repeated :included_snapshots, :message, 1, "DependencyGraphAPI.v1.GetIncludedDependencySnapshotsResponse.IncludedSnapshot"
    end
    add_message "DependencyGraphAPI.v1.GetIncludedDependencySnapshotsResponse.IncludedSnapshot" do
      optional :snapshot_id, :uint64, 1
      optional :correlator, :string, 2
      optional :detector, :string, 3
    end
    add_message "DependencyGraphAPI.v1.NullableBool" do
      optional :value, :bool, 1
    end
    add_message "DependencyGraphAPI.v1.Manifest" do
      optional :package_manager, :enum, 1, "DependencyGraphAPI.v1.PackageManager"
      optional :file_path, :string, 2
      repeated :dependencies, :message, 3, "DependencyGraphAPI.v1.Manifest.Dependency"
      optional :is_vendored, :message, 4, "DependencyGraphAPI.v1.NullableBool"
      optional :type, :string, 5
      optional :original_file_path, :string, 6
      optional :source, :string, 7
      optional :name, :string, 8
      optional :snapshot_id, :uint64, 9
    end
    add_message "DependencyGraphAPI.v1.Manifest.Dependency" do
      optional :name, :string, 1
      optional :exact_version, :string, 2
      optional :has_loaded_vulnerable_version_ranges, :bool, 3
      repeated :vulnerable_version_ranges, :message, 4, "DependencyGraphAPI.v1.Manifest.Dependency.VulnerableVersionRange"
      optional :requirements, :string, 5
      optional :package_manager, :enum, 6, "DependencyGraphAPI.v1.PackageManager"
      optional :scope, :string, 7
    end
    add_message "DependencyGraphAPI.v1.Manifest.Dependency.VulnerableVersionRange" do
      optional :is_contained, :bool, 1
      optional :github_id, :uint64, 2
    end
    add_message "DependencyGraphAPI.v1.ResponsePageMetadata" do
      optional :page, :uint32, 1
      optional :per_page, :uint32, 2
      optional :first, :uint32, 3
      optional :last, :uint32, 4
    end
    add_message "DependencyGraphAPI.v1.GetSnapshotsDiffResponse" do
      optional :repository_id, :uint64, 1
      optional :base_sha, :string, 2
      optional :target_sha, :string, 3
      repeated :changed_manifests, :message, 4, "DependencyGraphAPI.v1.GetSnapshotsDiffResponse.ManifestDiff"
      optional :base_sha_created_at, :message, 6, "google.protobuf.Timestamp"
      optional :target_sha_created_at, :message, 7, "google.protobuf.Timestamp"
      optional :page_metadata, :message, 14, "DependencyGraphAPI.v1.ResponsePageMetadata"
      repeated :snapshot_warnings, :string, 15
    end
    add_message "DependencyGraphAPI.v1.GetSnapshotsDiffResponse.ManifestDiff" do
      optional :type, :enum, 1, "DependencyGraphAPI.v1.PackageManager"
      optional :file_path, :string, 2
      repeated :dependencies, :message, 3, "DependencyGraphAPI.v1.GetSnapshotsDiffResponse.ManifestDiff.DependencyDiff"
    end
    add_message "DependencyGraphAPI.v1.GetSnapshotsDiffResponse.ManifestDiff.DependencyDiff" do
      optional :name, :string, 1
      optional :target_version, :string, 2
      optional :change_type, :enum, 3, "DependencyGraphAPI.v1.GetSnapshotsDiffResponse.ManifestDiff.DependencyDiff.DependencyChangeType"
      optional :base_version, :string, 4
      repeated :github_vulnerability_range_ids, :uint64, 5
      optional :license, :string, 6
      optional :repo_nwo, :string, 7
      optional :github_repository_id, :uint64, 8
      optional :published_at, :message, 9, "google.protobuf.Timestamp"
      optional :dependent_count, :uint64, 10
      optional :unpublished_at, :message, 11, "google.protobuf.Timestamp"
      optional :base_purl, :string, 12
      optional :target_purl, :string, 13
      optional :scope, :enum, 14, "DependencyGraphAPI.v1.Scope"
    end
    add_enum "DependencyGraphAPI.v1.GetSnapshotsDiffResponse.ManifestDiff.DependencyDiff.DependencyChangeType" do
      value :DEPENDENCY_CHANGE_TYPE_UNKNOWN, 0
      value :DEPENDENCY_CHANGE_TYPE_ADDED, 1
      value :DEPENDENCY_CHANGE_TYPE_REMOVED, 2
      value :DEPENDENCY_CHANGE_TYPE_UPDATED, 3
    end
    add_message "DependencyGraphAPI.v1.DependencySnapshotDependency" do
      optional :scope, :uint64, 1
      optional :explicit, :bool, 2
      repeated :dependencies, :string, 3
    end
    add_message "DependencyGraphAPI.v1.DependencySnapshotManifest" do
      map :graph, :string, :message, 1, "DependencyGraphAPI.v1.DependencySnapshotDependency"
    end
    add_message "DependencyGraphAPI.v1.DependencySnapshotRepositoryMetadata" do
      optional :nwo, :string, 1
      optional :public, :bool, 2
      optional :owner_id, :uint64, 3
    end
    add_message "DependencyGraphAPI.v1.CreateDependencySnapshotRequest" do
      optional :repository_id, :uint64, 1
      optional :repository_metadata, :message, 3, "DependencyGraphAPI.v1.DependencySnapshotRepositoryMetadata"
      optional :payload, :bytes, 7
      optional :owner_id, :uint64, 8
    end
    add_message "DependencyGraphAPI.v1.CreateDependencySnapshotResponse" do
      optional :snapshot_id, :uint64, 1
      optional :created_at, :message, 2, "google.protobuf.Timestamp"
      optional :result, :enum, 3, "DependencyGraphAPI.v1.CreateDependencySnapshotResponse.Result"
      optional :message, :string, 4
    end
    add_enum "DependencyGraphAPI.v1.CreateDependencySnapshotResponse.Result" do
      value :INVALID, 0
      value :ACCEPTED, 1
      value :SUCCESS, 2
      value :REMOVED, 3
    end
    add_message "DependencyGraphAPI.v1.DependencySnapshotDependencyMetadata" do
      optional :license, :string, 1
      repeated :github_vulnerability_range_ids, :uint64, 2
      optional :repo_nwo, :string, 3
      optional :github_repository_id, :uint64, 4
      optional :published_at, :message, 5, "google.protobuf.Timestamp"
    end
    add_message "DependencyGraphAPI.v1.GetDependencySnapshotRequest" do
      optional :repository_id, :uint64, 1
      optional :snapshot_id, :uint64, 2
    end
    add_message "DependencyGraphAPI.v1.GetDependencySnapshotResponse" do
      optional :snapshot_id, :uint64, 1
      optional :repository_id, :uint64, 2
      optional :payload, :bytes, 9
    end
    add_message "DependencyGraphAPI.v1.GetDependencySnapshotsDiffRequest" do
      optional :base_repository_id, :uint64, 1
      optional :target_repository_id, :uint64, 2
      optional :base_snapshot_id, :uint64, 3
      optional :target_snapshot_id, :uint64, 4
      optional :base_ref, :string, 5
      optional :target_ref, :string, 6
      optional :base_sha, :string, 7
      optional :target_sha, :string, 8
      optional :base_build_type, :string, 9
      optional :target_build_type, :string, 10
      optional :base_build_id, :string, 11
      optional :target_build_id, :string, 12
    end
    add_message "DependencyGraphAPI.v1.GetDependencySnapshotsDiffResponse" do
      optional :base_snapshot, :message, 1, "DependencyGraphAPI.v1.GetDependencySnapshotsDiffResponse.DependencySnapshotMetadata"
      optional :target_snapshot, :message, 2, "DependencyGraphAPI.v1.GetDependencySnapshotsDiffResponse.DependencySnapshotMetadata"
      repeated :changed_manifests, :message, 3, "DependencyGraphAPI.v1.GetDependencySnapshotsDiffResponse.DependencySnapshotManifestDiff"
      map :vulnerable_dependencies, :string, :message, 4, "DependencyGraphAPI.v1.GetDependencySnapshotsDiffResponse.DependencySnapshotVulnerableDependency"
      map :dependency_metadata, :string, :message, 5, "DependencyGraphAPI.v1.GetDependencySnapshotsDiffResponse.DependencySnapshotDependencyDiffMetadata"
    end
    add_message "DependencyGraphAPI.v1.GetDependencySnapshotsDiffResponse.DependencySnapshotManifestDiff" do
      optional :type, :enum, 1, "DependencyGraphAPI.v1.PackageManager"
      optional :file_path, :string, 2
      repeated :dependencies, :message, 3, "DependencyGraphAPI.v1.GetDependencySnapshotsDiffResponse.DependencySnapshotManifestDiff.DependencySnapshotDependencyDiff"
    end
    add_message "DependencyGraphAPI.v1.GetDependencySnapshotsDiffResponse.DependencySnapshotManifestDiff.DependencySnapshotDependency" do
      optional :purl, :string, 1
      optional :scope, :uint64, 2
    end
    add_message "DependencyGraphAPI.v1.GetDependencySnapshotsDiffResponse.DependencySnapshotManifestDiff.DependencySnapshotDependencyDiff" do
      optional :package, :string, 1
      optional :base, :message, 2, "DependencyGraphAPI.v1.GetDependencySnapshotsDiffResponse.DependencySnapshotManifestDiff.DependencySnapshotDependency"
      optional :target, :message, 3, "DependencyGraphAPI.v1.GetDependencySnapshotsDiffResponse.DependencySnapshotManifestDiff.DependencySnapshotDependency"
    end
    add_message "DependencyGraphAPI.v1.GetDependencySnapshotsDiffResponse.DependencySnapshotVulnerableDependency" do
      repeated :github_vulnerability_range_ids, :uint64, 1
    end
    add_message "DependencyGraphAPI.v1.GetDependencySnapshotsDiffResponse.DependencySnapshotDependencyDiffMetadata" do
      optional :license, :string, 1
      optional :repo_nwo, :string, 2
      optional :github_repository_id, :uint64, 3
      optional :published_at, :message, 4, "google.protobuf.Timestamp"
    end
    add_message "DependencyGraphAPI.v1.GetDependencySnapshotsDiffResponse.DependencySnapshotMetadata" do
      optional :repository_id, :uint64, 1
      optional :sha, :string, 2
      optional :snapshot_id, :uint64, 3
      map :metadata, :string, :string, 4
    end
    add_message "DependencyGraphAPI.v1.GetDependenciesForRepositoryRequest" do
      optional :repository_id, :uint64, 1
      optional :include_vulnerabilities, :bool, 2
      optional :enable_preview_ecosystems, :bool, 3
      optional :sha, :string, 4
      optional :max_static_manifests, :uint32, 5
      optional :owner_id, :uint64, 6
      optional :include_internal_snapshots, :bool, 7
    end
    add_message "DependencyGraphAPI.v1.GetDependenciesForRepositoryResponse" do
      repeated :manifests, :message, 1, "DependencyGraphAPI.v1.Manifest"
    end
    add_message "DependencyGraphAPI.v1.HasManifestsRequest" do
      optional :repository_id, :uint64, 1
      optional :only_static_manifests, :bool, 2
    end
    add_message "DependencyGraphAPI.v1.HasManifestsResponse" do
      optional :has_manifests, :bool, 1
    end
    add_message "DependencyGraphAPI.v1.RepositoriesContainingDependencyRequest" do
      optional :base_purl, :string, 1
      optional :version_range, :string, 2
    end
    add_message "DependencyGraphAPI.v1.RepositoriesContainingDependencyResponse" do
      repeated :repository_ids, :uint64, 1
    end
    add_message "DependencyGraphAPI.v1.GetRepositorySBOMRequest" do
      optional :repository_id, :uint64, 1
      optional :sha, :string, 2
      optional :repository_name, :string, 3
      optional :namespace_base, :string, 4
      optional :repository_license, :string, 5
    end
    add_message "DependencyGraphAPI.v1.GetRepositorySBOMResponse" do
      optional :payload, :string, 1
    end
    add_message "DependencyGraphAPI.v1.SearchDependenciesForRepositoryRequest" do
      optional :repository_id, :uint64, 1
      optional :page, :uint32, 3
      optional :per_page, :uint32, 4
      optional :query, :string, 5
      repeated :dependabot_alerts, :message, 6, "DependencyGraphAPI.v1.SearchDependenciesForRepositoryRequest.DependabotAlert"
      optional :preview_enabled, :bool, 7
      optional :manifest_path, :string, 8
      optional :package_manager, :enum, 9, "DependencyGraphAPI.v1.PackageManager"
    end
    add_message "DependencyGraphAPI.v1.SearchDependenciesForRepositoryRequest.DependabotAlert" do
      optional :vulnerable_manifest_path, :string, 1
      optional :vulnerable_version_range_affects, :string, 2
      optional :vulnerable_requirements, :string, 3
      optional :vulnerability_severity, :enum, 4, "DependencyGraphAPI.v1.Severity"
      optional :vulnerable_version_range_id, :uint64, 5
      optional :vulnerable_version_range_requirements, :string, 6
    end
    add_message "DependencyGraphAPI.v1.SearchDependenciesForRepositoryResponse" do
      optional :total_results, :uint32, 2
      repeated :results, :message, 3, "DependencyGraphAPI.v1.SearchDependenciesForRepositoryResponse.Result"
      optional :repository_has_snapshots, :bool, 4
    end
    add_message "DependencyGraphAPI.v1.SearchDependenciesForRepositoryResponse.Result" do
      optional :package_manager, :enum, 1, "DependencyGraphAPI.v1.PackageManager"
      optional :package_name, :string, 2
      optional :requirements, :string, 3
      optional :manifest_path, :string, 4
      optional :scope, :enum, 5, "DependencyGraphAPI.v1.Scope"
      optional :repository_id, :uint64, 6
      optional :license, :string, 7
      optional :scanned_at, :message, 8, "google.protobuf.Timestamp"
      optional :scanned_by, :enum, 9, "DependencyGraphAPI.v1.SearchDependenciesForRepositoryResponse.Scanner"
      optional :snapshot_detector_name, :string, 10
      optional :relationship, :enum, 11, "DependencyGraphAPI.v1.SearchDependenciesForRepositoryResponse.Relationship"
      repeated :vulnerable_version_range_ids, :uint64, 12
    end
    add_enum "DependencyGraphAPI.v1.SearchDependenciesForRepositoryResponse.Scanner" do
      value :DG, 0
      value :DS, 1
      value :DS_INTERNAL, 2
      value :DGP, 3
    end
    add_enum "DependencyGraphAPI.v1.SearchDependenciesForRepositoryResponse.Relationship" do
      value :RELATIONSHIP_UNKNOWN, 0
      value :RELATIONSHIP_DIRECT, 1
      value :RELATIONSHIP_INDIRECT, 2
      value :RELATIONSHIP_INCONCLUSIVE, 3
    end
    add_message "DependencyGraphAPI.v1.GetReleasesForPackageRequest" do
      optional :package_manager, :enum, 1, "DependencyGraphAPI.v1.PackageManager"
      optional :package_name, :string, 2
    end
    add_message "DependencyGraphAPI.v1.GetReleasesForPackageResponse" do
      repeated :package_releases, :message, 1, "DependencyGraphAPI.v1.GetReleasesForPackageResponse.PackageRelease"
    end
    add_message "DependencyGraphAPI.v1.GetReleasesForPackageResponse.PackageRelease" do
      optional :version, :string, 1
    end
    add_message "DependencyGraphAPI.v1.GetPackageVersionsRequest" do
      repeated :package_versions, :message, 1, "DependencyGraphAPI.v1.GetPackageVersionsRequest.PackageVersionSpec"
      optional :include_copyright_attributions, :bool, 2
    end
    add_message "DependencyGraphAPI.v1.GetPackageVersionsRequest.PackageVersionSpec" do
      optional :package_manager, :enum, 1, "DependencyGraphAPI.v1.PackageManager"
      optional :package_name, :string, 2
      optional :package_version, :string, 3
    end
    add_message "DependencyGraphAPI.v1.GetPackageVersionsResponse" do
      repeated :package_versions, :message, 1, "DependencyGraphAPI.v1.GetPackageVersionsResponse.PackageVersion"
    end
    add_message "DependencyGraphAPI.v1.GetPackageVersionsResponse.PackageVersion" do
      optional :package_manager, :enum, 1, "DependencyGraphAPI.v1.PackageManager"
      optional :package_name, :string, 2
      optional :name, :string, 3
      optional :license, :string, 4
      repeated :attributions, :string, 5
      optional :source_url, :string, 6
      optional :published_at, :message, 7, "google.protobuf.Timestamp"
      optional :unpublished_at, :message, 8, "google.protobuf.Timestamp"
    end
    add_message "DependencyGraphAPI.v1.ListPackageVersionsRequest" do
      optional :package_manager, :enum, 1, "DependencyGraphAPI.v1.PackageManager"
      optional :package_name, :string, 2
      optional :include_licenses, :bool, 3
    end
    add_message "DependencyGraphAPI.v1.ListPackageVersionsResponse" do
      repeated :package_versions, :message, 1, "DependencyGraphAPI.v1.ListPackageVersionsResponse.PackageVersion"
    end
    add_message "DependencyGraphAPI.v1.ListPackageVersionsResponse.PackageVersion" do
      optional :package_version, :string, 1
      optional :package_license, :string, 2
    end
    add_enum "DependencyGraphAPI.v1.PackageManager" do
      value :PACKAGE_MANAGER_UNKNOWN, 0
      value :PACKAGE_MANAGER_RUBYGEMS, 1
      value :PACKAGE_MANAGER_NPM, 2
      value :PACKAGE_MANAGER_PIP, 3
      value :PACKAGE_MANAGER_MAVEN, 4
      value :PACKAGE_MANAGER_NUGET, 5
      value :PACKAGE_MANAGER_COMPOSER, 6
      value :PACKAGE_MANAGER_GOMOD, 7
      value :PACKAGE_MANAGER_RUST, 8
      value :PACKAGE_MANAGER_ACTIONS, 9
      value :PACKAGE_MANAGER_PUB, 10
      value :PACKAGE_MANAGER_SWIFT, 11
    end
    add_enum "DependencyGraphAPI.v1.Scope" do
      value :SCOPE_UNKNOWN, 0
      value :SCOPE_RUNTIME, 1
      value :SCOPE_DEVELOPMENT, 2
    end
    add_enum "DependencyGraphAPI.v1.Severity" do
      value :SEVERITY_LOW, 0
      value :SEVERITY_MODERATE, 1
      value :SEVERITY_HIGH, 2
      value :SEVERITY_CRITICAL, 3
    end
  end
end

module DependencyGraphAPI
  module V1
    PingRequest = ::Google::Protobuf::DescriptorPool.generated_pool.lookup("DependencyGraphAPI.v1.PingRequest").msgclass
    PingResponse = ::Google::Protobuf::DescriptorPool.generated_pool.lookup("DependencyGraphAPI.v1.PingResponse").msgclass
    BoomRequest = ::Google::Protobuf::DescriptorPool.generated_pool.lookup("DependencyGraphAPI.v1.BoomRequest").msgclass
    BoomResponse = ::Google::Protobuf::DescriptorPool.generated_pool.lookup("DependencyGraphAPI.v1.BoomResponse").msgclass
    GetDirectDependenciesRequest = ::Google::Protobuf::DescriptorPool.generated_pool.lookup("DependencyGraphAPI.v1.GetDirectDependenciesRequest").msgclass
    GetDirectDependenciesResponse = ::Google::Protobuf::DescriptorPool.generated_pool.lookup("DependencyGraphAPI.v1.GetDirectDependenciesResponse").msgclass
    ChangedFile = ::Google::Protobuf::DescriptorPool.generated_pool.lookup("DependencyGraphAPI.v1.ChangedFile").msgclass
    LimitToFiles = ::Google::Protobuf::DescriptorPool.generated_pool.lookup("DependencyGraphAPI.v1.LimitToFiles").msgclass
    RequestPageMetadata = ::Google::Protobuf::DescriptorPool.generated_pool.lookup("DependencyGraphAPI.v1.RequestPageMetadata").msgclass
    GetSnapshotsDiffRequest = ::Google::Protobuf::DescriptorPool.generated_pool.lookup("DependencyGraphAPI.v1.GetSnapshotsDiffRequest").msgclass
    ExcludeDependencySnapshotsRequest = ::Google::Protobuf::DescriptorPool.generated_pool.lookup("DependencyGraphAPI.v1.ExcludeDependencySnapshotsRequest").msgclass
    ExcludeDependencySnapshotsResponse = ::Google::Protobuf::DescriptorPool.generated_pool.lookup("DependencyGraphAPI.v1.ExcludeDependencySnapshotsResponse").msgclass
    GetIncludedDependencySnapshotsRequest = ::Google::Protobuf::DescriptorPool.generated_pool.lookup("DependencyGraphAPI.v1.GetIncludedDependencySnapshotsRequest").msgclass
    GetIncludedDependencySnapshotsResponse = ::Google::Protobuf::DescriptorPool.generated_pool.lookup("DependencyGraphAPI.v1.GetIncludedDependencySnapshotsResponse").msgclass
    GetIncludedDependencySnapshotsResponse::IncludedSnapshot = ::Google::Protobuf::DescriptorPool.generated_pool.lookup("DependencyGraphAPI.v1.GetIncludedDependencySnapshotsResponse.IncludedSnapshot").msgclass
    NullableBool = ::Google::Protobuf::DescriptorPool.generated_pool.lookup("DependencyGraphAPI.v1.NullableBool").msgclass
    Manifest = ::Google::Protobuf::DescriptorPool.generated_pool.lookup("DependencyGraphAPI.v1.Manifest").msgclass
    Manifest::Dependency = ::Google::Protobuf::DescriptorPool.generated_pool.lookup("DependencyGraphAPI.v1.Manifest.Dependency").msgclass
    Manifest::Dependency::VulnerableVersionRange = ::Google::Protobuf::DescriptorPool.generated_pool.lookup("DependencyGraphAPI.v1.Manifest.Dependency.VulnerableVersionRange").msgclass
    ResponsePageMetadata = ::Google::Protobuf::DescriptorPool.generated_pool.lookup("DependencyGraphAPI.v1.ResponsePageMetadata").msgclass
    GetSnapshotsDiffResponse = ::Google::Protobuf::DescriptorPool.generated_pool.lookup("DependencyGraphAPI.v1.GetSnapshotsDiffResponse").msgclass
    GetSnapshotsDiffResponse::ManifestDiff = ::Google::Protobuf::DescriptorPool.generated_pool.lookup("DependencyGraphAPI.v1.GetSnapshotsDiffResponse.ManifestDiff").msgclass
    GetSnapshotsDiffResponse::ManifestDiff::DependencyDiff = ::Google::Protobuf::DescriptorPool.generated_pool.lookup("DependencyGraphAPI.v1.GetSnapshotsDiffResponse.ManifestDiff.DependencyDiff").msgclass
    GetSnapshotsDiffResponse::ManifestDiff::DependencyDiff::DependencyChangeType = ::Google::Protobuf::DescriptorPool.generated_pool.lookup("DependencyGraphAPI.v1.GetSnapshotsDiffResponse.ManifestDiff.DependencyDiff.DependencyChangeType").enummodule
    DependencySnapshotDependency = ::Google::Protobuf::DescriptorPool.generated_pool.lookup("DependencyGraphAPI.v1.DependencySnapshotDependency").msgclass
    DependencySnapshotManifest = ::Google::Protobuf::DescriptorPool.generated_pool.lookup("DependencyGraphAPI.v1.DependencySnapshotManifest").msgclass
    DependencySnapshotRepositoryMetadata = ::Google::Protobuf::DescriptorPool.generated_pool.lookup("DependencyGraphAPI.v1.DependencySnapshotRepositoryMetadata").msgclass
    CreateDependencySnapshotRequest = ::Google::Protobuf::DescriptorPool.generated_pool.lookup("DependencyGraphAPI.v1.CreateDependencySnapshotRequest").msgclass
    CreateDependencySnapshotResponse = ::Google::Protobuf::DescriptorPool.generated_pool.lookup("DependencyGraphAPI.v1.CreateDependencySnapshotResponse").msgclass
    CreateDependencySnapshotResponse::Result = ::Google::Protobuf::DescriptorPool.generated_pool.lookup("DependencyGraphAPI.v1.CreateDependencySnapshotResponse.Result").enummodule
    DependencySnapshotDependencyMetadata = ::Google::Protobuf::DescriptorPool.generated_pool.lookup("DependencyGraphAPI.v1.DependencySnapshotDependencyMetadata").msgclass
    GetDependencySnapshotRequest = ::Google::Protobuf::DescriptorPool.generated_pool.lookup("DependencyGraphAPI.v1.GetDependencySnapshotRequest").msgclass
    GetDependencySnapshotResponse = ::Google::Protobuf::DescriptorPool.generated_pool.lookup("DependencyGraphAPI.v1.GetDependencySnapshotResponse").msgclass
    GetDependencySnapshotsDiffRequest = ::Google::Protobuf::DescriptorPool.generated_pool.lookup("DependencyGraphAPI.v1.GetDependencySnapshotsDiffRequest").msgclass
    GetDependencySnapshotsDiffResponse = ::Google::Protobuf::DescriptorPool.generated_pool.lookup("DependencyGraphAPI.v1.GetDependencySnapshotsDiffResponse").msgclass
    GetDependencySnapshotsDiffResponse::DependencySnapshotManifestDiff = ::Google::Protobuf::DescriptorPool.generated_pool.lookup("DependencyGraphAPI.v1.GetDependencySnapshotsDiffResponse.DependencySnapshotManifestDiff").msgclass
    GetDependencySnapshotsDiffResponse::DependencySnapshotManifestDiff::DependencySnapshotDependency = ::Google::Protobuf::DescriptorPool.generated_pool.lookup("DependencyGraphAPI.v1.GetDependencySnapshotsDiffResponse.DependencySnapshotManifestDiff.DependencySnapshotDependency").msgclass
    GetDependencySnapshotsDiffResponse::DependencySnapshotManifestDiff::DependencySnapshotDependencyDiff = ::Google::Protobuf::DescriptorPool.generated_pool.lookup("DependencyGraphAPI.v1.GetDependencySnapshotsDiffResponse.DependencySnapshotManifestDiff.DependencySnapshotDependencyDiff").msgclass
    GetDependencySnapshotsDiffResponse::DependencySnapshotVulnerableDependency = ::Google::Protobuf::DescriptorPool.generated_pool.lookup("DependencyGraphAPI.v1.GetDependencySnapshotsDiffResponse.DependencySnapshotVulnerableDependency").msgclass
    GetDependencySnapshotsDiffResponse::DependencySnapshotDependencyDiffMetadata = ::Google::Protobuf::DescriptorPool.generated_pool.lookup("DependencyGraphAPI.v1.GetDependencySnapshotsDiffResponse.DependencySnapshotDependencyDiffMetadata").msgclass
    GetDependencySnapshotsDiffResponse::DependencySnapshotMetadata = ::Google::Protobuf::DescriptorPool.generated_pool.lookup("DependencyGraphAPI.v1.GetDependencySnapshotsDiffResponse.DependencySnapshotMetadata").msgclass
    GetDependenciesForRepositoryRequest = ::Google::Protobuf::DescriptorPool.generated_pool.lookup("DependencyGraphAPI.v1.GetDependenciesForRepositoryRequest").msgclass
    GetDependenciesForRepositoryResponse = ::Google::Protobuf::DescriptorPool.generated_pool.lookup("DependencyGraphAPI.v1.GetDependenciesForRepositoryResponse").msgclass
    HasManifestsRequest = ::Google::Protobuf::DescriptorPool.generated_pool.lookup("DependencyGraphAPI.v1.HasManifestsRequest").msgclass
    HasManifestsResponse = ::Google::Protobuf::DescriptorPool.generated_pool.lookup("DependencyGraphAPI.v1.HasManifestsResponse").msgclass
    RepositoriesContainingDependencyRequest = ::Google::Protobuf::DescriptorPool.generated_pool.lookup("DependencyGraphAPI.v1.RepositoriesContainingDependencyRequest").msgclass
    RepositoriesContainingDependencyResponse = ::Google::Protobuf::DescriptorPool.generated_pool.lookup("DependencyGraphAPI.v1.RepositoriesContainingDependencyResponse").msgclass
    GetRepositorySBOMRequest = ::Google::Protobuf::DescriptorPool.generated_pool.lookup("DependencyGraphAPI.v1.GetRepositorySBOMRequest").msgclass
    GetRepositorySBOMResponse = ::Google::Protobuf::DescriptorPool.generated_pool.lookup("DependencyGraphAPI.v1.GetRepositorySBOMResponse").msgclass
    SearchDependenciesForRepositoryRequest = ::Google::Protobuf::DescriptorPool.generated_pool.lookup("DependencyGraphAPI.v1.SearchDependenciesForRepositoryRequest").msgclass
    SearchDependenciesForRepositoryRequest::DependabotAlert = ::Google::Protobuf::DescriptorPool.generated_pool.lookup("DependencyGraphAPI.v1.SearchDependenciesForRepositoryRequest.DependabotAlert").msgclass
    SearchDependenciesForRepositoryResponse = ::Google::Protobuf::DescriptorPool.generated_pool.lookup("DependencyGraphAPI.v1.SearchDependenciesForRepositoryResponse").msgclass
    SearchDependenciesForRepositoryResponse::Result = ::Google::Protobuf::DescriptorPool.generated_pool.lookup("DependencyGraphAPI.v1.SearchDependenciesForRepositoryResponse.Result").msgclass
    SearchDependenciesForRepositoryResponse::Scanner = ::Google::Protobuf::DescriptorPool.generated_pool.lookup("DependencyGraphAPI.v1.SearchDependenciesForRepositoryResponse.Scanner").enummodule
    SearchDependenciesForRepositoryResponse::Relationship = ::Google::Protobuf::DescriptorPool.generated_pool.lookup("DependencyGraphAPI.v1.SearchDependenciesForRepositoryResponse.Relationship").enummodule
    GetReleasesForPackageRequest = ::Google::Protobuf::DescriptorPool.generated_pool.lookup("DependencyGraphAPI.v1.GetReleasesForPackageRequest").msgclass
    GetReleasesForPackageResponse = ::Google::Protobuf::DescriptorPool.generated_pool.lookup("DependencyGraphAPI.v1.GetReleasesForPackageResponse").msgclass
    GetReleasesForPackageResponse::PackageRelease = ::Google::Protobuf::DescriptorPool.generated_pool.lookup("DependencyGraphAPI.v1.GetReleasesForPackageResponse.PackageRelease").msgclass
    GetPackageVersionsRequest = ::Google::Protobuf::DescriptorPool.generated_pool.lookup("DependencyGraphAPI.v1.GetPackageVersionsRequest").msgclass
    GetPackageVersionsRequest::PackageVersionSpec = ::Google::Protobuf::DescriptorPool.generated_pool.lookup("DependencyGraphAPI.v1.GetPackageVersionsRequest.PackageVersionSpec").msgclass
    GetPackageVersionsResponse = ::Google::Protobuf::DescriptorPool.generated_pool.lookup("DependencyGraphAPI.v1.GetPackageVersionsResponse").msgclass
    GetPackageVersionsResponse::PackageVersion = ::Google::Protobuf::DescriptorPool.generated_pool.lookup("DependencyGraphAPI.v1.GetPackageVersionsResponse.PackageVersion").msgclass
    ListPackageVersionsRequest = ::Google::Protobuf::DescriptorPool.generated_pool.lookup("DependencyGraphAPI.v1.ListPackageVersionsRequest").msgclass
    ListPackageVersionsResponse = ::Google::Protobuf::DescriptorPool.generated_pool.lookup("DependencyGraphAPI.v1.ListPackageVersionsResponse").msgclass
    ListPackageVersionsResponse::PackageVersion = ::Google::Protobuf::DescriptorPool.generated_pool.lookup("DependencyGraphAPI.v1.ListPackageVersionsResponse.PackageVersion").msgclass
    PackageManager = ::Google::Protobuf::DescriptorPool.generated_pool.lookup("DependencyGraphAPI.v1.PackageManager").enummodule
    Scope = ::Google::Protobuf::DescriptorPool.generated_pool.lookup("DependencyGraphAPI.v1.Scope").enummodule
    Severity = ::Google::Protobuf::DescriptorPool.generated_pool.lookup("DependencyGraphAPI.v1.Severity").enummodule
  end
end
