# typed: true

# DO NOT EDIT MANUALLY
# This is an autogenerated file for dynamic methods in `Hydro::Schemas::Github::V1::Entities::IssueType::Color`.
# Please instead update this file by running `bin/tapioca dsl Hydro::Schemas::Github::V1::Entities::IssueType::Color`.

module Hydro::Schemas::Github::V1::Entities::IssueType::Color
  class << self
    sig { returns(Google::Protobuf::EnumDescriptor) }
    def descriptor; end

    sig { params(number: Integer).returns(T.nilable(Symbol)) }
    def lookup(number); end

    sig { params(symbol: Symbol).returns(T.nilable(Integer)) }
    def resolve(symbol); end
  end
end

Hydro::Schemas::Github::V1::Entities::IssueType::Color::BLUE = 2
Hydro::Schemas::Github::V1::Entities::IssueType::Color::COLOR_UNKNOWN = 0
Hydro::Schemas::Github::V1::Entities::IssueType::Color::GRAY = 1
Hydro::Schemas::Github::V1::Entities::IssueType::Color::GREEN = 3
Hydro::Schemas::Github::V1::Entities::IssueType::Color::ORANGE = 5
Hydro::Schemas::Github::V1::Entities::IssueType::Color::PINK = 7
Hydro::Schemas::Github::V1::Entities::IssueType::Color::PURPLE = 8
Hydro::Schemas::Github::V1::Entities::IssueType::Color::RED = 6
Hydro::Schemas::Github::V1::Entities::IssueType::Color::YELLOW = 4
