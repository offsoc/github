# Generated by the protocol buffer compiler.  DO NOT EDIT!
# source: spokes-api/blobs/v1/blobs_api.proto

require 'google/protobuf'

require 'spokes-api/types/v1/cursor_pb'
require 'spokes-api/types/v1/object_id_pb'
require 'spokes-api/types/v1/path_pb'
require 'spokes-api/types/v1/reference_pb'
require 'spokes-api/types/v1/repository_pb'
require 'spokes-api/types/v1/request_context_pb'
require 'spokes-api/types/selectors/v1/fork_push_selector_pb'
require 'spokes-api/types/selectors/v1/object_id_selector_pb'
require 'spokes-api/types/selectors/v1/push_selector_pb'
require 'spokes-api/types/selectors/v1/universal_selector_pb'
require 'spokes-api/types/selectors/v1/quarantine_objects_selector_pb'
require 'spokes-api/types/selectors/v1/historical_push_selector_pb'
require 'spokes-api/blobs/v1/blob_origin_item_pb'
require 'spokes-api/blobs/v1/changed_blob_item_pb'
require 'spokes-api/blobs/v1/reachable_blob_item_pb'
require 'spokes-api/blobs/v1/pushed_blob_item_pb'

Google::Protobuf::DescriptorPool.generated_pool.build do
  add_file("spokes-api/blobs/v1/blobs_api.proto", :syntax => :proto3) do
    add_message "github.spokes.blobs.v1.GetBlobContentsRequest" do
      optional :repository, :message, 1, "github.spokes.types.v1.Repository"
      optional :request_context, :message, 5, "github.spokes.types.v1.RequestContext"
      oneof :blob do
        optional :by_id, :message, 2, "github.spokes.types.v1.ObjectID"
        optional :by_ref_path, :message, 3, "github.spokes.blobs.v1.GetBlobContentsRequest.RefPath"
        optional :by_object_id_path, :message, 4, "github.spokes.blobs.v1.GetBlobContentsRequest.ObjectIDPath"
      end
    end
    add_message "github.spokes.blobs.v1.GetBlobContentsRequest.RefPath" do
      optional :reference, :message, 1, "github.spokes.types.v1.Reference"
      optional :path, :message, 2, "github.spokes.types.v1.Path"
    end
    add_message "github.spokes.blobs.v1.GetBlobContentsRequest.ObjectIDPath" do
      optional :oid, :message, 1, "github.spokes.types.v1.ObjectID"
      optional :path, :message, 2, "github.spokes.types.v1.Path"
    end
    add_message "github.spokes.blobs.v1.GetBlobContentsResponse" do
      optional :contents, :bytes, 1
      optional :size, :uint64, 2
      optional :truncated, :bool, 3
    end
    add_message "github.spokes.blobs.v1.ListChangedBlobsRequest" do
      optional :repository, :message, 1, "github.spokes.types.v1.Repository"
      optional :cursor, :message, 3, "github.spokes.types.v1.Cursor"
      optional :request_context, :message, 7, "github.spokes.types.v1.RequestContext"
      optional :commit_order, :enum, 9, "github.spokes.blobs.v1.ListChangedBlobsRequest.CommitOrder"
      oneof :selector do
        optional :push_selector, :message, 4, "github.spokes.types.selectors.v1.PushSelector"
        optional :fork_push_selector, :message, 5, "github.spokes.types.selectors.v1.ForkPushSelector"
        optional :universal_selector, :message, 6, "github.spokes.types.selectors.v1.UniversalSelector"
        optional :quarantine_objects_selector, :message, 8, "github.spokes.types.selectors.v1.QuarantineObjectsSelector"
      end
    end
    add_enum "github.spokes.blobs.v1.ListChangedBlobsRequest.CommitOrder" do
      value :COMMIT_ORDER_INVALID, 0
      value :COMMIT_ORDER_TOPO, 1
      value :COMMIT_ORDER_REVERSE_CHRONOLOGICAL, 2
    end
    add_message "github.spokes.blobs.v1.ListChangedBlobsResponse" do
      repeated :changed_blobs, :message, 1, "github.spokes.blobs.v1.ChangedBlobItem"
      optional :next_cursor, :message, 2, "github.spokes.types.v1.Cursor"
    end
    add_message "github.spokes.blobs.v1.ListReachableBlobsRequest" do
      optional :repository, :message, 1, "github.spokes.types.v1.Repository"
      optional :cursor, :message, 3, "github.spokes.types.v1.Cursor"
      optional :request_context, :message, 7, "github.spokes.types.v1.RequestContext"
      oneof :selector do
        optional :push_selector, :message, 4, "github.spokes.types.selectors.v1.PushSelector"
        optional :fork_push_selector, :message, 5, "github.spokes.types.selectors.v1.ForkPushSelector"
        optional :universal_selector, :message, 6, "github.spokes.types.selectors.v1.UniversalSelector"
        optional :historical_push_selector, :message, 8, "github.spokes.types.selectors.v1.HistoricalPushSelector"
      end
    end
    add_message "github.spokes.blobs.v1.ListReachableBlobsResponse" do
      repeated :reachable_blobs, :message, 1, "github.spokes.blobs.v1.ReachableBlobItem"
      optional :next_cursor, :message, 2, "github.spokes.types.v1.Cursor"
    end
    add_message "github.spokes.blobs.v1.ListBlobOriginRequest" do
      optional :repository, :message, 1, "github.spokes.types.v1.Repository"
      optional :cursor, :message, 3, "github.spokes.types.v1.Cursor"
      optional :request_context, :message, 7, "github.spokes.types.v1.RequestContext"
      optional :commit_order, :enum, 8, "github.spokes.blobs.v1.ListBlobOriginRequest.CommitOrder"
      optional :max_commit_count, :uint32, 9
      oneof :selector do
        optional :object_id_selector, :message, 2, "github.spokes.types.selectors.v1.ObjectIDSelector"
      end
      oneof :ref_selector do
        optional :push_selector, :message, 4, "github.spokes.types.selectors.v1.PushSelector"
        optional :fork_push_selector, :message, 5, "github.spokes.types.selectors.v1.ForkPushSelector"
        optional :universal_selector, :message, 6, "github.spokes.types.selectors.v1.UniversalSelector"
      end
    end
    add_enum "github.spokes.blobs.v1.ListBlobOriginRequest.CommitOrder" do
      value :COMMIT_ORDER_INVALID, 0
      value :COMMIT_ORDER_TOPO, 1
      value :COMMIT_ORDER_REVERSE_CHRONOLOGICAL, 2
    end
    add_message "github.spokes.blobs.v1.ListBlobOriginResponse" do
      repeated :blob_items, :message, 1, "github.spokes.blobs.v1.BlobOriginItem"
      optional :next_cursor, :message, 2, "github.spokes.types.v1.Cursor"
    end
    add_message "github.spokes.blobs.v1.ListPushedBlobsRequest" do
      optional :repository, :message, 1, "github.spokes.types.v1.Repository"
      optional :cursor, :message, 3, "github.spokes.types.v1.Cursor"
      optional :request_context, :message, 7, "github.spokes.types.v1.RequestContext"
      oneof :selector do
        optional :push_selector, :message, 4, "github.spokes.types.selectors.v1.PushSelector"
        optional :fork_push_selector, :message, 5, "github.spokes.types.selectors.v1.ForkPushSelector"
      end
    end
    add_message "github.spokes.blobs.v1.ListPushedBlobsResponse" do
      repeated :pushed_blobs, :message, 1, "github.spokes.blobs.v1.PushedBlobItem"
      optional :next_cursor, :message, 2, "github.spokes.types.v1.Cursor"
    end
  end
