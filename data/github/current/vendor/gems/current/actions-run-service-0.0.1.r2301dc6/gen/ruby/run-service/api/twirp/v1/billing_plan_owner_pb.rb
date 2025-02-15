# Generated by the protocol buffer compiler.  DO NOT EDIT!
# source: run-service/api/twirp/v1/billing_plan_owner.proto

require 'google/protobuf'

Google::Protobuf::DescriptorPool.generated_pool.build do
  add_file("run-service/api/twirp/v1/billing_plan_owner.proto", :syntax => :proto3) do
    add_message "github.actions.run_service.api.twirp.v1.BillingPlanOwner" do
      optional :id, :string, 1
      optional :plan_sku, :string, 2
      optional :type, :string, 3
      optional :name, :string, 4
      optional :tenant_name, :string, 5
      optional :organization_id, :string, 6
      optional :organization_tenant_name, :string, 7
    end
  end
end

module GitHub
  module ActionsRunService
    module Api
      module Twirp
        module V1
          BillingPlanOwner = ::Google::Protobuf::DescriptorPool.generated_pool.lookup("github.actions.run_service.api.twirp.v1.BillingPlanOwner").msgclass
        end
      end
    end
  end
end
