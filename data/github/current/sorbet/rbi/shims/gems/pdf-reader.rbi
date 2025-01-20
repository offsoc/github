# typed: true

module PDF
  class Reader
    sig { params(io: T.any(StringIO, Tempfile, IO, StringIO), opts: T::Hash[Symbol, T.untyped]).void }
    def initialize(io, opts = T.unsafe(nil)); end
  end
end
