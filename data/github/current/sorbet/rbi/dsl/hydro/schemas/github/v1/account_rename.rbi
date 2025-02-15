# typed: true

# DO NOT EDIT MANUALLY
# This is an autogenerated file for dynamic methods in `Hydro::Schemas::Github::V1::AccountRename`.
# Please instead update this file by running `bin/tapioca dsl Hydro::Schemas::Github::V1::AccountRename`.

class Hydro::Schemas::Github::V1::AccountRename
  sig do
    params(
      account: T.nilable(Hydro::Schemas::Github::V1::Entities::User),
      actor: T.nilable(Hydro::Schemas::Github::V1::Entities::User),
      current_login: T.nilable(String),
      previous_login: T.nilable(String),
      request_context: T.nilable(Hydro::Schemas::Github::V1::Entities::RequestContext),
      spamurai_form_signals: T.nilable(Hydro::Schemas::Github::V1::Entities::SpamuraiFormSignals)
    ).void
  end
  def initialize(account: nil, actor: nil, current_login: nil, previous_login: nil, request_context: nil, spamurai_form_signals: nil); end

  sig { returns(T.nilable(Hydro::Schemas::Github::V1::Entities::User)) }
  def account; end

  sig { params(value: T.nilable(Hydro::Schemas::Github::V1::Entities::User)).void }
  def account=(value); end

  sig { returns(T.nilable(Hydro::Schemas::Github::V1::Entities::User)) }
  def actor; end

  sig { params(value: T.nilable(Hydro::Schemas::Github::V1::Entities::User)).void }
  def actor=(value); end

  sig { void }
  def clear_account; end

  sig { void }
  def clear_actor; end

  sig { void }
  def clear_current_login; end

  sig { void }
  def clear_previous_login; end

  sig { void }
  def clear_request_context; end

  sig { void }
  def clear_spamurai_form_signals; end

  sig { returns(String) }
  def current_login; end

  sig { params(value: String).void }
  def current_login=(value); end

  sig { returns(String) }
  def previous_login; end

  sig { params(value: String).void }
  def previous_login=(value); end

  sig { returns(T.nilable(Hydro::Schemas::Github::V1::Entities::RequestContext)) }
  def request_context; end

  sig { params(value: T.nilable(Hydro::Schemas::Github::V1::Entities::RequestContext)).void }
  def request_context=(value); end

  sig { returns(T.nilable(Hydro::Schemas::Github::V1::Entities::SpamuraiFormSignals)) }
  def spamurai_form_signals; end

  sig { params(value: T.nilable(Hydro::Schemas::Github::V1::Entities::SpamuraiFormSignals)).void }
  def spamurai_form_signals=(value); end
end
