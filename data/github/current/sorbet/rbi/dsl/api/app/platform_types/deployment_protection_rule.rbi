# typed: true

# DO NOT EDIT MANUALLY
# This is an autogenerated file for dynamic methods in `Api::App::PlatformTypes::DeploymentProtectionRule`.
# Please instead update this file by running `bin/tapioca dsl Api::App::PlatformTypes::DeploymentProtectionRule`.

class Api::App::PlatformTypes::DeploymentProtectionRule < GraphQL::Client::Schema::ObjectClass
  sig { returns(T.nilable(String)) }
  def __typename; end

  sig { returns(T.nilable(Integer)) }
  def database_id; end

  sig { returns(T::Boolean) }
  def database_id?; end

  sig { returns(T.nilable(T::Boolean)) }
  def prevent_self_review; end

  sig { returns(T::Boolean) }
  def prevent_self_review?; end

  sig { returns(Api::App::PlatformTypes::DeploymentReviewerConnection) }
  def reviewers; end

  sig { returns(T::Boolean) }
  def reviewers?; end

  sig { returns(Integer) }
  def timeout; end

  sig { returns(T::Boolean) }
  def timeout?; end

  sig { returns(String) }
  def type; end

  sig { returns(T::Boolean) }
  def type?; end
end
