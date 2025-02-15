# Generated by the protocol buffer compiler.  DO NOT EDIT!
# source: core/v1/resolve_actions_api.proto

require 'google/protobuf'

Google::Protobuf::DescriptorPool.generated_pool.build do
  add_file("core/v1/resolve_actions_api.proto", :syntax => :proto3) do
    add_message "actions.core.v1.ResolveActionsRequest" do
      repeated :actions, :message, 1, "actions.core.v1.Action"
      optional :workflow_run_id, :int64, 2
      optional :job_id, :string, 3
      optional :workflow_repo_id, :int64, 4
      optional :should_instrument_request, :bool, 6
    end
    add_message "actions.core.v1.Action" do
      optional :nwo, :string, 1
      optional :ref, :string, 2
    end
    add_message "actions.core.v1.ResolveActionsResponse" do
      repeated :resolved_actions, :message, 1, "actions.core.v1.ResolvedActionContent"
    end
    add_message "actions.core.v1.ResolvedActionContent" do
      oneof :resolved_action_content do
        optional :resolved_action, :message, 1, "actions.core.v1.ResolvedAction"
        optional :error, :message, 2, "actions.core.v1.ResolveActionError"
      end
    end
    add_message "actions.core.v1.ResolvedAction" do
      optional :name, :string, 1
      optional :resolved_name, :string, 2
      optional :resolved_sha, :string, 3
      optional :tar_url, :string, 4
      optional :zip_url, :string, 5
      optional :ref, :string, 6
      optional :visibility, :string, 7
      optional :resolved_ref, :string, 8
      optional :id, :int64, 9
      optional :resolve_strategy, :enum, 10, "actions.core.v1.ResolveStrategy"
    end
    add_message "actions.core.v1.ResolveActionError" do
      optional :error_code, :int64, 1
      optional :error_message, :string, 2
    end
    add_enum "actions.core.v1.ResolveStrategy" do
      value :RESOLVE_STRATEGY_INVALID, 0
      value :RESOLVE_STRATEGY_REPOSITORY, 1
      value :RESOLVE_STRATEGY_PACKAGE, 2
    end
  end
end

module MonolithTwirp
  module Actions
    module Core
      module V1
        ResolveActionsRequest = ::Google::Protobuf::DescriptorPool.generated_pool.lookup("actions.core.v1.ResolveActionsRequest").msgclass
        Action = ::Google::Protobuf::DescriptorPool.generated_pool.lookup("actions.core.v1.Action").msgclass
        ResolveActionsResponse = ::Google::Protobuf::DescriptorPool.generated_pool.lookup("actions.core.v1.ResolveActionsResponse").msgclass
        ResolvedActionContent = ::Google::Protobuf::DescriptorPool.generated_pool.lookup("actions.core.v1.ResolvedActionContent").msgclass
        ResolvedAction = ::Google::Protobuf::DescriptorPool.generated_pool.lookup("actions.core.v1.ResolvedAction").msgclass
        ResolveActionError = ::Google::Protobuf::DescriptorPool.generated_pool.lookup("actions.core.v1.ResolveActionError").msgclass
        ResolveStrategy = ::Google::Protobuf::DescriptorPool.generated_pool.lookup("actions.core.v1.ResolveStrategy").enummodule
      end
    end
  end
end
