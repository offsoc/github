# typed: strict
# frozen_string_literal: true

module Chatops::Controller
  module ClassMethods
    has_attached_class!

    sig do
      params(
        method_name: Symbol,
        regex: Regexp,
        help: String,
        block: T.proc.bind(T.attached_class).void
      ).returns(Symbol)
    end
    def chatop(method_name, regex, help, &block); end
  end
  mixes_in_class_methods Chatops::Controller::ClassMethods
end
