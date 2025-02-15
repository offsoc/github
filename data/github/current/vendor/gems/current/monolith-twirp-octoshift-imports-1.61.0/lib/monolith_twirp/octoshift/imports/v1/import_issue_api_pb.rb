# Generated by the protocol buffer compiler.  DO NOT EDIT!
# source: imports/v1/import_issue_api.proto

require 'google/protobuf'

require_relative '../../imports/v1/issue_pb'
require 'google/protobuf/timestamp_pb'
require 'google/protobuf/wrappers_pb'
Google::Protobuf::DescriptorPool.generated_pool.build do
  add_file("imports/v1/import_issue_api.proto", :syntax => :proto3) do
    add_message "octoshift.imports.v1.ImportIssueRequest" do
      optional :author_login, :string, 1
      optional :import_id, :int64, 2
      optional :repository_id, :int64, 3
      optional :title, :string, 4
      optional :body, :string, 5
      optional :number, :int64, 6
      optional :created_at, :message, 7, "google.protobuf.Timestamp"
      optional :updated_at, :message, 8, "google.protobuf.Timestamp"
      optional :closed_at, :message, 9, "google.protobuf.Timestamp"
      optional :milestone_id, :message, 10, "google.protobuf.Int64Value"
      repeated :assignees, :string, 11
    end
    add_message "octoshift.imports.v1.ImportIssueResponse" do
      optional :issue, :message, 1, "octoshift.imports.v1.Issue"
    end
  end
end

module MonolithTwirp
  module Octoshift
    module Imports
      module V1
        ImportIssueRequest = ::Google::Protobuf::DescriptorPool.generated_pool.lookup("octoshift.imports.v1.ImportIssueRequest").msgclass
        ImportIssueResponse = ::Google::Protobuf::DescriptorPool.generated_pool.lookup("octoshift.imports.v1.ImportIssueResponse").msgclass
      end
    end
  end
end
