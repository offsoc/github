# Generated by the protocol buffer compiler.  DO NOT EDIT!
# source: proto/sign_api.proto

require 'google/protobuf'

require 'google/protobuf/timestamp_pb'

Google::Protobuf::DescriptorPool.generated_pool.build do
  add_file("proto/sign_api.proto", :syntax => :proto3) do
    add_message "actions_usage_metrics.api.v1.GetUsageExportUrlRequest" do
    end
    add_message "actions_usage_metrics.api.v1.GetUsageExportUrlResponse" do
    end
  end
end

module ActionsUsageMetrics
  module Api
    module V1
      GetUsageExportUrlRequest = ::Google::Protobuf::DescriptorPool.generated_pool.lookup("actions_usage_metrics.api.v1.GetUsageExportUrlRequest").msgclass
      GetUsageExportUrlResponse = ::Google::Protobuf::DescriptorPool.generated_pool.lookup("actions_usage_metrics.api.v1.GetUsageExportUrlResponse").msgclass
    end
  end
end
