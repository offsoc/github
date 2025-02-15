# typed: true

# DO NOT EDIT MANUALLY
# This is an autogenerated file for dynamic methods in `MonolithTwirp::Copilotapi::Agents::V1::ListAuthorizedAgentsForUserResponse`.
# Please instead update this file by running `bin/tapioca dsl MonolithTwirp::Copilotapi::Agents::V1::ListAuthorizedAgentsForUserResponse`.

class MonolithTwirp::Copilotapi::Agents::V1::ListAuthorizedAgentsForUserResponse
  sig do
    params(
      app_configs: T.nilable(T.any(Google::Protobuf::RepeatedField[MonolithTwirp::Copilotapi::Agents::V1::CopilotAppConfig], T::Array[MonolithTwirp::Copilotapi::Agents::V1::CopilotAppConfig]))
    ).void
  end
  def initialize(app_configs: T.unsafe(nil)); end

  sig { returns(Google::Protobuf::RepeatedField[MonolithTwirp::Copilotapi::Agents::V1::CopilotAppConfig]) }
  def app_configs; end

  sig { params(value: Google::Protobuf::RepeatedField[MonolithTwirp::Copilotapi::Agents::V1::CopilotAppConfig]).void }
  def app_configs=(value); end

  sig { void }
  def clear_app_configs; end
end
