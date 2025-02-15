# Generated by the protocol buffer compiler.  DO NOT EDIT!
# source: meuse/services/v1/messages/product_sku.proto

require 'google/protobuf'

require 'meuse/services/v1/messages/unit_of_measure_pb'
require 'meuse/services/v1/messages/product_rate_plan_pb'
Google::Protobuf::DescriptorPool.generated_pool.build do
  add_file("meuse/services/v1/messages/product_sku.proto", :syntax => :proto3) do
    add_message "meuse.services.v1.messages.ProductSku" do
      optional :id, :sint64, 1
      optional :name, :string, 2
      optional :enabled, :bool, 4
      optional :unit_of_measure, :message, 6, "meuse.services.v1.messages.UnitOfMeasure"
      optional :azure_unit_of_measure, :message, 7, "meuse.services.v1.messages.UnitOfMeasure"
      optional :zuora_unit_of_measure, :message, 8, "meuse.services.v1.messages.UnitOfMeasure"
      repeated :product_rate_plans, :message, 9, "meuse.services.v1.messages.ProductRatePlan"
    end
  end
end

module Meuse
  module Services
    module V1
      module Messages
        ProductSku = ::Google::Protobuf::DescriptorPool.generated_pool.lookup("meuse.services.v1.messages.ProductSku").msgclass
      end
    end
  end
end
