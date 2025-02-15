# typed: true

# DO NOT EDIT MANUALLY
# This is an autogenerated file for dynamic methods in `Hydro::Schemas::Github::V1::OrganizationRestore`.
# Please instead update this file by running `bin/tapioca dsl Hydro::Schemas::Github::V1::OrganizationRestore`.

class Hydro::Schemas::Github::V1::OrganizationRestore
  sig do
    params(
      actor: T.nilable(Hydro::Schemas::Github::V1::Entities::User),
      customer_id: T.nilable(Integer),
      organization: T.nilable(Hydro::Schemas::Github::V1::Entities::Organization)
    ).void
  end
  def initialize(actor: nil, customer_id: nil, organization: nil); end

  sig { returns(T.nilable(Hydro::Schemas::Github::V1::Entities::User)) }
  def actor; end

  sig { params(value: T.nilable(Hydro::Schemas::Github::V1::Entities::User)).void }
  def actor=(value); end

  sig { void }
  def clear_actor; end

  sig { void }
  def clear_customer_id; end

  sig { void }
  def clear_organization; end

  sig { returns(Integer) }
  def customer_id; end

  sig { params(value: Integer).void }
  def customer_id=(value); end

  sig { returns(T.nilable(Hydro::Schemas::Github::V1::Entities::Organization)) }
  def organization; end

  sig { params(value: T.nilable(Hydro::Schemas::Github::V1::Entities::Organization)).void }
  def organization=(value); end
end