end

module GitHub
  module Spokes
    module Proto
      module Blobs
        module V1
          GetBlobContentsRequest = ::Google::Protobuf::DescriptorPool.generated_pool.lookup("github.spokes.blobs.v1.GetBlobContentsRequest").msgclass
          GetBlobContentsRequest::RefPath = ::Google::Protobuf::DescriptorPool.generated_pool.lookup("github.spokes.blobs.v1.GetBlobContentsRequest.RefPath").msgclass
          GetBlobContentsRequest::ObjectIDPath = ::Google::Protobuf::DescriptorPool.generated_pool.lookup("github.spokes.blobs.v1.GetBlobContentsRequest.ObjectIDPath").msgclass
          GetBlobContentsResponse = ::Google::Protobuf::DescriptorPool.generated_pool.lookup("github.spokes.blobs.v1.GetBlobContentsResponse").msgclass
          ListChangedBlobsRequest = ::Google::Protobuf::DescriptorPool.generated_pool.lookup("github.spokes.blobs.v1.ListChangedBlobsRequest").msgclass
          ListChangedBlobsRequest::CommitOrder = ::Google::Protobuf::DescriptorPool.generated_pool.lookup("github.spokes.blobs.v1.ListChangedBlobsRequest.CommitOrder").enummodule
          ListChangedBlobsResponse = ::Google::Protobuf::DescriptorPool.generated_pool.lookup("github.spokes.blobs.v1.ListChangedBlobsResponse").msgclass
          ListReachableBlobsRequest = ::Google::Protobuf::DescriptorPool.generated_pool.lookup("github.spokes.blobs.v1.ListReachableBlobsRequest").msgclass
          ListReachableBlobsResponse = ::Google::Protobuf::DescriptorPool.generated_pool.lookup("github.spokes.blobs.v1.ListReachableBlobsResponse").msgclass
          ListBlobOriginRequest = ::Google::Protobuf::DescriptorPool.generated_pool.lookup("github.spokes.blobs.v1.ListBlobOriginRequest").msgclass
          ListBlobOriginRequest::CommitOrder = ::Google::Protobuf::DescriptorPool.generated_pool.lookup("github.spokes.blobs.v1.ListBlobOriginRequest.CommitOrder").enummodule
          ListBlobOriginResponse = ::Google::Protobuf::DescriptorPool.generated_pool.lookup("github.spokes.blobs.v1.ListBlobOriginResponse").msgclass
          ListPushedBlobsRequest = ::Google::Protobuf::DescriptorPool.generated_pool.lookup("github.spokes.blobs.v1.ListPushedBlobsRequest").msgclass
          ListPushedBlobsResponse = ::Google::Protobuf::DescriptorPool.generated_pool.lookup("github.spokes.blobs.v1.ListPushedBlobsResponse").msgclass
        end
      end
    end
  end
end
