# Generated by the protocol buffer compiler.  DO NOT EDIT!
# source: core/v1/repo_sharing_policy.proto

require 'google/protobuf'

Google::Protobuf::DescriptorPool.generated_pool.build do
  add_file("core/v1/repo_sharing_policy.proto", :syntax => :proto3) do
    add_enum "registrymetadata.core.v1.ActionRepoSharingPolicy" do
      value :ACTION_REPO_SHARING_POLICY_INVALID, 0
      value :ACTION_REPO_SHARING_POLICY_NONE, 1
      value :ACTION_REPO_SHARING_POLICY_ACCESSIBLE_SAME_USER, 2
      value :ACTION_REPO_SHARING_POLICY_ACCESSIBLE_SAME_ORG, 3
      value :ACTION_REPO_SHARING_POLICY_ACCESSIBLE_SAME_BUSINESS, 4
    end
  end
end

module MonolithTwirp
  module Registrymetadata
    module Core
      module V1
        ActionRepoSharingPolicy = ::Google::Protobuf::DescriptorPool.generated_pool.lookup("registrymetadata.core.v1.ActionRepoSharingPolicy").enummodule
      end
    end
  end
end
