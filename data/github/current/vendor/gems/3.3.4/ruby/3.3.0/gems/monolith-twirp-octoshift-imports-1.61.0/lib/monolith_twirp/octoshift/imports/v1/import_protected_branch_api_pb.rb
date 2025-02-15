# Generated by the protocol buffer compiler.  DO NOT EDIT!
# source: imports/v1/import_protected_branch_api.proto

require 'google/protobuf'

require 'google/protobuf/wrappers_pb'
require_relative '../../imports/v1/protected_branch_pb'
Google::Protobuf::DescriptorPool.generated_pool.build do
  add_file("imports/v1/import_protected_branch_api.proto", :syntax => :proto3) do
    add_message "octoshift.imports.v1.ImportProtectedBranchRequest" do
      optional :repository_id, :int64, 1
      optional :name, :string, 2
      optional :requires_approving_reviews, :message, 3, "google.protobuf.BoolValue"
      optional :required_approving_review_count, :message, 4, "google.protobuf.Int32Value"
      optional :requires_commit_signatures, :message, 5, "google.protobuf.BoolValue"
      optional :requires_linear_history, :message, 6, "google.protobuf.BoolValue"
      optional :allows_force_pushes, :message, 7, "google.protobuf.BoolValue"
      optional :allows_deletions, :message, 8, "google.protobuf.BoolValue"
      optional :is_admin_enforced, :message, 9, "google.protobuf.BoolValue"
      optional :requires_status_checks, :message, 10, "google.protobuf.BoolValue"
      optional :requires_strict_status_checks, :message, 11, "google.protobuf.BoolValue"
      optional :requires_code_owner_reviews, :message, 12, "google.protobuf.BoolValue"
      optional :dismisses_stale_reviews, :message, 13, "google.protobuf.BoolValue"
      optional :restricts_review_dismissals, :message, 14, "google.protobuf.BoolValue"
      optional :restricts_pushes, :message, 15, "google.protobuf.BoolValue"
      repeated :required_status_check_contexts, :string, 16
      optional :requires_review_thread_resolution, :message, 17, "google.protobuf.BoolValue"
      optional :require_last_push_approval, :message, 18, "google.protobuf.BoolValue"
    end
    add_message "octoshift.imports.v1.ImportProtectedBranchResponse" do
      optional :protected_branch, :message, 1, "octoshift.imports.v1.ProtectedBranch"
    end
  end
end

module MonolithTwirp
  module Octoshift
    module Imports
      module V1
        ImportProtectedBranchRequest = ::Google::Protobuf::DescriptorPool.generated_pool.lookup("octoshift.imports.v1.ImportProtectedBranchRequest").msgclass
        ImportProtectedBranchResponse = ::Google::Protobuf::DescriptorPool.generated_pool.lookup("octoshift.imports.v1.ImportProtectedBranchResponse").msgclass
      end
    end
  end
end
