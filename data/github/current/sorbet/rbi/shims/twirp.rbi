# frozen_string_literal: true
# typed: true

class Twirp::ClientResp
  sig { returns(Elem) }
  def data; end

  sig { returns(T.nilable(Twirp::Error)) }
  def error; end
end

class Twirp::Error
  sig { returns(Symbol) }
  def code; end

  sig { returns(String) }
  def msg; end

  sig { returns T::Hash[Symbol, String] }
  def meta; end
end
