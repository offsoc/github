# typed: true

class Notifyd::Client
  sig do
    params(
      url: String,
      hmac_key: String,
      block: T.nilable(T.proc.params(arg0: Notifyd::Builder).void)
    ).void
  end
  def initialize(url:, hmac_key:, &block); end
end
