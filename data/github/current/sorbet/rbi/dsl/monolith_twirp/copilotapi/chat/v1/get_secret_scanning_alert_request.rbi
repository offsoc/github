# typed: true

# DO NOT EDIT MANUALLY
# This is an autogenerated file for dynamic methods in `MonolithTwirp::Copilotapi::Chat::V1::GetSecretScanningAlertRequest`.
# Please instead update this file by running `bin/tapioca dsl MonolithTwirp::Copilotapi::Chat::V1::GetSecretScanningAlertRequest`.

class MonolithTwirp::Copilotapi::Chat::V1::GetSecretScanningAlertRequest
  sig do
    params(
      access_token: T.nilable(String),
      alert_number: T.nilable(Integer),
      ip_address: T.nilable(String),
      repository_nwo: T.nilable(String)
    ).void
  end
  def initialize(access_token: nil, alert_number: nil, ip_address: nil, repository_nwo: nil); end

  sig { returns(String) }
  def access_token; end

  sig { params(value: String).void }
  def access_token=(value); end

  sig { returns(Integer) }
  def alert_number; end

  sig { params(value: Integer).void }
  def alert_number=(value); end

  sig { void }
  def clear_access_token; end

  sig { void }
  def clear_alert_number; end

  sig { void }
  def clear_ip_address; end

  sig { void }
  def clear_repository_nwo; end

  sig { returns(String) }
  def ip_address; end

  sig { params(value: String).void }
  def ip_address=(value); end

  sig { returns(String) }
  def repository_nwo; end

  sig { params(value: String).void }
  def repository_nwo=(value); end
end
