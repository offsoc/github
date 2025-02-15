# typed: true

# DO NOT EDIT MANUALLY
# This is an autogenerated file for dynamic methods in `Hydro::Schemas::Github::Exp::V0::TasApiResponse::RandomizationUnit`.
# Please instead update this file by running `bin/tapioca dsl Hydro::Schemas::Github::Exp::V0::TasApiResponse::RandomizationUnit`.

module Hydro::Schemas::Github::Exp::V0::TasApiResponse::RandomizationUnit
  class << self
    sig { returns(Google::Protobuf::EnumDescriptor) }
    def descriptor; end

    sig { params(number: Integer).returns(T.nilable(Symbol)) }
    def lookup(number); end

    sig { params(symbol: Symbol).returns(T.nilable(Integer)) }
    def resolve(symbol); end
  end
end

Hydro::Schemas::Github::Exp::V0::TasApiResponse::RandomizationUnit::ACTOR = 1
Hydro::Schemas::Github::Exp::V0::TasApiResponse::RandomizationUnit::ORGANIZATION = 2
Hydro::Schemas::Github::Exp::V0::TasApiResponse::RandomizationUnit::REPOSITORY = 3
Hydro::Schemas::Github::Exp::V0::TasApiResponse::RandomizationUnit::UNKNOWN = 0
