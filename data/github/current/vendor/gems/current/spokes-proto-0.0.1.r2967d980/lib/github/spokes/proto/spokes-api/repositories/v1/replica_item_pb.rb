# Generated by the protocol buffer compiler.  DO NOT EDIT!
# source: spokes-api/repositories/v1/replica_item.proto

require 'google/protobuf'

Google::Protobuf::DescriptorPool.generated_pool.build do
  add_file("spokes-api/repositories/v1/replica_item.proto", :syntax => :proto3) do
    add_message "github.spokes.repositories.v1.ReplicaItem" do
      optional :ip, :string, 1
      optional :absolute_path, :string, 2
      optional :host_name, :string, 3
      optional :route_type, :enum, 4, "github.spokes.repositories.v1.ReplicaType"
    end
    add_enum "github.spokes.repositories.v1.ReplicaType" do
      value :REPLICA_TYPE_INVALID, 0
      value :REPLICA_TYPE_NOERROR, 1
      value :REPLICA_TYPE_NORMAL, 2
    end
  end
end

module GitHub
  module Spokes
    module Proto
      module Repositories
        module V1
          ReplicaItem = ::Google::Protobuf::DescriptorPool.generated_pool.lookup("github.spokes.repositories.v1.ReplicaItem").msgclass
          ReplicaType = ::Google::Protobuf::DescriptorPool.generated_pool.lookup("github.spokes.repositories.v1.ReplicaType").enummodule
        end
      end
    end
  end
end
