# typed: true

# DO NOT EDIT MANUALLY
# This is an autogenerated file for dynamic methods in `Businesses::Billing::AdvancedSecurity::LicensingComponent`.
# Please instead update this file by running `bin/tapioca dsl Businesses::Billing::AdvancedSecurity::LicensingComponent`.

class Businesses::Billing::AdvancedSecurity::LicensingComponent
  sig { returns(T.untyped) }
  def banner; end

  sig { returns(T::Boolean) }
  def banner?; end

  sig { returns(T.untyped) }
  def body; end

  sig { returns(T::Boolean) }
  def body?; end

  sig { returns(T.untyped) }
  def control; end

  sig { returns(T::Boolean) }
  def control?; end

  sig { params(args: T.nilable(T::Array[T.untyped]), _arg1: T.untyped, block: T.untyped).returns(T.untyped) }
  def with_banner(*args, **_arg1, &block); end

  sig { params(args: T.nilable(T::Array[T.untyped]), _arg1: T.untyped, block: T.untyped).returns(T.untyped) }
  def with_body(*args, **_arg1, &block); end

  sig { params(args: T.nilable(T::Array[T.untyped]), _arg1: T.untyped, block: T.untyped).returns(T.untyped) }
  def with_control(*args, **_arg1, &block); end
end
