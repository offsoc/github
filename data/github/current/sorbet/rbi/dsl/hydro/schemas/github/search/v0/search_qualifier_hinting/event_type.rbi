# typed: true

# DO NOT EDIT MANUALLY
# This is an autogenerated file for dynamic methods in `Hydro::Schemas::Github::Search::V0::SearchQualifierHinting::EventType`.
# Please instead update this file by running `bin/tapioca dsl Hydro::Schemas::Github::Search::V0::SearchQualifierHinting::EventType`.

module Hydro::Schemas::Github::Search::V0::SearchQualifierHinting::EventType
  class << self
    sig { returns(Google::Protobuf::EnumDescriptor) }
    def descriptor; end

    sig { params(number: Integer).returns(T.nilable(Symbol)) }
    def lookup(number); end

    sig { params(symbol: Symbol).returns(T.nilable(Integer)) }
    def resolve(symbol); end
  end
end

Hydro::Schemas::Github::Search::V0::SearchQualifierHinting::EventType::ACTIVATE = 1
Hydro::Schemas::Github::Search::V0::SearchQualifierHinting::EventType::COLON_TRIGGER = 2
Hydro::Schemas::Github::Search::V0::SearchQualifierHinting::EventType::DEACTIVATE = 7
Hydro::Schemas::Github::Search::V0::SearchQualifierHinting::EventType::FILTER_SELECT = 3
Hydro::Schemas::Github::Search::V0::SearchQualifierHinting::EventType::FILTER_TYPED = 8
Hydro::Schemas::Github::Search::V0::SearchQualifierHinting::EventType::JUMP_TO_SUBMIT = 5
Hydro::Schemas::Github::Search::V0::SearchQualifierHinting::EventType::SEARCH_CLEAR = 6
Hydro::Schemas::Github::Search::V0::SearchQualifierHinting::EventType::SEARCH_SUBMIT = 4
Hydro::Schemas::Github::Search::V0::SearchQualifierHinting::EventType::UNKNOWN = 0
