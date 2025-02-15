# Generated by the protocol buffer compiler.  DO NOT EDIT!
# source: proto/admin-api.proto

require 'google/protobuf'

Google::Protobuf::DescriptorPool.generated_pool.build do
  add_file("proto/admin-api.proto", :syntax => :proto3) do
    add_message "billing_platform.api.v1.ProcessDeadLetterQueueRequest" do
      optional :num, :int64, 1
      optional :queueName, :string, 2
    end
    add_message "billing_platform.api.v1.ProcessDeadLetterQueueResponse" do
      optional :success, :bool, 1
    end
    add_message "billing_platform.api.v1.GetAzureEmissionRequest" do
      optional :customerId, :string, 1
      optional :sku, :string, 2
      optional :year, :int64, 3
      optional :month, :int64, 4
      optional :day, :int64, 5
    end
    add_message "billing_platform.api.v1.GetAzureEmissionResponse" do
      optional :azureEmission, :message, 1, "billing_platform.api.v1.AzureEmission"
    end
    add_message "billing_platform.api.v1.AzureEmission" do
      optional :azurePartitionKey, :string, 1
      optional :meterId, :string, 2
      optional :subscriptionId, :string, 3
      optional :quantity, :double, 4
      optional :status, :enum, 5, "billing_platform.api.v1.AzureEmissionStatus"
      optional :errorMessage, :string, 6
      optional :GrossQuantity, :double, 7
    end
    add_message "billing_platform.api.v1.TriggerAzureEmissionRequest" do
      optional :customerId, :string, 1
      optional :year, :int64, 2
      optional :month, :int64, 3
      optional :day, :int64, 4
    end
    add_message "billing_platform.api.v1.TriggerAzureEmissionResponse" do
      optional :success, :bool, 1
    end
    add_message "billing_platform.api.v1.TriggerInvoiceGenerationRequest" do
      optional :customerId, :string, 1
      optional :year, :int64, 2
      optional :month, :int64, 3
    end
    add_message "billing_platform.api.v1.TriggerInvoiceGenerationResponse" do
      optional :success, :bool, 1
    end
    add_message "billing_platform.api.v1.TriggerWatermarkWorkflowRequest" do
      optional :customerId, :string, 1
      optional :sku, :string, 2
      optional :year, :int64, 3
      optional :month, :int64, 4
      optional :day, :int64, 5
      optional :hour, :int64, 6
    end
    add_message "billing_platform.api.v1.TriggerWatermarkWorkflowResponse" do
      optional :success, :bool, 1
    end
    add_message "billing_platform.api.v1.GenerateUsageRequest" do
      optional :customerId, :string, 1
      optional :sku, :string, 2
      optional :orgId, :int64, 3
      optional :repoId, :int64, 4
      optional :amount, :float, 5
      optional :quantity, :float, 6
    end
    add_message "billing_platform.api.v1.GenerateUsageResponse" do
      optional :success, :bool, 1
    end
    add_message "billing_platform.api.v1.TriggerHighWatermarkRolloverRequest" do
      optional :customerId, :string, 1
      optional :sku, :string, 2
      optional :year, :int64, 3
      optional :month, :int64, 4
      optional :dryRun, :bool, 5
    end
    add_message "billing_platform.api.v1.TriggerHighWatermarkRolloverResponse" do
      optional :success, :bool, 1
    end
    add_enum "billing_platform.api.v1.AzureEmissionStatus" do
      value :New, 0
      value :Recorded, 1
      value :Completed, 2
      value :Failed, 3
      value :Ignored, 4
    end
  end
end

module BillingPlatform
  module Api
    module V1
      ProcessDeadLetterQueueRequest = ::Google::Protobuf::DescriptorPool.generated_pool.lookup("billing_platform.api.v1.ProcessDeadLetterQueueRequest").msgclass
      ProcessDeadLetterQueueResponse = ::Google::Protobuf::DescriptorPool.generated_pool.lookup("billing_platform.api.v1.ProcessDeadLetterQueueResponse").msgclass
      GetAzureEmissionRequest = ::Google::Protobuf::DescriptorPool.generated_pool.lookup("billing_platform.api.v1.GetAzureEmissionRequest").msgclass
      GetAzureEmissionResponse = ::Google::Protobuf::DescriptorPool.generated_pool.lookup("billing_platform.api.v1.GetAzureEmissionResponse").msgclass
      AzureEmission = ::Google::Protobuf::DescriptorPool.generated_pool.lookup("billing_platform.api.v1.AzureEmission").msgclass
      TriggerAzureEmissionRequest = ::Google::Protobuf::DescriptorPool.generated_pool.lookup("billing_platform.api.v1.TriggerAzureEmissionRequest").msgclass
      TriggerAzureEmissionResponse = ::Google::Protobuf::DescriptorPool.generated_pool.lookup("billing_platform.api.v1.TriggerAzureEmissionResponse").msgclass
      TriggerInvoiceGenerationRequest = ::Google::Protobuf::DescriptorPool.generated_pool.lookup("billing_platform.api.v1.TriggerInvoiceGenerationRequest").msgclass
      TriggerInvoiceGenerationResponse = ::Google::Protobuf::DescriptorPool.generated_pool.lookup("billing_platform.api.v1.TriggerInvoiceGenerationResponse").msgclass
      TriggerWatermarkWorkflowRequest = ::Google::Protobuf::DescriptorPool.generated_pool.lookup("billing_platform.api.v1.TriggerWatermarkWorkflowRequest").msgclass
      TriggerWatermarkWorkflowResponse = ::Google::Protobuf::DescriptorPool.generated_pool.lookup("billing_platform.api.v1.TriggerWatermarkWorkflowResponse").msgclass
      GenerateUsageRequest = ::Google::Protobuf::DescriptorPool.generated_pool.lookup("billing_platform.api.v1.GenerateUsageRequest").msgclass
      GenerateUsageResponse = ::Google::Protobuf::DescriptorPool.generated_pool.lookup("billing_platform.api.v1.GenerateUsageResponse").msgclass
      TriggerHighWatermarkRolloverRequest = ::Google::Protobuf::DescriptorPool.generated_pool.lookup("billing_platform.api.v1.TriggerHighWatermarkRolloverRequest").msgclass
      TriggerHighWatermarkRolloverResponse = ::Google::Protobuf::DescriptorPool.generated_pool.lookup("billing_platform.api.v1.TriggerHighWatermarkRolloverResponse").msgclass
      AzureEmissionStatus = ::Google::Protobuf::DescriptorPool.generated_pool.lookup("billing_platform.api.v1.AzureEmissionStatus").enummodule
    end
  end
end
