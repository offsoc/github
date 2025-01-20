# typed: true

class MemexProjectView
  sig { returns(T.nilable(T::Hash[String, T.untyped])) }
  def layout_settings; end

  sig { returns T.nilable(::Integer) }
  def number; end

  sig { returns T.nilable(String) }
  def layout; end
end
