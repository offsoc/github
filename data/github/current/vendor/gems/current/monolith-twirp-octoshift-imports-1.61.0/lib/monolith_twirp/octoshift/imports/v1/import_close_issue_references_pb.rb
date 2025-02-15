# Generated by the protocol buffer compiler.  DO NOT EDIT!
# source: imports/v1/import_close_issue_references.proto

require 'google/protobuf'

require_relative '../../imports/v1/batch_validation_error_pb'
Google::Protobuf::DescriptorPool.generated_pool.build do
  add_file("imports/v1/import_close_issue_references.proto", :syntax => :proto3) do
    add_message "octoshift.imports.v1.ImportCloseIssueReferencesRequest" do
      repeated :close_issue_references, :message, 1, "octoshift.imports.v1.CloseIssueReference"
    end
    add_message "octoshift.imports.v1.CloseIssueReference" do
      optional :pull_request_id, :int64, 1
      optional :issue_id, :int64, 2
    end
    add_message "octoshift.imports.v1.ImportCloseIssueReferencesResponse" do
      repeated :batch_validation_errors, :message, 1, "octoshift.imports.v1.BatchValidationError"
    end
  end
end

module MonolithTwirp
  module Octoshift
    module Imports
      module V1
        ImportCloseIssueReferencesRequest = ::Google::Protobuf::DescriptorPool.generated_pool.lookup("octoshift.imports.v1.ImportCloseIssueReferencesRequest").msgclass
        CloseIssueReference = ::Google::Protobuf::DescriptorPool.generated_pool.lookup("octoshift.imports.v1.CloseIssueReference").msgclass
        ImportCloseIssueReferencesResponse = ::Google::Protobuf::DescriptorPool.generated_pool.lookup("octoshift.imports.v1.ImportCloseIssueReferencesResponse").msgclass
      end
    end
  end
end
