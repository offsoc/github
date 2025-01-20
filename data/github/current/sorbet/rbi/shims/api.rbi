# typed: true

class Api::App
  sig { returns(T.nilable(T::Hash[T.untyped, T.untyped])) }
  def rate_limit_configuration; end
end
