# typed: true

# DO NOT EDIT MANUALLY
# This is an autogenerated file for dynamic methods in `Hydro::Schemas::Github::V1::RepositoryEmptyStateClick::EventTarget`.
# Please instead update this file by running `bin/tapioca dsl Hydro::Schemas::Github::V1::RepositoryEmptyStateClick::EventTarget`.

module Hydro::Schemas::Github::V1::RepositoryEmptyStateClick::EventTarget
  class << self
    sig { returns(Google::Protobuf::EnumDescriptor) }
    def descriptor; end

    sig { params(number: Integer).returns(T.nilable(Symbol)) }
    def lookup(number); end

    sig { params(symbol: Symbol).returns(T.nilable(Integer)) }
    def resolve(symbol); end
  end
end

Hydro::Schemas::Github::V1::RepositoryEmptyStateClick::EventTarget::ADD_TEAMS_AND_COLLABORATORS = 12
Hydro::Schemas::Github::V1::RepositoryEmptyStateClick::EventTarget::COPY_COMMANDS_FOR_CREATING_REPO = 9
Hydro::Schemas::Github::V1::RepositoryEmptyStateClick::EventTarget::COPY_COMMANDS_FOR_UPLOADING_REPO = 10
Hydro::Schemas::Github::V1::RepositoryEmptyStateClick::EventTarget::COPY_URL = 3
Hydro::Schemas::Github::V1::RepositoryEmptyStateClick::EventTarget::COPY_URL_HTTP = 1
Hydro::Schemas::Github::V1::RepositoryEmptyStateClick::EventTarget::COPY_URL_SSH = 2
Hydro::Schemas::Github::V1::RepositoryEmptyStateClick::EventTarget::CREATING_NEW_FILE = 4
Hydro::Schemas::Github::V1::RepositoryEmptyStateClick::EventTarget::GITIGNORE = 8
Hydro::Schemas::Github::V1::RepositoryEmptyStateClick::EventTarget::IMPORT_CODE = 11
Hydro::Schemas::Github::V1::RepositoryEmptyStateClick::EventTarget::LICENSE = 7
Hydro::Schemas::Github::V1::RepositoryEmptyStateClick::EventTarget::README = 6
Hydro::Schemas::Github::V1::RepositoryEmptyStateClick::EventTarget::SET_UP_IN_DESKTOP = 0
Hydro::Schemas::Github::V1::RepositoryEmptyStateClick::EventTarget::UPLOADING_EXISTING_FILE = 5
