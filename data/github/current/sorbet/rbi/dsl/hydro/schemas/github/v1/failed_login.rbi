# typed: true

# DO NOT EDIT MANUALLY
# This is an autogenerated file for dynamic methods in `Hydro::Schemas::Github::V1::FailedLogin`.
# Please instead update this file by running `bin/tapioca dsl Hydro::Schemas::Github::V1::FailedLogin`.

class Hydro::Schemas::Github::V1::FailedLogin
  sig do
    params(
      actor: T.nilable(Hydro::Schemas::Github::V1::Entities::User),
      passwordless: T.nilable(T::Boolean),
      request_context: T.nilable(Hydro::Schemas::Github::V1::Entities::RequestContext),
      spamurai_form_signals: T.nilable(Hydro::Schemas::Github::V1::Entities::SpamuraiFormSignals)
    ).void
  end
  def initialize(actor: nil, passwordless: nil, request_context: nil, spamurai_form_signals: nil); end

  sig { returns(T.nilable(Hydro::Schemas::Github::V1::Entities::User)) }
  def actor; end

  sig { params(value: T.nilable(Hydro::Schemas::Github::V1::Entities::User)).void }
  def actor=(value); end

  sig { void }
  def clear_actor; end

  sig { void }
  def clear_passwordless; end

  sig { void }
  def clear_request_context; end

  sig { void }
  def clear_spamurai_form_signals; end

  sig { returns(T::Boolean) }
  def passwordless; end

  sig { params(value: T::Boolean).void }
  def passwordless=(value); end

  sig { returns(T.nilable(Hydro::Schemas::Github::V1::Entities::RequestContext)) }
  def request_context; end

  sig { params(value: T.nilable(Hydro::Schemas::Github::V1::Entities::RequestContext)).void }
  def request_context=(value); end

  sig { returns(T.nilable(Hydro::Schemas::Github::V1::Entities::SpamuraiFormSignals)) }
  def spamurai_form_signals; end

  sig { params(value: T.nilable(Hydro::Schemas::Github::V1::Entities::SpamuraiFormSignals)).void }
  def spamurai_form_signals=(value); end
end
