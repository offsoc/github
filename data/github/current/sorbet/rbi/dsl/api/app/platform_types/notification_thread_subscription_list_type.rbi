# typed: true

# DO NOT EDIT MANUALLY
# This is an autogenerated file for dynamic methods in `Api::App::PlatformTypes::NotificationThreadSubscriptionListType`.
# Please instead update this file by running `bin/tapioca dsl Api::App::PlatformTypes::NotificationThreadSubscriptionListType`.

module Api::App::PlatformTypes::NotificationThreadSubscriptionListType
  sig { returns(T::Boolean) }
  def repository?; end

  sig { returns(T::Boolean) }
  def team?; end

  REPOSITORY = T.let("REPOSITORY", String)
  TEAM = T.let("TEAM", String)
end
