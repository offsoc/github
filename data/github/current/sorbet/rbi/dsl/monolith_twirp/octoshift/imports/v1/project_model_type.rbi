# typed: true

# DO NOT EDIT MANUALLY
# This is an autogenerated file for dynamic methods in `MonolithTwirp::Octoshift::Imports::V1::ProjectModelType`.
# Please instead update this file by running `bin/tapioca dsl MonolithTwirp::Octoshift::Imports::V1::ProjectModelType`.

module MonolithTwirp::Octoshift::Imports::V1::ProjectModelType
  class << self
    sig { returns(Google::Protobuf::EnumDescriptor) }
    def descriptor; end

    sig { params(number: Integer).returns(T.nilable(Symbol)) }
    def lookup(number); end

    sig { params(symbol: Symbol).returns(T.nilable(Integer)) }
    def resolve(symbol); end
  end
end

MonolithTwirp::Octoshift::Imports::V1::ProjectModelType::PROJECT_MODEL_TYPE_INVALID = 0
MonolithTwirp::Octoshift::Imports::V1::ProjectModelType::PROJECT_MODEL_TYPE_PROJECT_CARD = 2
MonolithTwirp::Octoshift::Imports::V1::ProjectModelType::PROJECT_MODEL_TYPE_PROJECT_COLUMN = 1
MonolithTwirp::Octoshift::Imports::V1::ProjectModelType::PROJECT_MODEL_TYPE_PROJECT_WORKFLOW = 3
MonolithTwirp::Octoshift::Imports::V1::ProjectModelType::PROJECT_MODEL_TYPE_PROJECT_WORKFLOW_ACTION = 4
