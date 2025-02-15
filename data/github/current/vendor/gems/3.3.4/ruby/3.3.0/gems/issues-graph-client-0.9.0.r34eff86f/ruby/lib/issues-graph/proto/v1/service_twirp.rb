# Code generated by protoc-gen-twirp_ruby 1.11.0, DO NOT EDIT.
require 'twirp'
require_relative 'service_pb.rb'

module IssuesGraph
  module Proto
    class IssuesGraphService < ::Twirp::Service
      package 'proto'
      service 'IssuesGraph'
      rpc :GetIssue, GetIssueRequest, GetIssueResponse, :ruby_method => :get_issue
      rpc :UpdateIssue, UpdateIssueRequest, StatusResponse, :ruby_method => :update_issue
      rpc :DeleteIssueFromTrackingBlock, DeleteRelationshipRequest, StatusResponse, :ruby_method => :delete_issue_from_tracking_block
      rpc :DeleteTrackingBlockFromIssue, DeleteRelationshipRequest, StatusResponse, :ruby_method => :delete_tracking_block_from_issue
      rpc :GetItemModifiedAt, GetItemModifiedAtRequest, GetItemModifiedAtResponse, :ruby_method => :get_item_modified_at
    end

    class IssuesGraphClient < ::Twirp::Client
      client_for IssuesGraphService
    end

    class TrackingBlocksService < ::Twirp::Service
      package 'proto'
      service 'TrackingBlocks'
      rpc :AddForParent, AddTrackingBlockRequest, AddTrackingBlockResponse, :ruby_method => :add_for_parent
      rpc :UpdateByKey, UpdateTrackingBlockByKeyRequest, GetTrackingBlockResponse, :ruby_method => :update_by_key
      rpc :GetByParent, GetTrackingBlockRequest, GetTrackingBlocksResponse, :ruby_method => :get_by_parent
      rpc :RemoveTrackingBlock, RemoveTrackingBlockRequest, StatusResponse, :ruby_method => :remove_tracking_block
      rpc :ReplaceForParent, ReplaceForParentRequest, ReplaceForParentResponse, :ruby_method => :replace_for_parent
      rpc :UpdateByDiffForParent, UpdateByDiffForParentRequest, UpdateByDiffForParentResponse, :ruby_method => :update_by_diff_for_parent
    end

    class TrackingBlocksClient < ::Twirp::Client
      client_for TrackingBlocksService
    end

    class ProjectsService < ::Twirp::Service
      package 'proto'
      service 'Projects'
      rpc :UpsertProjectAndRelationships, UpsertProjectAndRelationshipsRequest, UpsertProjectAndRelationshipsResponse, :ruby_method => :upsert_project_and_relationships
      rpc :GetProjectItemCompletions, GetProjectItemCompletionsRequest, GetProjectItemCompletionsResponse, :ruby_method => :get_project_item_completions
      rpc :DeleteIssueFromProject, DeleteRelationshipRequest, StatusResponse, :ruby_method => :delete_issue_from_project
      rpc :GetProjectTrackedByItems, GetProjectTrackedByItemsRequest, GetProjectTrackedByItemsResponse, :ruby_method => :get_project_tracked_by_items
    end

    class ProjectsClient < ::Twirp::Client
      client_for ProjectsService
    end
  end
end
