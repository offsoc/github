# typed: true

# DO NOT EDIT MANUALLY
# This is an autogenerated file for dynamic methods in `Hydro::Schemas::Github::EnterpriseAccount::V0::ToggleSourceIpDisclosure`.
# Please instead update this file by running `bin/tapioca dsl Hydro::Schemas::Github::EnterpriseAccount::V0::ToggleSourceIpDisclosure`.

class Hydro::Schemas::Github::EnterpriseAccount::V0::ToggleSourceIpDisclosure
  sig do
    params(
      actor: T.nilable(Hydro::Schemas::Github::V1::Entities::User),
      enterprise: T.nilable(Hydro::Schemas::Github::V1::Entities::Business),
      state: T.nilable(T.any(Symbol, Integer))
    ).void
  end
  def initialize(actor: nil, enterprise: nil, state: nil); end

  sig { returns(T.nilable(Hydro::Schemas::Github::V1::Entities::User)) }
  def actor; end

  sig { params(value: T.nilable(Hydro::Schemas::Github::V1::Entities::User)).void }
  def actor=(value); end

  sig { void }
  def clear_actor; end

  sig { void }
  def clear_enterprise; end

  sig { void }
  def clear_state; end

  sig { returns(T.nilable(Hydro::Schemas::Github::V1::Entities::Business)) }
  def enterprise; end

  sig { params(value: T.nilable(Hydro::Schemas::Github::V1::Entities::Business)).void }
  def enterprise=(value); end

  sig { returns(T.any(Symbol, Integer)) }
  def state; end

  sig { params(value: T.any(Symbol, Integer)).void }
  def state=(value); end
end
