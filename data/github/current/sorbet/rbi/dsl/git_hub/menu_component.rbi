# typed: true

# DO NOT EDIT MANUALLY
# This is an autogenerated file for dynamic methods in `GitHub::MenuComponent`.
# Please instead update this file by running `bin/tapioca dsl GitHub::MenuComponent`.

class GitHub::MenuComponent
  sig { returns(T.untyped) }
  def body; end

  sig { returns(T::Boolean) }
  def body?; end

  sig { returns(T.untyped) }
  def extra; end

  sig { returns(T::Boolean) }
  def extra?; end

  sig { returns(T.untyped) }
  def header; end

  sig { returns(T::Boolean) }
  def header?; end

  sig { returns(T.untyped) }
  def summary; end

  sig { returns(T::Boolean) }
  def summary?; end

  sig { params(args: T.nilable(T::Array[T.untyped]), _arg1: T.untyped, block: T.untyped).returns(T.untyped) }
  def with_body(*args, **_arg1, &block); end

  sig { params(args: T.nilable(T::Array[T.untyped]), _arg1: T.untyped, block: T.untyped).returns(T.untyped) }
  def with_extra(*args, **_arg1, &block); end

  sig { params(args: T.nilable(T::Array[T.untyped]), _arg1: T.untyped, block: T.untyped).returns(T.untyped) }
  def with_header(*args, **_arg1, &block); end

  sig { params(args: T.nilable(T::Array[T.untyped]), _arg1: T.untyped, block: T.untyped).returns(T.untyped) }
  def with_summary(*args, **_arg1, &block); end
end
