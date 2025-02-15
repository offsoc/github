# typed: true

# DO NOT EDIT MANUALLY
# This is an autogenerated file for dynamic methods in `Hydro::Schemas::Github::Permissions::V0::Created::ActorType`.
# Please instead update this file by running `bin/tapioca dsl Hydro::Schemas::Github::Permissions::V0::Created::ActorType`.

module Hydro::Schemas::Github::Permissions::V0::Created::ActorType
  class << self
    sig { returns(Google::Protobuf::EnumDescriptor) }
    def descriptor; end

    sig { params(number: Integer).returns(T.nilable(Symbol)) }
    def lookup(number); end

    sig { params(symbol: Symbol).returns(T.nilable(Integer)) }
    def resolve(symbol); end
  end
end

Hydro::Schemas::Github::Permissions::V0::Created::ActorType::ACTOR_TYPE_INTEGRATION_INSTALLATION = 1
Hydro::Schemas::Github::Permissions::V0::Created::ActorType::ACTOR_TYPE_OAUTH_AUTHORIZATION = 2
Hydro::Schemas::Github::Permissions::V0::Created::ActorType::ACTOR_TYPE_ORGANIZATION_PROGRAMMATIC_ACCESS_GRANT = 3
Hydro::Schemas::Github::Permissions::V0::Created::ActorType::ACTOR_TYPE_ORGANIZATION_PROGRAMMATIC_ACCESS_GRANT_REQUEST = 9
Hydro::Schemas::Github::Permissions::V0::Created::ActorType::ACTOR_TYPE_SCOPED_INTEGRATION_INSTALLATION = 4
Hydro::Schemas::Github::Permissions::V0::Created::ActorType::ACTOR_TYPE_SITE_SCOPED_INTEGRATION_INSTALLATION = 5
Hydro::Schemas::Github::Permissions::V0::Created::ActorType::ACTOR_TYPE_UNKNOWN = 0
Hydro::Schemas::Github::Permissions::V0::Created::ActorType::ACTOR_TYPE_USER = 6
Hydro::Schemas::Github::Permissions::V0::Created::ActorType::ACTOR_TYPE_USER_PROGRAMMATIC_ACCESS_GRANT = 7
Hydro::Schemas::Github::Permissions::V0::Created::ActorType::ACTOR_TYPE_USER_PROGRAMMATIC_ACCESS_GRANT_REQUEST = 8
