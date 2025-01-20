# typed: strict
# frozen_string_literal: true

class MemexProjectChart
  extend T::Sig

  sig { returns T.nilable(::Integer) }
  def number; end

  sig { returns T.nilable(::String) }
  def name; end
end
