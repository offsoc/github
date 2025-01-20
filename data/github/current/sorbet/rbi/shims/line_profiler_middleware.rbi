#typed: strict
#frozen_string_literal: true

class GitHub::LineProfilerMiddleware

  sig { params(regex: Regexp, blk: T.proc.void).returns(T.untyped) }
  def lineprof(regex, &blk); end
end
