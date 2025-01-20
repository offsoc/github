# typed: true
# frozen_string_literal: true

class Lookbook
  extend T::Sig

  class Engine; end

  class ApplicationController
    attr_reader :request
  end

  sig { params(sym: Symbol, str: String).void }
  def self.add_input_type(sym, str); end

  sig { params(sym: Symbol, str: String, opts: T::Hash[Symbol, String]).void }
  def self.add_panel(sym, str, opts); end
end
