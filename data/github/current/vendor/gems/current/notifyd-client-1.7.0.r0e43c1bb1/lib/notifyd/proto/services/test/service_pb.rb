# Generated by the protocol buffer compiler.  DO NOT EDIT!
# source: proto/services/test/service.proto

require 'google/protobuf'

Google::Protobuf::DescriptorPool.generated_pool.build do
  add_file("proto/services/test/service.proto", :syntax => :proto3) do
    add_message "notifyd.api.test.EchoRequest" do
      optional :msg, :string, 1
    end
    add_message "notifyd.api.test.EchoResponse" do
      optional :msg, :string, 1
    end
  end
end

module Notifyd
  module Proto
    module Test
      EchoRequest = ::Google::Protobuf::DescriptorPool.generated_pool.lookup("notifyd.api.test.EchoRequest").msgclass
      EchoResponse = ::Google::Protobuf::DescriptorPool.generated_pool.lookup("notifyd.api.test.EchoResponse").msgclass
    end
  end
end
