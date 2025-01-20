# typed: true

module ActionDispatch::Integration::Runner
  sig { returns(T::Hash[T.any(Symbol, String), T.untyped]) }
  def flash; end
end
