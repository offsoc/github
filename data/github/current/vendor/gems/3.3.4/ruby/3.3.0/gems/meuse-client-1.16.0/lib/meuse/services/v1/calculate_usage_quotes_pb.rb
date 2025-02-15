# Generated by the protocol buffer compiler.  DO NOT EDIT!
# source: meuse/services/v1/calculate_usage_quotes.proto

require 'google/protobuf'

require 'google/protobuf/timestamp_pb'
require 'meuse/services/v1/enums/owner_type_pb'
require 'meuse/services/v1/messages/proposed_usage_pb'
require 'meuse/services/v1/messages/usage_quote_pb'
Google::Protobuf::DescriptorPool.generated_pool.build do
  add_file("meuse/services/v1/calculate_usage_quotes.proto", :syntax => :proto3) do
    add_message "meuse.services.v1.CalculateUsageQuotesRequest" do
      repeated :proposed_usage, :message, 1, "meuse.services.v1.messages.ProposedUsage"
      optional :metered_cycle_starts_at, :message, 2, "google.protobuf.Timestamp"
      optional :billable_owner_type, :enum, 3, "meuse.services.v1.enums.OwnerType"
      optional :billable_owner_id, :uint64, 4
      optional :owner_type, :enum, 5, "meuse.services.v1.enums.OwnerType"
      optional :owner_id, :uint64, 6
    end
    add_message "meuse.services.v1.CalculateUsageQuotesResponse" do
      repeated :usage_quotes, :message, 1, "meuse.services.v1.messages.UsageQuote"
    end
  end
end

module Meuse
  module Services
    module V1
      CalculateUsageQuotesRequest = ::Google::Protobuf::DescriptorPool.generated_pool.lookup("meuse.services.v1.CalculateUsageQuotesRequest").msgclass
      CalculateUsageQuotesResponse = ::Google::Protobuf::DescriptorPool.generated_pool.lookup("meuse.services.v1.CalculateUsageQuotesResponse").msgclass
    end
  end
end
