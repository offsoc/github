# typed: true

# DO NOT EDIT MANUALLY
# This is an autogenerated file for dynamic methods in `DependencyGraphAPI::V1::BoomRequest`.
# Please instead update this file by running `bin/tapioca dsl DependencyGraphAPI::V1::BoomRequest`.

class DependencyGraphAPI::V1::BoomRequest
  sig { params(issue400: T.nilable(T::Boolean), sleep_seconds: T.nilable(Integer)).void }
  def initialize(issue400: nil, sleep_seconds: nil); end

  sig { void }
  def clear_issue400; end

  sig { void }
  def clear_sleep_seconds; end

  sig { returns(T::Boolean) }
  def issue400; end

  sig { params(value: T::Boolean).void }
  def issue400=(value); end

  sig { returns(Integer) }
  def sleep_seconds; end

  sig { params(value: Integer).void }
  def sleep_seconds=(value); end
end
