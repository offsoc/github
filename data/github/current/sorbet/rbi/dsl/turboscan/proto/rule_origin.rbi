# typed: true

# DO NOT EDIT MANUALLY
# This is an autogenerated file for dynamic methods in `Turboscan::Proto::RuleOrigin`.
# Please instead update this file by running `bin/tapioca dsl Turboscan::Proto::RuleOrigin`.

class Turboscan::Proto::RuleOrigin
  sig { params(name: T.nilable(String), version: T.nilable(String)).void }
  def initialize(name: nil, version: nil); end

  sig { void }
  def clear_name; end

  sig { void }
  def clear_version; end

  sig { returns(String) }
  def name; end

  sig { params(value: String).void }
  def name=(value); end

  sig { returns(String) }
  def version; end

  sig { params(value: String).void }
  def version=(value); end
end
