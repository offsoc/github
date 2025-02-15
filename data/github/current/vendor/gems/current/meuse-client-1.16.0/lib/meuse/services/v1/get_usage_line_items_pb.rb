# Generated by the protocol buffer compiler.  DO NOT EDIT!
# source: meuse/services/v1/get_usage_line_items.proto

require 'google/protobuf'

require 'google/protobuf/timestamp_pb'
require 'meuse/services/v1/enums/owner_type_pb'
require 'meuse/services/v1/messages/usage_line_item_pb'
Google::Protobuf::DescriptorPool.generated_pool.build do
  add_file("meuse/services/v1/get_usage_line_items.proto", :syntax => :proto3) do
    add_message "meuse.services.v1.GetUsageLineItemsRequest" do
      optional :billable_owner_type, :enum, 1, "meuse.services.v1.enums.OwnerType"
      optional :billable_owner_id, :uint64, 2
      optional :owner_type, :enum, 3, "meuse.services.v1.enums.OwnerType"
      optional :owner_id, :uint64, 4
      optional :usage_starts_at, :message, 5, "google.protobuf.Timestamp"
      optional :usage_ends_at, :message, 6, "google.protobuf.Timestamp"
      optional :product_id, :uint64, 8
      optional :submission_state_reason, :string, 10
      map :custom_fields, :string, :message, 11, "meuse.services.v1.GetUsageLineItemsRequest.CustomFieldValues"
      optional :per_page, :uint32, 12
      optional :page, :uint32, 13
      optional :product_name, :string, 14
      optional :cursor_usage_at, :message, 16, "google.protobuf.Timestamp"
      optional :cursor_id, :uint64, 17
      optional :submission_state, :string, 18
    end
    add_message "meuse.services.v1.GetUsageLineItemsRequest.CustomFieldValues" do
      repeated :field_values, :string, 1
    end
    add_message "meuse.services.v1.GetUsageLineItemsResponse" do
      repeated :usage_line_items, :message, 1, "meuse.services.v1.messages.UsageLineItem"
      optional :pagination, :message, 2, "meuse.services.v1.GetUsageLineItemsResponse.PaginationMetadata"
    end
    add_message "meuse.services.v1.GetUsageLineItemsResponse.PaginationMetadata" do
      optional :page, :uint32, 1
      optional :per_page, :uint32, 2
      optional :page_size, :uint32, 3
      optional :next_page, :uint32, 4
      optional :cursor_usage_at, :message, 6, "google.protobuf.Timestamp"
      optional :cursor_id, :uint64, 7
    end
  end
end

module Meuse
  module Services
    module V1
      GetUsageLineItemsRequest = ::Google::Protobuf::DescriptorPool.generated_pool.lookup("meuse.services.v1.GetUsageLineItemsRequest").msgclass
      GetUsageLineItemsRequest::CustomFieldValues = ::Google::Protobuf::DescriptorPool.generated_pool.lookup("meuse.services.v1.GetUsageLineItemsRequest.CustomFieldValues").msgclass
      GetUsageLineItemsResponse = ::Google::Protobuf::DescriptorPool.generated_pool.lookup("meuse.services.v1.GetUsageLineItemsResponse").msgclass
      GetUsageLineItemsResponse::PaginationMetadata = ::Google::Protobuf::DescriptorPool.generated_pool.lookup("meuse.services.v1.GetUsageLineItemsResponse.PaginationMetadata").msgclass
    end
  end
end
