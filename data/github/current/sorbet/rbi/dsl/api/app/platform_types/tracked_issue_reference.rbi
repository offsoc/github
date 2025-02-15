# typed: true

# DO NOT EDIT MANUALLY
# This is an autogenerated file for dynamic methods in `Api::App::PlatformTypes::TrackedIssueReference`.
# Please instead update this file by running `bin/tapioca dsl Api::App::PlatformTypes::TrackedIssueReference`.

class Api::App::PlatformTypes::TrackedIssueReference < GraphQL::Client::Schema::ObjectClass
  sig { returns(T.nilable(String)) }
  def __typename; end

  sig { returns(T.nilable(Api::App::PlatformTypes::TrackedIssueCompletion)) }
  def completion; end

  sig { returns(T::Boolean) }
  def completion?; end

  sig { returns(Api::App::PlatformTypes::Issue) }
  def issue; end

  sig { returns(T::Boolean) }
  def issue?; end

  sig { returns(Integer) }
  def position; end

  sig { returns(T::Boolean) }
  def position?; end

  sig { returns(T.any(String, Integer)) }
  def uuid; end

  sig { returns(T::Boolean) }
  def uuid?; end
end
