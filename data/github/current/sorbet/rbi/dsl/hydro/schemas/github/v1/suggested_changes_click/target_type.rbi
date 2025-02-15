# typed: true

# DO NOT EDIT MANUALLY
# This is an autogenerated file for dynamic methods in `Hydro::Schemas::Github::V1::SuggestedChangesClick::TargetType`.
# Please instead update this file by running `bin/tapioca dsl Hydro::Schemas::Github::V1::SuggestedChangesClick::TargetType`.

module Hydro::Schemas::Github::V1::SuggestedChangesClick::TargetType
  class << self
    sig { returns(Google::Protobuf::EnumDescriptor) }
    def descriptor; end

    sig { params(number: Integer).returns(T.nilable(Symbol)) }
    def lookup(number); end

    sig { params(symbol: Symbol).returns(T.nilable(Integer)) }
    def resolve(symbol); end
  end
end

Hydro::Schemas::Github::V1::SuggestedChangesClick::TargetType::APPLY_SUGGESTION = 2
Hydro::Schemas::Github::V1::SuggestedChangesClick::TargetType::COMMIT_CHANGES = 3
Hydro::Schemas::Github::V1::SuggestedChangesClick::TargetType::INSERT_SUGGESTION = 1
Hydro::Schemas::Github::V1::SuggestedChangesClick::TargetType::TARGET_TYPE_UNKNOWN = 0
