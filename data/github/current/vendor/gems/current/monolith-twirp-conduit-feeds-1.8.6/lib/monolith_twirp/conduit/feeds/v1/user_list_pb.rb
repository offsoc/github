# Generated by the protocol buffer compiler.  DO NOT EDIT!
# source: feeds/v1/user_list.proto

require 'google/protobuf'

Google::Protobuf::DescriptorPool.generated_pool.build do
  add_file("feeds/v1/user_list.proto", :syntax => :proto3) do
    add_message "conduit.feeds.v1.UserList" do
      optional :id, :uint32, 1
    end
  end
end

module MonolithTwirp
  module Conduit
    module Feeds
      module V1
        UserList = ::Google::Protobuf::DescriptorPool.generated_pool.lookup("conduit.feeds.v1.UserList").msgclass
      end
    end
  end
end
