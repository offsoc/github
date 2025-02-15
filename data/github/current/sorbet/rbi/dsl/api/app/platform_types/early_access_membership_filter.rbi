# typed: true

# DO NOT EDIT MANUALLY
# This is an autogenerated file for dynamic methods in `Api::App::PlatformTypes::EarlyAccessMembershipFilter`.
# Please instead update this file by running `bin/tapioca dsl Api::App::PlatformTypes::EarlyAccessMembershipFilter`.

module Api::App::PlatformTypes::EarlyAccessMembershipFilter
  sig { returns(T::Boolean) }
  def accepted?; end

  sig { returns(T::Boolean) }
  def all?; end

  sig { returns(T::Boolean) }
  def pending?; end

  ACCEPTED = T.let("ACCEPTED", String)
  ALL = T.let("ALL", String)
  PENDING = T.let("PENDING", String)
end
