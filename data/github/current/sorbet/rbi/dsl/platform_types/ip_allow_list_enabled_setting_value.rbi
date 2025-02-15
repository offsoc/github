# typed: true

# DO NOT EDIT MANUALLY
# This is an autogenerated file for dynamic methods in `PlatformTypes::IpAllowListEnabledSettingValue`.
# Please instead update this file by running `bin/tapioca dsl PlatformTypes::IpAllowListEnabledSettingValue`.

module PlatformTypes::IpAllowListEnabledSettingValue
  sig { returns(T::Boolean) }
  def disabled?; end

  sig { returns(T::Boolean) }
  def enabled?; end

  DISABLED = T.let("DISABLED", String)
  ENABLED = T.let("ENABLED", String)
end
