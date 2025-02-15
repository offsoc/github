# typed: true

# DO NOT EDIT MANUALLY
# This is an autogenerated file for dynamic methods in `Hydro::Schemas::Github::V1::GraphQLQuery::Origin`.
# Please instead update this file by running `bin/tapioca dsl Hydro::Schemas::Github::V1::GraphQLQuery::Origin`.

module Hydro::Schemas::Github::V1::GraphQLQuery::Origin
  class << self
    sig { returns(Google::Protobuf::EnumDescriptor) }
    def descriptor; end

    sig { params(number: Integer).returns(T.nilable(Symbol)) }
    def lookup(number); end

    sig { params(symbol: Symbol).returns(T.nilable(Integer)) }
    def resolve(symbol); end
  end
end

Hydro::Schemas::Github::V1::GraphQLQuery::Origin::GRAPHQL_API = 1
Hydro::Schemas::Github::V1::GraphQLQuery::Origin::INTERNAL = 3
Hydro::Schemas::Github::V1::GraphQLQuery::Origin::MANUAL_EXECUTION = 4
Hydro::Schemas::Github::V1::GraphQLQuery::Origin::ORIGIN_UNKNOWN = 0
Hydro::Schemas::Github::V1::GraphQLQuery::Origin::REST_API = 2
