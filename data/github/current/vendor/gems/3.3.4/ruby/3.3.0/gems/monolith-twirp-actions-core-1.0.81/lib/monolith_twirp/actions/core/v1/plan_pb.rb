# Generated by the protocol buffer compiler.  DO NOT EDIT!
# source: core/v1/plan.proto

require 'google/protobuf'

Google::Protobuf::DescriptorPool.generated_pool.build do
  add_file("core/v1/plan.proto", :syntax => :proto3) do
    add_enum "actions.core.v1.PlanName" do
      value :PLAN_NAME_INVALID, 0
      value :PLAN_NAME_FREE, 1
      value :PLAN_NAME_PRO, 2
      value :PLAN_NAME_FREE_WITH_ADD_ONS, 3
      value :PLAN_NAME_BUSINESS, 4
      value :PLAN_NAME_BUSINESS_PLUS, 5
      value :PLAN_NAME_OTHER, 6
    end
  end
end

module MonolithTwirp
  module Actions
    module Core
      module V1
        PlanName = ::Google::Protobuf::DescriptorPool.generated_pool.lookup("actions.core.v1.PlanName").enummodule
      end
    end
  end
end
