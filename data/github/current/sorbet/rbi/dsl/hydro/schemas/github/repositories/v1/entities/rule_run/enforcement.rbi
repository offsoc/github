# typed: true

# DO NOT EDIT MANUALLY
# This is an autogenerated file for dynamic methods in `Hydro::Schemas::Github::Repositories::V1::Entities::RuleRun::Enforcement`.
# Please instead update this file by running `bin/tapioca dsl Hydro::Schemas::Github::Repositories::V1::Entities::RuleRun::Enforcement`.

module Hydro::Schemas::Github::Repositories::V1::Entities::RuleRun::Enforcement
  class << self
    sig { returns(Google::Protobuf::EnumDescriptor) }
    def descriptor; end

    sig { params(number: Integer).returns(T.nilable(Symbol)) }
    def lookup(number); end

    sig { params(symbol: Symbol).returns(T.nilable(Integer)) }
    def resolve(symbol); end
  end
end

Hydro::Schemas::Github::Repositories::V1::Entities::RuleRun::Enforcement::DISABLED = 1
Hydro::Schemas::Github::Repositories::V1::Entities::RuleRun::Enforcement::ENABLED = 2
Hydro::Schemas::Github::Repositories::V1::Entities::RuleRun::Enforcement::ENFORCEMENT_UNKNOWN = 0
Hydro::Schemas::Github::Repositories::V1::Entities::RuleRun::Enforcement::EVALUATE = 3
