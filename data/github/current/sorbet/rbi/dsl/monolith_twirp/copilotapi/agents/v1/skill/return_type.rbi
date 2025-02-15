# typed: true

# DO NOT EDIT MANUALLY
# This is an autogenerated file for dynamic methods in `MonolithTwirp::Copilotapi::Agents::V1::Skill::ReturnType`.
# Please instead update this file by running `bin/tapioca dsl MonolithTwirp::Copilotapi::Agents::V1::Skill::ReturnType`.

module MonolithTwirp::Copilotapi::Agents::V1::Skill::ReturnType
  class << self
    sig { returns(Google::Protobuf::EnumDescriptor) }
    def descriptor; end

    sig { params(number: Integer).returns(T.nilable(Symbol)) }
    def lookup(number); end

    sig { params(symbol: Symbol).returns(T.nilable(Integer)) }
    def resolve(symbol); end
  end
end

MonolithTwirp::Copilotapi::Agents::V1::Skill::ReturnType::RETURN_TYPE_GITHUB_REFERENCE_JSON = 2
MonolithTwirp::Copilotapi::Agents::V1::Skill::ReturnType::RETURN_TYPE_INVALID = 0
MonolithTwirp::Copilotapi::Agents::V1::Skill::ReturnType::RETURN_TYPE_STRING = 1
