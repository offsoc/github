# Generated by the protocol buffer compiler.  DO NOT EDIT!
# source: spokes-api/merges/v1/merges_api.proto

require 'google/protobuf'

require 'spokes-api/types/v1/object_id_pb'
require 'spokes-api/types/v1/repository_pb'
require 'spokes-api/types/v1/request_context_pb'
require 'spokes-api/merges/v1/merge_base_type_pb'

Google::Protobuf::DescriptorPool.generated_pool.build do
  add_file("spokes-api/merges/v1/merges_api.proto", :syntax => :proto3) do
    add_message "github.spokes.merges.v1.FindMergeBasesRequest" do
      optional :repository, :message, 1, "github.spokes.types.v1.Repository"
      optional :request_context, :message, 2, "github.spokes.types.v1.RequestContext"
      optional :base_oid, :message, 3, "github.spokes.types.v1.ObjectID"
      optional :head_oid, :message, 4, "github.spokes.types.v1.ObjectID"
      optional :merge_base_type, :enum, 5, "github.spokes.merges.v1.MergeBaseType"
    end
    add_message "github.spokes.merges.v1.FindMergeBasesResponse" do
      repeated :bases, :message, 1, "github.spokes.types.v1.ObjectID"
    end
  end
end

module GitHub
  module Spokes
    module Proto
      module Merges
        module V1
          FindMergeBasesRequest = ::Google::Protobuf::DescriptorPool.generated_pool.lookup("github.spokes.merges.v1.FindMergeBasesRequest").msgclass
          FindMergeBasesResponse = ::Google::Protobuf::DescriptorPool.generated_pool.lookup("github.spokes.merges.v1.FindMergeBasesResponse").msgclass
        end
      end
    end
  end
end
