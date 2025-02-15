# typed: true

# DO NOT EDIT MANUALLY
# This is an autogenerated file for dynamic methods in `GitHub::Kredz::Services::Varz::ListOrganizationVariablesForRepositoryResponse`.
# Please instead update this file by running `bin/tapioca dsl GitHub::Kredz::Services::Varz::ListOrganizationVariablesForRepositoryResponse`.

class GitHub::Kredz::Services::Varz::ListOrganizationVariablesForRepositoryResponse
  sig do
    params(
      error: T.nilable(GitHub::Kredz::Services::Varz::Error),
      organization_variables: T.nilable(T.any(Google::Protobuf::RepeatedField[GitHub::Kredz::Services::Varz::Variable], T::Array[GitHub::Kredz::Services::Varz::Variable])),
      total_count: T.nilable(Integer)
    ).void
  end
  def initialize(error: nil, organization_variables: T.unsafe(nil), total_count: nil); end

  sig { void }
  def clear_error; end

  sig { void }
  def clear_organization_variables; end

  sig { void }
  def clear_total_count; end

  sig { returns(T.nilable(GitHub::Kredz::Services::Varz::Error)) }
  def error; end

  sig { params(value: T.nilable(GitHub::Kredz::Services::Varz::Error)).void }
  def error=(value); end

  sig { returns(Google::Protobuf::RepeatedField[GitHub::Kredz::Services::Varz::Variable]) }
  def organization_variables; end

  sig { params(value: Google::Protobuf::RepeatedField[GitHub::Kredz::Services::Varz::Variable]).void }
  def organization_variables=(value); end

  sig { returns(Integer) }
  def total_count; end

  sig { params(value: Integer).void }
  def total_count=(value); end
end
