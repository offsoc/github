# typed: true

# DO NOT EDIT MANUALLY
# This is an autogenerated file for dynamic methods in `Hydro::Schemas::Notifyd::V0::Entities::SamlEnforcement`.
# Please instead update this file by running `bin/tapioca dsl Hydro::Schemas::Notifyd::V0::Entities::SamlEnforcement`.

class Hydro::Schemas::Notifyd::V0::Entities::SamlEnforcement
  sig { params(organization_id: T.nilable(Integer), skip_enforcement: T.nilable(T::Boolean)).void }
  def initialize(organization_id: nil, skip_enforcement: nil); end

  sig { void }
  def clear_organization_id; end

  sig { void }
  def clear_skip_enforcement; end

  sig { returns(Integer) }
  def organization_id; end

  sig { params(value: Integer).void }
  def organization_id=(value); end

  sig { returns(T::Boolean) }
  def skip_enforcement; end

  sig { params(value: T::Boolean).void }
  def skip_enforcement=(value); end
end
