# typed: true

# DO NOT EDIT MANUALLY
# This is an autogenerated file for dynamic methods in `MonolithTwirp::Octoshift::Imports::V1::ValidateSourceCredentialsResponse`.
# Please instead update this file by running `bin/tapioca dsl MonolithTwirp::Octoshift::Imports::V1::ValidateSourceCredentialsResponse`.

class MonolithTwirp::Octoshift::Imports::V1::ValidateSourceCredentialsResponse
  sig { params(can_migrate: T.nilable(T::Boolean)).void }
  def initialize(can_migrate: nil); end

  sig { returns(T::Boolean) }
  def can_migrate; end

  sig { params(value: T::Boolean).void }
  def can_migrate=(value); end

  sig { void }
  def clear_can_migrate; end
end
