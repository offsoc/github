# typed: true

# DO NOT EDIT MANUALLY
# This is an autogenerated file for dynamic methods in `Api::App::PlatformTypes::TeamChangeParentRequest`.
# Please instead update this file by running `bin/tapioca dsl Api::App::PlatformTypes::TeamChangeParentRequest`.

class Api::App::PlatformTypes::TeamChangeParentRequest < GraphQL::Client::Schema::ObjectClass
  sig { returns(T.nilable(String)) }
  def __typename; end

  sig { returns(GraphQL::Client::Schema::ScalarType) }
  def approve_resource_path; end

  sig { returns(T::Boolean) }
  def approve_resource_path?; end

  sig { returns(GraphQL::Client::Schema::ScalarType) }
  def approve_url; end

  sig { returns(T::Boolean) }
  def approve_url?; end

  sig { returns(T::Boolean) }
  def approved; end

  sig { returns(T::Boolean) }
  def approved?; end

  sig { returns(T.nilable(Api::App::PlatformTypes::User)) }
  def approved_by; end

  sig { returns(T::Boolean) }
  def approved_by?; end

  sig { returns(GraphQL::Client::Schema::ScalarType) }
  def cancel_resource_path; end

  sig { returns(T::Boolean) }
  def cancel_resource_path?; end

  sig { returns(GraphQL::Client::Schema::ScalarType) }
  def cancel_url; end

  sig { returns(T::Boolean) }
  def cancel_url?; end

  sig { returns(Api::App::PlatformTypes::Team) }
  def child_team; end

  sig { returns(T::Boolean) }
  def child_team?; end

  sig { returns(T.any(String, Integer)) }
  def id; end

  sig { returns(T::Boolean) }
  def id?; end

  sig { returns(Api::App::PlatformTypes::Team) }
  def parent_team; end

  sig { returns(T::Boolean) }
  def parent_team?; end

  sig { returns(Api::App::PlatformTypes::Team) }
  def requested_team; end

  sig { returns(T::Boolean) }
  def requested_team?; end

  sig { returns(Api::App::PlatformTypes::User) }
  def requester; end

  sig { returns(T::Boolean) }
  def requester?; end

  sig { returns(Api::App::PlatformTypes::Team) }
  def requesting_team; end

  sig { returns(T::Boolean) }
  def requesting_team?; end
end
