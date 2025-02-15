# typed: true

# DO NOT EDIT MANUALLY
# This is an autogenerated file for dynamic methods in `Hydro::Schemas::Github::V1::UserDashboardShortcutDestroy::Context`.
# Please instead update this file by running `bin/tapioca dsl Hydro::Schemas::Github::V1::UserDashboardShortcutDestroy::Context`.

module Hydro::Schemas::Github::V1::UserDashboardShortcutDestroy::Context
  class << self
    sig { returns(Google::Protobuf::EnumDescriptor) }
    def descriptor; end

    sig { params(number: Integer).returns(T.nilable(Symbol)) }
    def lookup(number); end

    sig { params(symbol: Symbol).returns(T.nilable(Integer)) }
    def resolve(symbol); end
  end
end

Hydro::Schemas::Github::V1::UserDashboardShortcutDestroy::Context::CONTEXT_UNKNOWN = 0
Hydro::Schemas::Github::V1::UserDashboardShortcutDestroy::Context::MOBILE = 2
Hydro::Schemas::Github::V1::UserDashboardShortcutDestroy::Context::WEB = 1
