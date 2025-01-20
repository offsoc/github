# typed: strict
# frozen_string_literal: true

module Orchestration
  module ClassMethods
    has_attached_class!

    sig { params(name: Symbol, options: T::Hash[Symbol, T.any], block: T.proc.bind(T.attached_class).void).void }
    def step(name, options = {}, &block); end

    sig { params(block: T.proc.bind(T.attached_class).void).void }
    def on_end_orchestration(&block); end
  end

  sig { returns(T::Boolean) }
  def active?; end

  mixes_in_class_methods(ClassMethods)
end
