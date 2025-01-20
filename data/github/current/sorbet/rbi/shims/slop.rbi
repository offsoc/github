# typed: strict
# frozen_string_literal: true

class Slop
  sig { params(items: T.untyped, config: T.untyped, block: T.proc.params(arg1: Slop).bind(T.attached_class).void).returns(Slop) }
  def self.parse(items = T.unsafe(nil), config = T.unsafe(nil), &block); end
end
