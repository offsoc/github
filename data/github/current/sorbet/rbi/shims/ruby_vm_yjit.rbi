# typed: strict
# frozen_string_literal: true

module RubyVM::YJIT
  sig { returns(T::Boolean) }
  def self.stats_enabled?; end

  sig { returns(T::Boolean) }
  def self.enabled?; end
end
