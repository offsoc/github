# typed: true

# DO NOT EDIT MANUALLY
# This is an autogenerated file for dynamic methods in `GitHub::Launch::Services::Credz::Error`.
# Please instead update this file by running `bin/tapioca dsl GitHub::Launch::Services::Credz::Error`.

class GitHub::Launch::Services::Credz::Error
  sig { params(backtrace: T.nilable(String), error_message: T.nilable(String), error_number: T.nilable(Integer)).void }
  def initialize(backtrace: nil, error_message: nil, error_number: nil); end

  sig { returns(String) }
  def backtrace; end

  sig { params(value: String).void }
  def backtrace=(value); end

  sig { void }
  def clear_backtrace; end

  sig { void }
  def clear_error_message; end

  sig { void }
  def clear_error_number; end

  sig { returns(String) }
  def error_message; end

  sig { params(value: String).void }
  def error_message=(value); end

  sig { returns(Integer) }
  def error_number; end

  sig { params(value: Integer).void }
  def error_number=(value); end
end
