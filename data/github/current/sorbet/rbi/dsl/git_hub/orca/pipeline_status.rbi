# typed: true

# DO NOT EDIT MANUALLY
# This is an autogenerated file for dynamic methods in `GitHub::Orca::PipelineStatus`.
# Please instead update this file by running `bin/tapioca dsl GitHub::Orca::PipelineStatus`.

module GitHub::Orca::PipelineStatus
  class << self
    sig { returns(Google::Protobuf::EnumDescriptor) }
    def descriptor; end

    sig { params(number: Integer).returns(T.nilable(Symbol)) }
    def lookup(number); end

    sig { params(symbol: Symbol).returns(T.nilable(Integer)) }
    def resolve(symbol); end
  end
end

GitHub::Orca::PipelineStatus::PIPELINE_STATUS_CANCELED = 6
GitHub::Orca::PipelineStatus::PIPELINE_STATUS_CANCELING = 5
GitHub::Orca::PipelineStatus::PIPELINE_STATUS_COMPLETED = 3
GitHub::Orca::PipelineStatus::PIPELINE_STATUS_DELETED = 9
GitHub::Orca::PipelineStatus::PIPELINE_STATUS_DELETING = 8
GitHub::Orca::PipelineStatus::PIPELINE_STATUS_ENQUEUED = 1
GitHub::Orca::PipelineStatus::PIPELINE_STATUS_FAILED = 4
GitHub::Orca::PipelineStatus::PIPELINE_STATUS_INACTIVE = 7
GitHub::Orca::PipelineStatus::PIPELINE_STATUS_STARTED = 2
GitHub::Orca::PipelineStatus::PIPELINE_STATUS_UNSPECIFIED = 0
