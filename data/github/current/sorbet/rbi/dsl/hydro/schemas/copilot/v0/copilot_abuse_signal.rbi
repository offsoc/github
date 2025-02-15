# typed: true

# DO NOT EDIT MANUALLY
# This is an autogenerated file for dynamic methods in `Hydro::Schemas::Copilot::V0::CopilotAbuseSignal`.
# Please instead update this file by running `bin/tapioca dsl Hydro::Schemas::Copilot::V0::CopilotAbuseSignal`.

class Hydro::Schemas::Copilot::V0::CopilotAbuseSignal
  sig do
    params(
      access_type: T.nilable(String),
      blocking_reason: T.nilable(String),
      copilot_user_details: T.nilable(Hydro::Schemas::Github::Copilot::V1::Entities::CopilotUserDetails),
      integration_id: T.nilable(String),
      organization: T.nilable(Hydro::Schemas::Github::V1::Entities::Organization),
      user: T.nilable(Hydro::Schemas::Github::V1::Entities::User)
    ).void
  end
  def initialize(access_type: nil, blocking_reason: nil, copilot_user_details: nil, integration_id: nil, organization: nil, user: nil); end

  sig { returns(String) }
  def access_type; end

  sig { params(value: String).void }
  def access_type=(value); end

  sig { returns(String) }
  def blocking_reason; end

  sig { params(value: String).void }
  def blocking_reason=(value); end

  sig { void }
  def clear_access_type; end

  sig { void }
  def clear_blocking_reason; end

  sig { void }
  def clear_copilot_user_details; end

  sig { void }
  def clear_integration_id; end

  sig { void }
  def clear_organization; end

  sig { void }
  def clear_user; end

  sig { returns(T.nilable(Hydro::Schemas::Github::Copilot::V1::Entities::CopilotUserDetails)) }
  def copilot_user_details; end

  sig { params(value: T.nilable(Hydro::Schemas::Github::Copilot::V1::Entities::CopilotUserDetails)).void }
  def copilot_user_details=(value); end

  sig { returns(String) }
  def integration_id; end

  sig { params(value: String).void }
  def integration_id=(value); end

  sig { returns(T.nilable(Hydro::Schemas::Github::V1::Entities::Organization)) }
  def organization; end

  sig { params(value: T.nilable(Hydro::Schemas::Github::V1::Entities::Organization)).void }
  def organization=(value); end

  sig { returns(T.nilable(Hydro::Schemas::Github::V1::Entities::User)) }
  def user; end

  sig { params(value: T.nilable(Hydro::Schemas::Github::V1::Entities::User)).void }
  def user=(value); end
end
