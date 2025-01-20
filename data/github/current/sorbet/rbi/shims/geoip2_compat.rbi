# typed: true
# frozen_string_literal: true

class GeoIP2Compat
  sig { params(db_path: String).void }
  def initialize(db_path); end

  sig { params(ip: String).returns(T::Hash[Symbol, T.untyped]) }
  def lookup(ip); end
end

class GeoIP2Compat::Error < ::StandardError; end
