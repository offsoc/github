# Generated by the protocol buffer compiler.  DO NOT EDIT!
# source: feature_management/feature_flags/data/v1/monolith.proto

require 'google/protobuf'

require 'feature_management/feature_flags/data/v1/actors_pb'
Google::Protobuf::DescriptorPool.generated_pool.build do
  add_file("feature_management/feature_flags/data/v1/monolith.proto", :syntax => :proto3) do
    add_message "feature_management.feature_flags.data.v1.MonolithCustomGateRequest" do
      repeated :custom_gate_names, :string, 1
      repeated :actor_ids, :string, 2
    end
    add_message "feature_management.feature_flags.data.v1.MonolithCustomGateResponse" do
      repeated :actors, :message, 1, "feature_management.feature_flags.data.v1.Actor"
    end
  end
end

module FeatureManagement
  module FeatureFlags
    module Data
      module V1
        MonolithCustomGateRequest = ::Google::Protobuf::DescriptorPool.generated_pool.lookup("feature_management.feature_flags.data.v1.MonolithCustomGateRequest").msgclass
        MonolithCustomGateResponse = ::Google::Protobuf::DescriptorPool.generated_pool.lookup("feature_management.feature_flags.data.v1.MonolithCustomGateResponse").msgclass
      end
    end
  end
end
