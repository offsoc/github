# Generated by the protocol buffer compiler.  DO NOT EDIT!
# source: spokes-api/objects/v1/objects_api.proto

require 'google/protobuf'

require 'spokes-api/types/selectors/v1/object_selector_pb'
require 'spokes-api/types/v1/object_pb'
require 'spokes-api/types/v1/object_id_pb'
require 'spokes-api/types/v1/repository_pb'
require 'spokes-api/types/v1/request_context_pb'
require 'spokes-api/types/v1/revision_pb'

Google::Protobuf::DescriptorPool.generated_pool.build do
  add_file("spokes-api/objects/v1/objects_api.proto", :syntax => :proto3) do
    add_message "github.spokes.objects.v1.ResolveObjectRequest" do
      optional :repository, :message, 1, "github.spokes.types.v1.Repository"
      optional :object_name, :message, 2, "github.spokes.types.v1.Revision"
      optional :request_context, :message, 3, "github.spokes.types.v1.RequestContext"
    end
    add_message "github.spokes.objects.v1.ResolveObjectResponse" do
      optional :oid, :message, 1, "github.spokes.types.v1.ObjectID"
    end
    add_message "github.spokes.objects.v1.ResolveObjectsRequest" do
      optional :repository, :message, 1, "github.spokes.types.v1.Repository"
      optional :request_context, :message, 3, "github.spokes.types.v1.RequestContext"
      repeated :selectors, :message, 2, "github.spokes.types.selectors.v1.ObjectSelector"
    end
    add_message "github.spokes.objects.v1.ResolveObjectsResponse" do
      repeated :items, :message, 1, "github.spokes.objects.v1.ResolveObjectsResponse.ResolvedItem"
    end
    add_message "github.spokes.objects.v1.ResolveObjectsResponse.ResolvedItem" do
      oneof :item do
        optional :error, :string, 1
        optional :object, :message, 2, "github.spokes.types.v1.Object"
      end
    end
  end
end

module GitHub
  module Spokes
    module Proto
      module Objects
        module V1
          ResolveObjectRequest = ::Google::Protobuf::DescriptorPool.generated_pool.lookup("github.spokes.objects.v1.ResolveObjectRequest").msgclass
          ResolveObjectResponse = ::Google::Protobuf::DescriptorPool.generated_pool.lookup("github.spokes.objects.v1.ResolveObjectResponse").msgclass
          ResolveObjectsRequest = ::Google::Protobuf::DescriptorPool.generated_pool.lookup("github.spokes.objects.v1.ResolveObjectsRequest").msgclass
          ResolveObjectsResponse = ::Google::Protobuf::DescriptorPool.generated_pool.lookup("github.spokes.objects.v1.ResolveObjectsResponse").msgclass
          ResolveObjectsResponse::ResolvedItem = ::Google::Protobuf::DescriptorPool.generated_pool.lookup("github.spokes.objects.v1.ResolveObjectsResponse.ResolvedItem").msgclass
        end
      end
    end
  end
end
