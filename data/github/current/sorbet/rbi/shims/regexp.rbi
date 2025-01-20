# frozen_string_literal: true
# typed: true

class Regexp
  sig do
    params(
        arg0: T.any(Regexp, String),
        options: BasicObject,
        kcode: String,
    )
    .returns(Object)
  end
  sig do
    params(
        arg0: Regexp,
    )
    .void
  end
  def initialize(arg0, options=T.unsafe(nil), kcode=T.unsafe(nil)); end
end
