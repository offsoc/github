# Generated by the protocol buffer compiler.  DO NOT EDIT!
# source: accounts/v1/zuora_product_rate_plan_charges.proto

require 'google/protobuf'

Google::Protobuf::DescriptorPool.generated_pool.build do
  add_file("accounts/v1/zuora_product_rate_plan_charges.proto", :syntax => :proto3) do
    add_message "billing.accounts.v1.ZuoraProductRatePlanCharges" do
      optional :self_serve_id, :string, 1
      optional :sales_serve_id, :string, 2
    end
  end
end

module MonolithTwirp
  module Billing
    module Accounts
      module V1
        ZuoraProductRatePlanCharges = ::Google::Protobuf::DescriptorPool.generated_pool.lookup("billing.accounts.v1.ZuoraProductRatePlanCharges").msgclass
      end
    end
  end
end
