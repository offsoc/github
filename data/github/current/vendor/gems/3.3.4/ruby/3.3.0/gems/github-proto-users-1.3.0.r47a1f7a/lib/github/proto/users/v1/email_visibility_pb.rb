# Generated by the protocol buffer compiler.  DO NOT EDIT!
# source: v1/email_visibility.proto

require 'google/protobuf'

Google::Protobuf::DescriptorPool.generated_pool.build do
  add_file("v1/email_visibility.proto", :syntax => :proto3) do
    add_enum "github.users.v1.EmailVisibility" do
      value :EMAIL_VISIBILITY_INVALID, 0
      value :EMAIL_VISIBILITY_PUBLIC, 1
      value :EMAIL_VISIBILITY_PRIVATE, 2
    end
  end
end

module GitHub
  module Proto
    module Users
      module V1
        EmailVisibility = ::Google::Protobuf::DescriptorPool.generated_pool.lookup("github.users.v1.EmailVisibility").enummodule
      end
    end
  end
end
