# typed: true

# DO NOT EDIT MANUALLY
# This is an autogenerated file for dynamic methods in `GitHub::Spokes::Proto::Gitauth::V1::ErrorResult`.
# Please instead update this file by running `bin/tapioca dsl GitHub::Spokes::Proto::Gitauth::V1::ErrorResult`.

class GitHub::Spokes::Proto::Gitauth::V1::ErrorResult
  sig { params(error_message: T.nilable(String)).void }
  def initialize(error_message: nil); end

  sig { void }
  def clear_error_message; end

  sig { returns(String) }
  def error_message; end

  sig { params(value: String).void }
  def error_message=(value); end
end
