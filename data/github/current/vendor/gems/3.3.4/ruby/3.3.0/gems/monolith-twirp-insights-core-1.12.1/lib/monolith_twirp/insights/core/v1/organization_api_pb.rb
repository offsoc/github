# Generated by the protocol buffer compiler.  DO NOT EDIT!
# source: core/v1/organization_api.proto

require 'google/protobuf'

require_relative '../../core/v1/user_pb'
require_relative '../../core/v1/internal_repository_pb'
require_relative '../../core/v1/pull_request_pb'
require 'google/protobuf/timestamp_pb'
Google::Protobuf::DescriptorPool.generated_pool.build do
  add_file("core/v1/organization_api.proto", :syntax => :proto3) do
    add_message "insights.core.v1.GetUsersRequest" do
      optional :org_id, :uint32, 1
      optional :cursor, :uint32, 2
      optional :batch_size, :uint32, 3
    end
    add_message "insights.core.v1.GetUsersResponse" do
      repeated :data, :message, 1, "insights.core.v1.User"
      optional :next_cursor, :int32, 2
    end
    add_message "insights.core.v1.GetOrgInternalRepositoriesRequest" do
      optional :org_id, :int64, 1
      optional :cursor, :uint32, 2
      optional :batch_size, :uint32, 3
    end
    add_message "insights.core.v1.GetOrgInternalRepositoriesResponse" do
      repeated :data, :message, 1, "insights.core.v1.InternalRepository"
      optional :next_cursor, :int32, 2
    end
    add_message "insights.core.v1.ListOrgPullRequestsRequest" do
      optional :org_id, :int64, 1
      optional :cursor, :uint32, 2
      optional :batch_size, :uint32, 3
    end
    add_message "insights.core.v1.ListOrgPullRequestsResponse" do
      repeated :data, :message, 1, "insights.core.v1.PullRequest"
      optional :next_cursor, :int32, 2
    end
    add_message "insights.core.v1.GetRepositoryIdsForOrgRequest" do
      optional :org_id, :uint64, 1
      optional :cursor, :uint64, 2
      optional :watermark, :message, 3, "google.protobuf.Timestamp"
      optional :batch_size, :uint32, 4
    end
    add_message "insights.core.v1.GetRepositoryIdsForOrgResponse" do
      repeated :repo_ids, :uint64, 1
      optional :next_cursor, :uint64, 2
    end
  end
end

module MonolithTwirp
  module Insights
    module Core
      module V1
        GetUsersRequest = ::Google::Protobuf::DescriptorPool.generated_pool.lookup("insights.core.v1.GetUsersRequest").msgclass
        GetUsersResponse = ::Google::Protobuf::DescriptorPool.generated_pool.lookup("insights.core.v1.GetUsersResponse").msgclass
        GetOrgInternalRepositoriesRequest = ::Google::Protobuf::DescriptorPool.generated_pool.lookup("insights.core.v1.GetOrgInternalRepositoriesRequest").msgclass
        GetOrgInternalRepositoriesResponse = ::Google::Protobuf::DescriptorPool.generated_pool.lookup("insights.core.v1.GetOrgInternalRepositoriesResponse").msgclass
        ListOrgPullRequestsRequest = ::Google::Protobuf::DescriptorPool.generated_pool.lookup("insights.core.v1.ListOrgPullRequestsRequest").msgclass
        ListOrgPullRequestsResponse = ::Google::Protobuf::DescriptorPool.generated_pool.lookup("insights.core.v1.ListOrgPullRequestsResponse").msgclass
        GetRepositoryIdsForOrgRequest = ::Google::Protobuf::DescriptorPool.generated_pool.lookup("insights.core.v1.GetRepositoryIdsForOrgRequest").msgclass
        GetRepositoryIdsForOrgResponse = ::Google::Protobuf::DescriptorPool.generated_pool.lookup("insights.core.v1.GetRepositoryIdsForOrgResponse").msgclass
      end
    end
  end
end
