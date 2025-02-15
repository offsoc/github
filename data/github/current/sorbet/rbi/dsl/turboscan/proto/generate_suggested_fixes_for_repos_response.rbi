# typed: true

# DO NOT EDIT MANUALLY
# This is an autogenerated file for dynamic methods in `Turboscan::Proto::GenerateSuggestedFixesForReposResponse`.
# Please instead update this file by running `bin/tapioca dsl Turboscan::Proto::GenerateSuggestedFixesForReposResponse`.

class Turboscan::Proto::GenerateSuggestedFixesForReposResponse
  sig { params(success: T.nilable(T::Boolean)).void }
  def initialize(success: nil); end

  sig { void }
  def clear_success; end

  sig { returns(T::Boolean) }
  def success; end

  sig { params(value: T::Boolean).void }
  def success=(value); end
end
