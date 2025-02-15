# typed: true

# DO NOT EDIT MANUALLY
# This is an autogenerated file for dynamic methods in `Github::DependencyGraphPlatform::Reachability::V1::JobStatus`.
# Please instead update this file by running `bin/tapioca dsl Github::DependencyGraphPlatform::Reachability::V1::JobStatus`.

module Github::DependencyGraphPlatform::Reachability::V1::JobStatus
  class << self
    sig { returns(Google::Protobuf::EnumDescriptor) }
    def descriptor; end

    sig { params(number: Integer).returns(T.nilable(Symbol)) }
    def lookup(number); end

    sig { params(symbol: Symbol).returns(T.nilable(Integer)) }
    def resolve(symbol); end
  end
end

Github::DependencyGraphPlatform::Reachability::V1::JobStatus::JOB_STATUS_COMPLETED = 1
Github::DependencyGraphPlatform::Reachability::V1::JobStatus::JOB_STATUS_FAILED = 2
Github::DependencyGraphPlatform::Reachability::V1::JobStatus::JOB_STATUS_PROCESSING = 0
