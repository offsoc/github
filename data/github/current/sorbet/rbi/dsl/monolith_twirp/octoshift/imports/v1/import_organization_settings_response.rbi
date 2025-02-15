# typed: true

# DO NOT EDIT MANUALLY
# This is an autogenerated file for dynamic methods in `MonolithTwirp::Octoshift::Imports::V1::ImportOrganizationSettingsResponse`.
# Please instead update this file by running `bin/tapioca dsl MonolithTwirp::Octoshift::Imports::V1::ImportOrganizationSettingsResponse`.

class MonolithTwirp::Octoshift::Imports::V1::ImportOrganizationSettingsResponse
  sig do
    params(
      id: T.nilable(Integer),
      organization_settings_errors: T.nilable(T.any(Google::Protobuf::RepeatedField[String], T::Array[String]))
    ).void
  end
  def initialize(id: nil, organization_settings_errors: T.unsafe(nil)); end

  sig { void }
  def clear_id; end

  sig { void }
  def clear_organization_settings_errors; end

  sig { returns(Integer) }
  def id; end

  sig { params(value: Integer).void }
  def id=(value); end

  sig { returns(Google::Protobuf::RepeatedField[String]) }
  def organization_settings_errors; end

  sig { params(value: Google::Protobuf::RepeatedField[String]).void }
  def organization_settings_errors=(value); end
end
