# typed: true

class Notifyd::Builder
  sig { params(conn: Faraday::Connection).void }
  def initialize(conn:); end

  sig { params(stats: T.untyped).void }
  def use_retry(stats: nil); end

  sig { params(key: String).void }
  def use_hmac_auth(key:); end

  sig { params(key: T.any(Symbol, String), args: T.untyped, block: T.nilable(T.proc.void)).void }
  def use_adapter(key, *args, &block); end

  sig { returns(Faraday::Connection) }
  def conn; end
end
