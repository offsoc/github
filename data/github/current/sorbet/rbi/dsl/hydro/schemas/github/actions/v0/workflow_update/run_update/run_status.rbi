# typed: true

# DO NOT EDIT MANUALLY
# This is an autogenerated file for dynamic methods in `Hydro::Schemas::Github::Actions::V0::WorkflowUpdate::RunUpdate::RunStatus`.
# Please instead update this file by running `bin/tapioca dsl Hydro::Schemas::Github::Actions::V0::WorkflowUpdate::RunUpdate::RunStatus`.

module Hydro::Schemas::Github::Actions::V0::WorkflowUpdate::RunUpdate::RunStatus
  class << self
    sig { returns(Google::Protobuf::EnumDescriptor) }
    def descriptor; end

    sig { params(number: Integer).returns(T.nilable(Symbol)) }
    def lookup(number); end

    sig { params(symbol: Symbol).returns(T.nilable(Integer)) }
    def resolve(symbol); end
  end
end

Hydro::Schemas::Github::Actions::V0::WorkflowUpdate::RunUpdate::RunStatus::STATUS_COMPLETED = 2
Hydro::Schemas::Github::Actions::V0::WorkflowUpdate::RunUpdate::RunStatus::STATUS_PENDING = 1
Hydro::Schemas::Github::Actions::V0::WorkflowUpdate::RunUpdate::RunStatus::STATUS_UNKNOWN = 0
