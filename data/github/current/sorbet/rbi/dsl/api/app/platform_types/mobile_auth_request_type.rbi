# typed: true

# DO NOT EDIT MANUALLY
# This is an autogenerated file for dynamic methods in `Api::App::PlatformTypes::MobileAuthRequestType`.
# Please instead update this file by running `bin/tapioca dsl Api::App::PlatformTypes::MobileAuthRequestType`.

module Api::App::PlatformTypes::MobileAuthRequestType
  sig { returns(T::Boolean) }
  def device_verification?; end

  sig { returns(T::Boolean) }
  def two_factor_login?; end

  sig { returns(T::Boolean) }
  def two_factor_password_reset?; end

  sig { returns(T::Boolean) }
  def two_factor_sudo_challenge?; end

  sig { returns(T::Boolean) }
  def unknown?; end

  DEVICE_VERIFICATION = T.let("DEVICE_VERIFICATION", String)
  TWO_FACTOR_LOGIN = T.let("TWO_FACTOR_LOGIN", String)
  TWO_FACTOR_PASSWORD_RESET = T.let("TWO_FACTOR_PASSWORD_RESET", String)
  TWO_FACTOR_SUDO_CHALLENGE = T.let("TWO_FACTOR_SUDO_CHALLENGE", String)
  UNKNOWN = T.let("UNKNOWN", String)
end
