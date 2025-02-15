# typed: true

# DO NOT EDIT MANUALLY
# This is an autogenerated file for dynamic methods in `PlatformTypes::BlockFromOrganizationDuration`.
# Please instead update this file by running `bin/tapioca dsl PlatformTypes::BlockFromOrganizationDuration`.

module PlatformTypes::BlockFromOrganizationDuration
  sig { returns(T::Boolean) }
  def indefinite?; end

  sig { returns(T::Boolean) }
  def one_day?; end

  sig { returns(T::Boolean) }
  def seven_days?; end

  sig { returns(T::Boolean) }
  def thirty_days?; end

  sig { returns(T::Boolean) }
  def three_days?; end

  INDEFINITE = T.let("INDEFINITE", String)
  ONE_DAY = T.let("ONE_DAY", String)
  SEVEN_DAYS = T.let("SEVEN_DAYS", String)
  THIRTY_DAYS = T.let("THIRTY_DAYS", String)
  THREE_DAYS = T.let("THREE_DAYS", String)
end
