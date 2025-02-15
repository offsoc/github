# typed: true

# DO NOT EDIT MANUALLY
# This is an autogenerated file for dynamic methods in `Hydro::Schemas::Github::Octogrowth::V0::GhasTrialRequest`.
# Please instead update this file by running `bin/tapioca dsl Hydro::Schemas::Github::Octogrowth::V0::GhasTrialRequest`.

class Hydro::Schemas::Github::Octogrowth::V0::GhasTrialRequest
  sig do
    params(
      email: T.nilable(String),
      name: T.nilable(String),
      org_name: T.nilable(String),
      organization_id: T.nilable(Integer),
      submitted_at: T.nilable(Google::Protobuf::Timestamp)
    ).void
  end
  def initialize(email: nil, name: nil, org_name: nil, organization_id: nil, submitted_at: nil); end

  sig { void }
  def clear_email; end

  sig { void }
  def clear_name; end

  sig { void }
  def clear_org_name; end

  sig { void }
  def clear_organization_id; end

  sig { void }
  def clear_submitted_at; end

  sig { returns(String) }
  def email; end

  sig { params(value: String).void }
  def email=(value); end

  sig { returns(String) }
  def name; end

  sig { params(value: String).void }
  def name=(value); end

  sig { returns(String) }
  def org_name; end

  sig { params(value: String).void }
  def org_name=(value); end

  sig { returns(Integer) }
  def organization_id; end

  sig { params(value: Integer).void }
  def organization_id=(value); end

  sig { returns(T.nilable(Google::Protobuf::Timestamp)) }
  def submitted_at; end

  sig { params(value: T.nilable(Google::Protobuf::Timestamp)).void }
  def submitted_at=(value); end
end
