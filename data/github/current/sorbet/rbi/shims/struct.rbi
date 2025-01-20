# frozen_string_literal: true
# typed: true

class Struct
  # Backport of https://github.com/sorbet/sorbet/pull/8141
  # Remove when upstream is merged and we are on a version after that change.
  sig do
    params(
        arg0: T.nilable(T.any(Symbol, String)),
        arg1: T.any(Symbol, String),
        keyword_init: T::Boolean,
        blk: T.untyped,
    )
    .void
  end
  def initialize(arg0 = nil, *arg1, keyword_init: false, &blk); end
end
