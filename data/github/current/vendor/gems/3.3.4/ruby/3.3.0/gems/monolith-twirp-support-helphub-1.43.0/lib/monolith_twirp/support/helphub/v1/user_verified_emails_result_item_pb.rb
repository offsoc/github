# Generated by the protocol buffer compiler.  DO NOT EDIT!
# source: helphub/v1/user_verified_emails_result_item.proto

require 'google/protobuf'

require_relative '../../helphub/v1/email_visibility_pb'
Google::Protobuf::DescriptorPool.generated_pool.build do
  add_file("helphub/v1/user_verified_emails_result_item.proto", :syntax => :proto3) do
    add_message "support.helphub.v1.UserVerifiedEmailsResultItem" do
      optional :email, :string, 1
      optional :is_primary, :bool, 2
      optional :visibility, :enum, 3, "support.helphub.v1.EmailVisibility"
    end
  end
end

module MonolithTwirp
  module Support
    module HelpHub
      module V1
        UserVerifiedEmailsResultItem = ::Google::Protobuf::DescriptorPool.generated_pool.lookup("support.helphub.v1.UserVerifiedEmailsResultItem").msgclass
      end
    end
  end
end
