# Generated by the protocol buffer compiler.  DO NOT EDIT!
# source: meuse/services/v1/messages/budget.proto

require 'google/protobuf'

require 'meuse/services/types/money_pb'
Google::Protobuf::DescriptorPool.generated_pool.build do
  add_file("meuse/services/v1/messages/budget.proto", :syntax => :proto3) do
    add_message "meuse.services.v1.messages.Budget" do
      optional :id, :uint64, 1
      optional :total_spent, :message, 2, "meuse.services.types.Money"
    end
  end
end

module Meuse
  module Services
    module V1
      module Messages
        Budget = ::Google::Protobuf::DescriptorPool.generated_pool.lookup("meuse.services.v1.messages.Budget").msgclass
      end
    end
  end
end
