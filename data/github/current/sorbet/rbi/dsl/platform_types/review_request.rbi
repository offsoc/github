# typed: true

# DO NOT EDIT MANUALLY
# This is an autogenerated file for dynamic methods in `PlatformTypes::ReviewRequest`.
# Please instead update this file by running `bin/tapioca dsl PlatformTypes::ReviewRequest`.

class PlatformTypes::ReviewRequest < GraphQL::Client::Schema::ObjectClass
  sig { returns(T.nilable(String)) }
  def __typename; end

  sig { returns(T::Boolean) }
  def as_code_owner; end

  sig { returns(T::Boolean) }
  def as_code_owner?; end

  sig { returns(T.nilable(PlatformTypes::ReviewRequest)) }
  def assigned_from_review_request; end

  sig { returns(T::Boolean) }
  def assigned_from_review_request?; end

  sig { returns(T.nilable(PlatformTypes::CommittishFile)) }
  def code_owners_file; end

  sig { returns(T::Boolean) }
  def code_owners_file?; end

  sig { returns(T.nilable(GraphQL::Client::Schema::ScalarType)) }
  def code_owners_resource_path; end

  sig { returns(T::Boolean) }
  def code_owners_resource_path?; end

  sig { returns(T.nilable(Integer)) }
  def database_id; end

  sig { returns(T::Boolean) }
  def database_id?; end

  sig { returns(T.any(String, Integer)) }
  def id; end

  sig { returns(T::Boolean) }
  def id?; end

  sig { returns(PlatformTypes::PullRequest) }
  def pull_request; end

  sig { returns(T::Boolean) }
  def pull_request?; end

  sig { returns(T.nilable(PlatformTypes::User)) }
  def requested_by; end

  sig { returns(T::Boolean) }
  def requested_by?; end

  sig do
    returns(T.nilable(T.any(PlatformTypes::User, PlatformTypes::Team, PlatformTypes::Mannequin, PlatformTypes::Bot)))
  end
  def requested_reviewer; end

  sig { returns(T::Boolean) }
  def requested_reviewer?; end
end
