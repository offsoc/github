# typed: true

# DO NOT EDIT MANUALLY
# This is an autogenerated file for dynamic methods in `PlatformTypes::MergeQueueCheckState`.
# Please instead update this file by running `bin/tapioca dsl PlatformTypes::MergeQueueCheckState`.

module PlatformTypes::MergeQueueCheckState
  sig { returns(T::Boolean) }
  def failure?; end

  sig { returns(T::Boolean) }
  def pending?; end

  sig { returns(T::Boolean) }
  def success?; end

  sig { returns(T::Boolean) }
  def waiting?; end

  FAILURE = T.let("FAILURE", String)
  PENDING = T.let("PENDING", String)
  SUCCESS = T.let("SUCCESS", String)
  WAITING = T.let("WAITING", String)
end
