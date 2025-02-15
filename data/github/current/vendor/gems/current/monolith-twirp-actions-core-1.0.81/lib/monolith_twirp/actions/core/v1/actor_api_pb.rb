# Generated by the protocol buffer compiler.  DO NOT EDIT!
# source: core/v1/actor_api.proto

require 'google/protobuf'

require_relative '../../core/v1/identity_pb'
require_relative '../../core/v1/actor_pb'
Google::Protobuf::DescriptorPool.generated_pool.build do
  add_file("core/v1/actor_api.proto", :syntax => :proto3) do
    add_message "actions.core.v1.GetActorsInfoRequest" do
      repeated :actor_global_ids, :message, 1, "actions.core.v1.Identity"
    end
    add_message "actions.core.v1.GetActorsInfoResponse" do
      repeated :actors, :message, 1, "actions.core.v1.Actor"
    end
  end
end

module MonolithTwirp
  module Actions
    module Core
      module V1
        GetActorsInfoRequest = ::Google::Protobuf::DescriptorPool.generated_pool.lookup("actions.core.v1.GetActorsInfoRequest").msgclass
        GetActorsInfoResponse = ::Google::Protobuf::DescriptorPool.generated_pool.lookup("actions.core.v1.GetActorsInfoResponse").msgclass
      end
    end
  end
end
