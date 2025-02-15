# typed: true

# DO NOT EDIT MANUALLY
# This is an autogenerated file for dynamic methods in `Api::App::PlatformTypes::GateType`.
# Please instead update this file by running `bin/tapioca dsl Api::App::PlatformTypes::GateType`.

module Api::App::PlatformTypes::GateType
  sig { returns(T::Boolean) }
  def branch_policy?; end

  sig { returns(T::Boolean) }
  def custom?; end

  sig { returns(T::Boolean) }
  def manual_approval?; end

  sig { returns(T::Boolean) }
  def timeout?; end

  BRANCH_POLICY = T.let("BRANCH_POLICY", String)
  CUSTOM = T.let("CUSTOM", String)
  MANUAL_APPROVAL = T.let("MANUAL_APPROVAL", String)
  TIMEOUT = T.let("TIMEOUT", String)
end
