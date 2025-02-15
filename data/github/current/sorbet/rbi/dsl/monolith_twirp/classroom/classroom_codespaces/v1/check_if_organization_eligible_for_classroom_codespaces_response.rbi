# typed: true

# DO NOT EDIT MANUALLY
# This is an autogenerated file for dynamic methods in `MonolithTwirp::Classroom::ClassroomCodespaces::V1::CheckIfOrganizationEligibleForClassroomCodespacesResponse`.
# Please instead update this file by running `bin/tapioca dsl MonolithTwirp::Classroom::ClassroomCodespaces::V1::CheckIfOrganizationEligibleForClassroomCodespacesResponse`.

class MonolithTwirp::Classroom::ClassroomCodespaces::V1::CheckIfOrganizationEligibleForClassroomCodespacesResponse
  sig do
    params(
      is_eligible: T.nilable(T::Boolean),
      organization_id: T.nilable(Integer),
      reason: T.nilable(String)
    ).void
  end
  def initialize(is_eligible: nil, organization_id: nil, reason: nil); end

  sig { void }
  def clear_is_eligible; end

  sig { void }
  def clear_organization_id; end

  sig { void }
  def clear_reason; end

  sig { returns(T::Boolean) }
  def is_eligible; end

  sig { params(value: T::Boolean).void }
  def is_eligible=(value); end

  sig { returns(Integer) }
  def organization_id; end

  sig { params(value: Integer).void }
  def organization_id=(value); end

  sig { returns(String) }
  def reason; end

  sig { params(value: String).void }
  def reason=(value); end
end
