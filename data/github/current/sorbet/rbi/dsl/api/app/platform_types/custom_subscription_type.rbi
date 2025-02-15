# typed: true

# DO NOT EDIT MANUALLY
# This is an autogenerated file for dynamic methods in `Api::App::PlatformTypes::CustomSubscriptionType`.
# Please instead update this file by running `bin/tapioca dsl Api::App::PlatformTypes::CustomSubscriptionType`.

module Api::App::PlatformTypes::CustomSubscriptionType
  sig { returns(T::Boolean) }
  def discussion?; end

  sig { returns(T::Boolean) }
  def issue?; end

  sig { returns(T::Boolean) }
  def pull_request?; end

  sig { returns(T::Boolean) }
  def release?; end

  sig { returns(T::Boolean) }
  def security_alert?; end

  DISCUSSION = T.let("DISCUSSION", String)
  ISSUE = T.let("ISSUE", String)
  PULL_REQUEST = T.let("PULL_REQUEST", String)
  RELEASE = T.let("RELEASE", String)
  SECURITY_ALERT = T.let("SECURITY_ALERT", String)
end
