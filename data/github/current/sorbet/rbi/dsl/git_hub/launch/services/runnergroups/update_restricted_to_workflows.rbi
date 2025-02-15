# typed: true

# DO NOT EDIT MANUALLY
# This is an autogenerated file for dynamic methods in `GitHub::Launch::Services::Runnergroups::UpdateRestrictedToWorkflows`.
# Please instead update this file by running `bin/tapioca dsl GitHub::Launch::Services::Runnergroups::UpdateRestrictedToWorkflows`.

module GitHub::Launch::Services::Runnergroups::UpdateRestrictedToWorkflows
  class << self
    sig { returns(Google::Protobuf::EnumDescriptor) }
    def descriptor; end

    sig { params(number: Integer).returns(T.nilable(Symbol)) }
    def lookup(number); end

    sig { params(symbol: Symbol).returns(T.nilable(Integer)) }
    def resolve(symbol); end
  end
end

GitHub::Launch::Services::Runnergroups::UpdateRestrictedToWorkflows::RESTRICTED_TO_WORKFLOWS_RESTRICTED = 1
GitHub::Launch::Services::Runnergroups::UpdateRestrictedToWorkflows::RESTRICTED_TO_WORKFLOWS_UNKNOWN = 0
GitHub::Launch::Services::Runnergroups::UpdateRestrictedToWorkflows::RESTRICTED_TO_WORKFLOWS_UNRESTRICTED = 2
