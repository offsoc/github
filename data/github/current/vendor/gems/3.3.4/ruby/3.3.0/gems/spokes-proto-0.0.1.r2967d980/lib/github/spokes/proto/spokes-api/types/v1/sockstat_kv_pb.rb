# Generated by the protocol buffer compiler.  DO NOT EDIT!
# source: spokes-api/types/v1/sockstat_kv.proto

require 'google/protobuf'

Google::Protobuf::DescriptorPool.generated_pool.build do
  add_file("spokes-api/types/v1/sockstat_kv.proto", :syntax => :proto3) do
    add_message "github.spokes.types.v1.SockstatKV" do
      optional :key, :string, 1
      oneof :value do
        optional :bytes_value, :bytes, 2
        optional :int64_value, :int64, 3
        optional :bool_value, :bool, 4
        optional :uint64_value, :uint64, 5
      end
    end
  end
end

module GitHub
  module Spokes
    module Proto
      module Types
        module V1
          SockstatKV = ::Google::Protobuf::DescriptorPool.generated_pool.lookup("github.spokes.types.v1.SockstatKV").msgclass
        end
      end
    end
  end
end
