# typed: true

# DO NOT EDIT MANUALLY
# This is an autogenerated file for dynamic methods in `Turbomodel::Proto::AutoModelResponse`.
# Please instead update this file by running `bin/tapioca dsl Turbomodel::Proto::AutoModelResponse`.

class Turbomodel::Proto::AutoModelResponse
  sig { params(models: T.nilable(String)).void }
  def initialize(models: nil); end

  sig { void }
  def clear_models; end

  sig { returns(String) }
  def models; end

  sig { params(value: String).void }
  def models=(value); end
end
