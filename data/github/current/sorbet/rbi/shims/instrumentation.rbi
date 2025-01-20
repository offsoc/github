# frozen_string_literal: true
# typed: true

module Instrumentation
  # Sorbet handlers mattr_accessor, but not thread_mattr_accessor.
  # https://github.com/sorbet/sorbet/pull/1252
  #
  # If support is added for thread_mattr_accessor, we can remove this.
  # https://github.com/sorbet/sorbet/pull/6608
  sig { returns(T.nilable(T::Boolean)) }
  def self.suppressed
  end

  sig { params(val: T.nilable(T::Boolean)).void }
  def self.suppressed=(val)
  end
end
