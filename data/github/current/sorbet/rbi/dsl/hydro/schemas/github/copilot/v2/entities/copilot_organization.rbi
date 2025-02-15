# typed: true

# DO NOT EDIT MANUALLY
# This is an autogenerated file for dynamic methods in `Hydro::Schemas::Github::Copilot::V2::Entities::CopilotOrganization`.
# Please instead update this file by running `bin/tapioca dsl Hydro::Schemas::Github::Copilot::V2::Entities::CopilotOrganization`.

class Hydro::Schemas::Github::Copilot::V2::Entities::CopilotOrganization
  sig do
    params(
      analytics_tracking_id: T.nilable(String),
      organization: T.nilable(Hydro::Schemas::Github::V1::Entities::Organization)
    ).void
  end
  def initialize(analytics_tracking_id: nil, organization: nil); end

  sig { returns(String) }
  def analytics_tracking_id; end

  sig { params(value: String).void }
  def analytics_tracking_id=(value); end

  sig { void }
  def clear_analytics_tracking_id; end

  sig { void }
  def clear_organization; end

  sig { returns(T.nilable(Hydro::Schemas::Github::V1::Entities::Organization)) }
  def organization; end

  sig { params(value: T.nilable(Hydro::Schemas::Github::V1::Entities::Organization)).void }
  def organization=(value); end
end
