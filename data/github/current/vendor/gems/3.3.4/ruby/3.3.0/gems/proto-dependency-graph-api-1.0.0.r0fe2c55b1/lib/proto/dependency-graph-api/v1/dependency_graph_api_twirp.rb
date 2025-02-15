# Code generated by protoc-gen-twirp_ruby 1.11.0, DO NOT EDIT.
require 'twirp'
require_relative 'dependency_graph_api_pb.rb'

module DependencyGraphAPI
  module V1
    class HealthAPIService < ::Twirp::Service
      package 'DependencyGraphAPI.v1'
      service 'HealthAPI'
      rpc :Ping, PingRequest, PingResponse, :ruby_method => :ping
      rpc :Boom, BoomRequest, BoomResponse, :ruby_method => :boom
    end

    class HealthAPIClient < ::Twirp::Client
      client_for HealthAPIService
    end

    class RepositoryService < ::Twirp::Service
      package 'DependencyGraphAPI.v1'
      service 'Repository'
      rpc :GetDirectDependencies, GetDirectDependenciesRequest, GetDirectDependenciesResponse, :ruby_method => :get_direct_dependencies
    end

    class RepositoryClient < ::Twirp::Client
      client_for RepositoryService
    end

    class SnapshotAPIService < ::Twirp::Service
      package 'DependencyGraphAPI.v1'
      service 'SnapshotAPI'
      rpc :GetSnapshotsDiff, GetSnapshotsDiffRequest, GetSnapshotsDiffResponse, :ruby_method => :get_snapshots_diff
    end

    class SnapshotAPIClient < ::Twirp::Client
      client_for SnapshotAPIService
    end

    class DependencySnapshotAPIService < ::Twirp::Service
      package 'DependencyGraphAPI.v1'
      service 'DependencySnapshotAPI'
      rpc :CreateDependencySnapshot, CreateDependencySnapshotRequest, CreateDependencySnapshotResponse, :ruby_method => :create_dependency_snapshot
      rpc :GetDependencySnapshot, GetDependencySnapshotRequest, GetDependencySnapshotResponse, :ruby_method => :get_dependency_snapshot
      rpc :GetDependencySnapshotsDiff, GetDependencySnapshotsDiffRequest, GetDependencySnapshotsDiffResponse, :ruby_method => :get_dependency_snapshots_diff
      rpc :ExcludeDependencySnapshots, ExcludeDependencySnapshotsRequest, ExcludeDependencySnapshotsResponse, :ruby_method => :exclude_dependency_snapshots
      rpc :GetIncludedDependencySnapshots, GetIncludedDependencySnapshotsRequest, GetIncludedDependencySnapshotsResponse, :ruby_method => :get_included_dependency_snapshots
    end

    class DependencySnapshotAPIClient < ::Twirp::Client
      client_for DependencySnapshotAPIService
    end

    class RepositoryDependenciesAPIService < ::Twirp::Service
      package 'DependencyGraphAPI.v1'
      service 'RepositoryDependenciesAPI'
      rpc :GetDependenciesForRepository, GetDependenciesForRepositoryRequest, GetDependenciesForRepositoryResponse, :ruby_method => :get_dependencies_for_repository
      rpc :HasManifests, HasManifestsRequest, HasManifestsResponse, :ruby_method => :has_manifests
      rpc :RepositoriesContainingDependency, RepositoriesContainingDependencyRequest, RepositoriesContainingDependencyResponse, :ruby_method => :repositories_containing_dependency
      rpc :SearchDependenciesForRepository, SearchDependenciesForRepositoryRequest, SearchDependenciesForRepositoryResponse, :ruby_method => :search_dependencies_for_repository
    end

    class RepositoryDependenciesAPIClient < ::Twirp::Client
      client_for RepositoryDependenciesAPIService
    end

    class ExperimentalAPIService < ::Twirp::Service
      package 'DependencyGraphAPI.v1'
      service 'ExperimentalAPI'
      rpc :GetReleasesForPackage, GetReleasesForPackageRequest, GetReleasesForPackageResponse, :ruby_method => :get_releases_for_package
    end

    class ExperimentalAPIClient < ::Twirp::Client
      client_for ExperimentalAPIService
    end

    class RepositorySBOMService < ::Twirp::Service
      package 'DependencyGraphAPI.v1'
      service 'RepositorySBOM'
      rpc :GetRepositorySBOM, GetRepositorySBOMRequest, GetRepositorySBOMResponse, :ruby_method => :get_repository_s_b_o_m
    end

    class RepositorySBOMClient < ::Twirp::Client
      client_for RepositorySBOMService
    end

    class PackagesAPIService < ::Twirp::Service
      package 'DependencyGraphAPI.v1'
      service 'PackagesAPI'
      rpc :GetPackageVersions, GetPackageVersionsRequest, GetPackageVersionsResponse, :ruby_method => :get_package_versions
      rpc :ListPackageVersions, ListPackageVersionsRequest, ListPackageVersionsResponse, :ruby_method => :list_package_versions
    end

    class PackagesAPIClient < ::Twirp::Client
      client_for PackagesAPIService
    end
  end
end
