# typed: true

class Sinatra::Base
  sig { params(path: T.untyped, opts: T.untyped, block: T.proc.bind(T.attached_class).params(values: T.untyped).void).void }
  def self.before(path = T.unsafe(nil), **opts, &block); end

  sig { params(path: T.untyped, opts: T.untyped, block: T.proc.bind(T.attached_class).params(values: T.untyped).void).void }
  def self.delete(path, opts = T.unsafe(nil), &block); end

  sig { params(codes: T.untyped, block: T.proc.bind(T.attached_class).void).void }
  def self.error(*codes, &block); end

  sig { params(path: T.untyped, opts: T.untyped, block: T.proc.bind(T.attached_class).params(values: T.untyped).void).void }
  def self.get(path, opts = T.unsafe(nil), &block); end

  sig { params(path: T.untyped, opts: T.untyped, block: T.proc.bind(T.attached_class).params(values: T.untyped).void).void }
  def self.head(path, opts = T.unsafe(nil), &block); end

  sig { params(path: T.untyped, opts: T.untyped, block: T.proc.bind(T.attached_class).params(values: T.untyped).void).void }
  def self.options(path, opts = T.unsafe(nil), &block); end

  sig { params(path: T.untyped, opts: T.untyped, block: T.proc.bind(T.attached_class).params(values: T.untyped).void).void }
  def self.patch(path, opts = T.unsafe(nil), &block); end

  sig { params(path: T.untyped, opts: T.untyped, block: T.proc.bind(T.attached_class).params(values: T.untyped).void).void }
  def self.post(path, opts = T.unsafe(nil), &block); end

  sig { params(path: T.untyped, opts: T.untyped, block: T.proc.bind(T.attached_class).params(values: T.untyped).void).void }
  def self.put(path, opts = T.unsafe(nil), &block); end
end
