# typed: true

# DO NOT EDIT MANUALLY
# This is an autogenerated file for dynamic methods in `GitHub::Launch::Services::Credz::CreateResponse`.
# Please instead update this file by running `bin/tapioca dsl GitHub::Launch::Services::Credz::CreateResponse`.

class GitHub::Launch::Services::Credz::CreateResponse
  sig do
    params(
      credential: T.nilable(GitHub::Launch::Services::Credz::Credential),
      error: T.nilable(GitHub::Launch::Services::Credz::Error),
      stored: T.nilable(T::Boolean)
    ).void
  end
  def initialize(credential: nil, error: nil, stored: nil); end

  sig { void }
  def clear_credential; end

  sig { void }
  def clear_error; end

  sig { void }
  def clear_stored; end

  sig { returns(T.nilable(GitHub::Launch::Services::Credz::Credential)) }
  def credential; end

  sig { params(value: T.nilable(GitHub::Launch::Services::Credz::Credential)).void }
  def credential=(value); end

  sig { returns(T.nilable(GitHub::Launch::Services::Credz::Error)) }
  def error; end

  sig { params(value: T.nilable(GitHub::Launch::Services::Credz::Error)).void }
  def error=(value); end

  sig { returns(T::Boolean) }
  def stored; end

  sig { params(value: T::Boolean).void }
  def stored=(value); end
end
