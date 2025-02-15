# typed: true

# DO NOT EDIT MANUALLY
# This is an autogenerated file for dynamic methods in `Hydro::Schemas::Github::Copilot::V0::CopilotTokenGenerated`.
# Please instead update this file by running `bin/tapioca dsl Hydro::Schemas::Github::Copilot::V0::CopilotTokenGenerated`.

class Hydro::Schemas::Github::Copilot::V0::CopilotTokenGenerated
  sig do
    params(
      actor: T.nilable(Hydro::Schemas::Github::V1::Entities::User),
      actor_analytics_tracking_id: T.nilable(String),
      copilot_access_type: T.nilable(T.any(Symbol, Integer)),
      copilot_user_details: T.nilable(Hydro::Schemas::Github::Copilot::V1::Entities::CopilotUserDetails),
      editor_plugin_version: T.nilable(String),
      editor_version: T.nilable(String),
      enterprise_ids: T.nilable(String),
      expires_at: T.nilable(Google::Protobuf::Timestamp),
      free_enterprise_organization_name: T.nilable(String),
      organization_analytics_tracking_ids: T.nilable(String),
      other_free_access_type: T.nilable(String),
      partner_organization_name: T.nilable(String),
      request_context: T.nilable(Hydro::Schemas::Github::V1::Entities::RequestContext),
      source: T.nilable(String)
    ).void
  end
  def initialize(actor: nil, actor_analytics_tracking_id: nil, copilot_access_type: nil, copilot_user_details: nil, editor_plugin_version: nil, editor_version: nil, enterprise_ids: nil, expires_at: nil, free_enterprise_organization_name: nil, organization_analytics_tracking_ids: nil, other_free_access_type: nil, partner_organization_name: nil, request_context: nil, source: nil); end

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
  def clear_enterprise_ids; end

  sig { void }
  def clear_expires_at; end

  sig { void }
  def clear_free_enterprise_organization_name; end

  sig { void }
  def clear_organization_analytics_tracking_ids; end

  sig { void }
  def clear_other_free_access_type; end

  sig { void }
  def clear_partner_organization_name; end

  sig { void }
  def clear_request_context; end

  sig { void }
  def clear_source; end

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
  def enterprise_ids; end

  sig { params(value: String).void }
  def enterprise_ids=(value); end

  sig { returns(T.nilable(Google::Protobuf::Timestamp)) }
  def expires_at; end

  sig { params(value: T.nilable(Google::Protobuf::Timestamp)).void }
  def expires_at=(value); end

  sig { returns(String) }
  def free_enterprise_organization_name; end

  sig { params(value: String).void }
  def free_enterprise_organization_name=(value); end

  sig { returns(String) }
  def organization_analytics_tracking_ids; end

  sig { params(value: String).void }
  def organization_analytics_tracking_ids=(value); end

  sig { returns(String) }
  def other_free_access_type; end

  sig { params(value: String).void }
  def other_free_access_type=(value); end

  sig { returns(String) }
  def partner_organization_name; end

  sig { params(value: String).void }
  def partner_organization_name=(value); end

  sig { returns(T.nilable(Hydro::Schemas::Github::V1::Entities::RequestContext)) }
  def request_context; end

  sig { params(value: T.nilable(Hydro::Schemas::Github::V1::Entities::RequestContext)).void }
  def request_context=(value); end

  sig { returns(String) }
  def source; end

  sig { params(value: String).void }
  def source=(value); end
end
