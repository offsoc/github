# typed: true

# DO NOT EDIT MANUALLY
# This is an autogenerated file for dynamic methods in `GitHub::Proto::Support::V1::GetOrganizationsRequest`.
# Please instead update this file by running `bin/tapioca dsl GitHub::Proto::Support::V1::GetOrganizationsRequest`.

class GitHub::Proto::Support::V1::GetOrganizationsRequest
  sig { params(user_id: T.nilable(Integer)).void }
  def initialize(user_id: nil); end

  sig { void }
  def clear_user_id; end

  sig { returns(Integer) }
  def user_id; end

  sig { params(value: Integer).void }
  def user_id=(value); end
end
