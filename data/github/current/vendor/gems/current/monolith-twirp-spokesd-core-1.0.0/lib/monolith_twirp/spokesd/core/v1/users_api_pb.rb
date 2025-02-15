# Generated by the protocol buffer compiler.  DO NOT EDIT!
# source: core/v1/users_api.proto

require 'google/protobuf'

Google::Protobuf::DescriptorPool.generated_pool.build do
  add_file("core/v1/users_api.proto", :syntax => :proto3) do
    add_message "spokesd.core.v1.GetUsersRequest" do
      repeated :user_ids, :uint64, 1
    end
    add_message "spokesd.core.v1.GetUsersResponse" do
      repeated :users, :message, 1, "spokesd.core.v1.User"
    end
    add_message "spokesd.core.v1.User" do
      optional :id, :uint64, 1
      optional :login, :string, 2
    end
  end
end

module MonolithTwirp
  module Spokesd
    module Core
      module V1
        GetUsersRequest = ::Google::Protobuf::DescriptorPool.generated_pool.lookup("spokesd.core.v1.GetUsersRequest").msgclass
        GetUsersResponse = ::Google::Protobuf::DescriptorPool.generated_pool.lookup("spokesd.core.v1.GetUsersResponse").msgclass
        User = ::Google::Protobuf::DescriptorPool.generated_pool.lookup("spokesd.core.v1.User").msgclass
      end
    end
  end
end
