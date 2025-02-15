# typed: true

# DO NOT EDIT MANUALLY
# This is an autogenerated file for dynamic methods in `Hydro::Schemas::Github::Copilot::V1::CopilotRepositoryCheckRequest`.
# Please instead update this file by running `bin/tapioca dsl Hydro::Schemas::Github::Copilot::V1::CopilotRepositoryCheckRequest`.

class Hydro::Schemas::Github::Copilot::V1::CopilotRepositoryCheckRequest
  sig do
    params(
      actor: T.nilable(Hydro::Schemas::Github::V1::Entities::User),
      actor_analytics_tracking_id: T.nilable(String),
      copilot_access_type: T.nilable(T.any(Symbol, Integer)),
      copilot_user_details: T.nilable(Hydro::Schemas::Github::Copilot::V1::Entities::CopilotUserDetails),
      editor_plugin_version: T.nilable(String),
      editor_version: T.nilable(String),
      other_free_access_type: T.nilable(String),
      repository_checks: T.nilable(T.any(Google::Protobuf::RepeatedField[Hydro::Schemas::Github::Copilot::V1::Entities::CopilotRepositoryCheck], T::Array[Hydro::Schemas::Github::Copilot::V1::Entities::CopilotRepositoryCheck])),
      request_context: T.nilable(Hydro::Schemas::Github::V1::Entities::RequestContext)
    ).void
  end
  def initialize(actor: nil, actor_analytics_tracking_id: nil, copilot_access_type: nil, copilot_user_details: nil, editor_plugin_version: nil, editor_version: nil, other_free_access_type: nil, repository_checks: T.unsafe(nil), request_context: nil); end

  sig { returns(T.nilable(Hydro::Schemas::Github::V1::Entities::User)) }
  def actor; end

  sig { params(value: T.nilable(Hydro::Schemas::Github::V1::Entities::User)).void }
  def actor=(value); end

  sig { returns(String) }
  def actor_analytics_tracking_id; end

  sig { params(value: String).void }
  def actor_analytics_tracking_id=(value); end

  sig { void }
  def clear_actor; end

  sig { void }
  def clear_actor_analytics_tracking_id; end

  sig { void }
  def clear_copilot_access_type; end

  sig { void }
  def clear_copilot_user_details; end

  sig { void }
  def clear_editor_plugin_version; end

  sig { void }
  def clear_editor_version; end

  sig { void }
  def clear_other_free_access_type; end

  sig { void }
  def clear_repository_checks; end

  sig { void }
  def clear_request_context; end

  sig { returns(T.any(Symbol, Integer)) }
  def copilot_access_type; end

  sig { params(value: T.any(Symbol, Integer)).void }
  def copilot_access_type=(value); end

  sig { returns(T.nilable(Hydro::Schemas::Github::Copilot::V1::Entities::CopilotUserDetails)) }
  def copilot_user_details; end

  sig { params(value: T.nilable(Hydro::Schemas::Github::Copilot::V1::Entities::CopilotUserDetails)).void }
  def copilot_user_details=(value); end

  sig { returns(String) }
  def editor_plugin_version; end

  sig { params(value: String).void }
  def editor_plugin_version=(value); end

  sig { returns(String) }
  def editor_version; end

  sig { params(value: String).void }
  def editor_version=(value); end

  sig { returns(String) }
  def other_free_access_type; end

  sig { params(value: String).void }
  def other_free_access_type=(value); end

  sig do
    returns(Google::Protobuf::RepeatedField[Hydro::Schemas::Github::Copilot::V1::Entities::CopilotRepositoryCheck])
  end
  def repository_checks; end

  sig do
    params(
      value: Google::Protobuf::RepeatedField[Hydro::Schemas::Github::Copilot::V1::Entities::CopilotRepositoryCheck]
    ).void
  end
  def repository_checks=(value); end

  sig { returns(T.nilable(Hydro::Schemas::Github::V1::Entities::RequestContext)) }
  def request_context; end

  sig { params(value: T.nilable(Hydro::Schemas::Github::V1::Entities::RequestContext)).void }
  def request_context=(value); end
end
