# typed: true

# DO NOT EDIT MANUALLY
# This is an autogenerated file for dynamic methods in `Hydro::Schemas::Github::V1::UserDashboardShortcutCreate::SearchType`.
# Please instead update this file by running `bin/tapioca dsl Hydro::Schemas::Github::V1::UserDashboardShortcutCreate::SearchType`.

module Hydro::Schemas::Github::V1::UserDashboardShortcutCreate::SearchType
  class << self
    sig { returns(Google::Protobuf::EnumDescriptor) }
    def descriptor; end

    sig { params(number: Integer).returns(T.nilable(Symbol)) }
    def lookup(number); end

    sig { params(symbol: Symbol).returns(T.nilable(Integer)) }
    def resolve(symbol); end
  end
end

Hydro::Schemas::Github::V1::UserDashboardShortcutCreate::SearchType::DISCUSSIONS = 3
Hydro::Schemas::Github::V1::UserDashboardShortcutCreate::SearchType::ISSUES = 1
Hydro::Schemas::Github::V1::UserDashboardShortcutCreate::SearchType::PULL_REQUESTS = 2
Hydro::Schemas::Github::V1::UserDashboardShortcutCreate::SearchType::TYPE_UNKNOWN = 0
