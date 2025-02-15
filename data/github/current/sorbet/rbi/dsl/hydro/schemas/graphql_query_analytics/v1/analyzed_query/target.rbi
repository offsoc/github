# typed: true

# DO NOT EDIT MANUALLY
# This is an autogenerated file for dynamic methods in `Hydro::Schemas::GraphqlQueryAnalytics::V1::AnalyzedQuery::Target`.
# Please instead update this file by running `bin/tapioca dsl Hydro::Schemas::GraphqlQueryAnalytics::V1::AnalyzedQuery::Target`.

module Hydro::Schemas::GraphqlQueryAnalytics::V1::AnalyzedQuery::Target
  class << self
    sig { returns(Google::Protobuf::EnumDescriptor) }
    def descriptor; end

    sig { params(number: Integer).returns(T.nilable(Symbol)) }
    def lookup(number); end

    sig { params(symbol: Symbol).returns(T.nilable(Integer)) }
    def resolve(symbol); end
  end
end

Hydro::Schemas::GraphqlQueryAnalytics::V1::AnalyzedQuery::Target::INTERNAL_SCHEMA = 1
Hydro::Schemas::GraphqlQueryAnalytics::V1::AnalyzedQuery::Target::PUBLIC_SCHEMA = 2
Hydro::Schemas::GraphqlQueryAnalytics::V1::AnalyzedQuery::Target::TARGET_UNKOWN = 0
