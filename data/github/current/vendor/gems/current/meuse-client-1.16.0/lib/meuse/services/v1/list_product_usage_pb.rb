# Generated by the protocol buffer compiler.  DO NOT EDIT!
# source: meuse/services/v1/list_product_usage.proto

require 'google/protobuf'

require 'google/protobuf/timestamp_pb'
require 'meuse/services/v1/enums/owner_type_pb'
require 'meuse/services/v1/enums/budget_group_pb'
require 'meuse/services/v1/messages/product_usage_pb'
Google::Protobuf::DescriptorPool.generated_pool.build do
  add_file("meuse/services/v1/list_product_usage.proto", :syntax => :proto3) do
    add_message "meuse.services.v1.ListProductUsageRequest" do
      optional :billable_owner_type, :enum, 1, "meuse.services.v1.enums.OwnerType"
      optional :billable_owner_id, :uint64, 2
      optional :usage_starts_at, :message, 3, "google.protobuf.Timestamp"
      optional :usage_ends_at, :message, 4, "google.protobuf.Timestamp"
      optional :owner_id, :uint64, 5
      optional :owner_type, :enum, 6, "meuse.services.v1.enums.OwnerType"
      optional :actor_id, :uint64, 7
      optional :per_page, :uint32, 8
      optional :budget_group, :enum, 9, "meuse.services.v1.enums.BudgetGroup"
      repeated :product_names, :string, 10
    end
    add_message "meuse.services.v1.ListProductUsageResponse" do
      repeated :product_usage, :message, 1, "meuse.services.v1.ProductUsage"
    end
  end
end

module Meuse
  module Services
    module V1
      ListProductUsageRequest = ::Google::Protobuf::DescriptorPool.generated_pool.lookup("meuse.services.v1.ListProductUsageRequest").msgclass
      ListProductUsageResponse = ::Google::Protobuf::DescriptorPool.generated_pool.lookup("meuse.services.v1.ListProductUsageResponse").msgclass
    end
  end
end
