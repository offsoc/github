# typed: true

# DO NOT EDIT MANUALLY
# This is an autogenerated file for dynamic methods in `MonolithTwirp::Copilotapi::Agents::V1::CopilotAppConfig`.
# Please instead update this file by running `bin/tapioca dsl MonolithTwirp::Copilotapi::Agents::V1::CopilotAppConfig`.

class MonolithTwirp::Copilotapi::Agents::V1::CopilotAppConfig
  sig do
    params(
      agent_url: T.nilable(String),
      app_type: T.nilable(T.any(Symbol, Integer)),
      client_authorization_url: T.nilable(String),
      description: T.nilable(String),
      editor_context: T.nilable(T::Boolean),
      id: T.nilable(Integer),
      integration: T.nilable(MonolithTwirp::Copilotapi::Agents::V1::Integration),
      payload_secret: T.nilable(String),
      skills: T.nilable(T.any(Google::Protobuf::RepeatedField[MonolithTwirp::Copilotapi::Agents::V1::Skill], T::Array[MonolithTwirp::Copilotapi::Agents::V1::Skill]))
    ).void
  end
  def initialize(agent_url: nil, app_type: nil, client_authorization_url: nil, description: nil, editor_context: nil, id: nil, integration: nil, payload_secret: nil, skills: T.unsafe(nil)); end

  sig { returns(String) }
  def agent_url; end

  sig { params(value: String).void }
  def agent_url=(value); end

  sig { returns(T.any(Symbol, Integer)) }
  def app_type; end

  sig { params(value: T.any(Symbol, Integer)).void }
  def app_type=(value); end

  sig { void }
  def clear_agent_url; end

  sig { void }
  def clear_app_type; end

  sig { void }
  def clear_client_authorization_url; end

  sig { void }
  def clear_description; end

  sig { void }
  def clear_editor_context; end

  sig { void }
  def clear_id; end

  sig { void }
  def clear_integration; end

  sig { void }
  def clear_payload_secret; end

  sig { void }
  def clear_skills; end

  sig { returns(String) }
  def client_authorization_url; end

  sig { params(value: String).void }
  def client_authorization_url=(value); end

  sig { returns(String) }
  def description; end

  sig { params(value: String).void }
  def description=(value); end

  sig { returns(T::Boolean) }
  def editor_context; end

  sig { params(value: T::Boolean).void }
  def editor_context=(value); end

  sig { returns(Integer) }
  def id; end

  sig { params(value: Integer).void }
  def id=(value); end

  sig { returns(T.nilable(MonolithTwirp::Copilotapi::Agents::V1::Integration)) }
  def integration; end

  sig { params(value: T.nilable(MonolithTwirp::Copilotapi::Agents::V1::Integration)).void }
  def integration=(value); end

  sig { returns(String) }
  def payload_secret; end

  sig { params(value: String).void }
  def payload_secret=(value); end

  sig { returns(Google::Protobuf::RepeatedField[MonolithTwirp::Copilotapi::Agents::V1::Skill]) }
  def skills; end

  sig { params(value: Google::Protobuf::RepeatedField[MonolithTwirp::Copilotapi::Agents::V1::Skill]).void }
  def skills=(value); end
end
