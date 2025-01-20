# typed: __STDLIB_INTERNAL

# [`Coverage`](https://ruby-doc.org/3.3.3/exts/coverage/Coverage.html) provides
# coverage measurement feature for Ruby. This feature is experimental, so these
# APIs may be changed in future.

module Coverage
  sig {params(file: T.untyped).returns(T.untyped)}
  def self.line_stub(file); end

  # Returns a hash that contains filename as key and coverage array as value.
  # This is the same as `Coverage.result(stop: false, clear: false)`.
  #
  # ```
  # {
  #   "file.rb" => [1, 2, nil],
  #   ...
  # }
  # ```
  sig {returns(T::Hash[String, T.untyped])}
  def self.peek_result(); end

  # Returns a hash that contains filename as key and coverage array as value. If
  # `clear` is true, it clears the counters to zero. If `stop` is true, it
  # disables coverage measurement.
  sig do
    params(
        stop: T::Boolean,
        clear: T::Boolean
    )
    .returns(T::Hash[String, T.untyped])
  end
  def self.result(stop: T.unsafe(nil), clear: T.unsafe(nil)); end

  # Returns true if coverage stats are currently being collected (after
  # [`Coverage.start`](https://docs.ruby-lang.org/en/2.7.0/Coverage.html#method-c-start)
  # call, but before
  # [`Coverage.result`](https://docs.ruby-lang.org/en/2.7.0/Coverage.html#method-c-result)
  # call)
  sig {returns(T::Boolean)}
  def self.running?(); end

  # Enables coverage measurement.
  sig do
    params(
        lines: T::Boolean,
        branches: T::Boolean,
        methods: T::Boolean,
        oneshot_lines: T::Boolean
    )
    .returns(NilClass)
  end
  def self.start(lines: T.unsafe(nil), branches: T.unsafe(nil), methods: T.unsafe(nil), oneshot_lines: T.unsafe(nil)); end

  sig { returns(NilClass) }
  def self.suspend(); end

  sig { returns(NilClass) }
  def self.resume(); end

  sig { returns(Symbol) }
  def self.state(); end
end
