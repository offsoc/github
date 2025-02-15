# typed: true

# DO NOT EDIT MANUALLY
# This is an autogenerated file for dynamic methods in `PlatformTypes::DeploymentStatusState`.
# Please instead update this file by running `bin/tapioca dsl PlatformTypes::DeploymentStatusState`.

module PlatformTypes::DeploymentStatusState
  sig { returns(T::Boolean) }
  def error?; end

  sig { returns(T::Boolean) }
  def failure?; end

  sig { returns(T::Boolean) }
  def in_progress?; end

  sig { returns(T::Boolean) }
  def inactive?; end

  sig { returns(T::Boolean) }
  def pending?; end

  sig { returns(T::Boolean) }
  def queued?; end

  sig { returns(T::Boolean) }
  def success?; end

  sig { returns(T::Boolean) }
  def waiting?; end

  ERROR = T.let("ERROR", String)
  FAILURE = T.let("FAILURE", String)
  INACTIVE = T.let("INACTIVE", String)
  IN_PROGRESS = T.let("IN_PROGRESS", String)
  PENDING = T.let("PENDING", String)
  QUEUED = T.let("QUEUED", String)
  SUCCESS = T.let("SUCCESS", String)
  WAITING = T.let("WAITING", String)
end
