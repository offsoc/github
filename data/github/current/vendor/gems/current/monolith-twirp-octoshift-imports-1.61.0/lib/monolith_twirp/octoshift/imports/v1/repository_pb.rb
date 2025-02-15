# Generated by the protocol buffer compiler.  DO NOT EDIT!
# source: imports/v1/repository.proto

require 'google/protobuf'

require 'google/protobuf/wrappers_pb'
Google::Protobuf::DescriptorPool.generated_pool.build do
  add_file("imports/v1/repository.proto", :syntax => :proto3) do
    add_message "octoshift.imports.v1.Repository" do
      optional :id, :int64, 1
      optional :owner_id, :int64, 2
      optional :name, :string, 3
      optional :visibility, :enum, 4, "octoshift.imports.v1.RepositoryVisibility"
      optional :ssh_push_url, :string, 5
      optional :default_branch, :string, 6
      optional :http_url, :string, 7
      optional :wiki_ssh_url, :message, 8, "google.protobuf.StringValue"
      optional :wiki_http_url, :message, 9, "google.protobuf.StringValue"
      optional :page_error_message, :string, 10
      repeated :security_setting_errors, :string, 11
      repeated :general_setting_errors, :string, 12
      optional :is_archived, :bool, 13
      optional :is_deleted, :bool, 14
    end
    add_enum "octoshift.imports.v1.RepositoryVisibility" do
      value :REPOSITORY_VISIBILITY_INVALID, 0
      value :REPOSITORY_VISIBILITY_PUBLIC, 1
      value :REPOSITORY_VISIBILITY_PRIVATE, 2
      value :REPOSITORY_VISIBILITY_INTERNAL, 3
    end
  end
end

module MonolithTwirp
  module Octoshift
    module Imports
      module V1
        Repository = ::Google::Protobuf::DescriptorPool.generated_pool.lookup("octoshift.imports.v1.Repository").msgclass
        RepositoryVisibility = ::Google::Protobuf::DescriptorPool.generated_pool.lookup("octoshift.imports.v1.RepositoryVisibility").enummodule
      end
    end
  end
end
