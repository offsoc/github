# typed: true

# DO NOT EDIT MANUALLY
# This is an autogenerated file for dynamic methods in `PlatformTypes::DependabotUpdate`.
# Please instead update this file by running `bin/tapioca dsl PlatformTypes::DependabotUpdate`.

class PlatformTypes::DependabotUpdate < GraphQL::Client::Schema::ObjectClass
  sig { returns(T.nilable(String)) }
  def __typename; end

  sig { returns(T.nilable(PlatformTypes::DependabotUpdateError)) }
  def error; end

  sig { returns(T::Boolean) }
  def error?; end

  sig { returns(T.nilable(PlatformTypes::PullRequest)) }
  def pull_request; end

  sig { returns(T::Boolean) }
  def pull_request?; end

  sig { returns(PlatformTypes::Repository) }
  def repository; end

  sig { returns(T::Boolean) }
  def repository?; end
end
