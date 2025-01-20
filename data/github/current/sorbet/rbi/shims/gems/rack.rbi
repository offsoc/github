 # typed: true
# frozen_string_literal: true

class Rack::Builder
  sig { params(default_app: T.untyped, block: T.nilable(T.proc.bind(Rack::Builder).void)).void }
  def initialize(default_app = T.unsafe(nil), &block); end
end
