# typed: true

# DO NOT EDIT MANUALLY
# This is an autogenerated file for dynamic methods in `Github::DependencySnapshotsApi::Entities::Push::ActivityType`.
# Please instead update this file by running `bin/tapioca dsl Github::DependencySnapshotsApi::Entities::Push::ActivityType`.

module Github::DependencySnapshotsApi::Entities::Push::ActivityType
  class << self
    sig { returns(Google::Protobuf::EnumDescriptor) }
    def descriptor; end

    sig { params(number: Integer).returns(T.nilable(Symbol)) }
    def lookup(number); end

    sig { params(symbol: Symbol).returns(T.nilable(Integer)) }
    def resolve(symbol); end
  end
end

Github::DependencySnapshotsApi::Entities::Push::ActivityType::BRANCH_CREATION = 2
Github::DependencySnapshotsApi::Entities::Push::ActivityType::BRANCH_DELETION = 3
Github::DependencySnapshotsApi::Entities::Push::ActivityType::DIRECT_PUSH = 5
Github::DependencySnapshotsApi::Entities::Push::ActivityType::FORCE_PUSH = 1
Github::DependencySnapshotsApi::Entities::Push::ActivityType::MERGE_QUEUE_MERGE = 6
Github::DependencySnapshotsApi::Entities::Push::ActivityType::PR_MERGE = 4
Github::DependencySnapshotsApi::Entities::Push::ActivityType::PUSH = 0
