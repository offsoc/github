# typed: true

# DO NOT EDIT MANUALLY
# This is an autogenerated file for dynamic methods in `Site::RiverComponent`.
# Please instead update this file by running `bin/tapioca dsl Site::RiverComponent`.

class Site::RiverComponent
  sig { returns(T.untyped) }
  def after; end

  sig { returns(T::Boolean) }
  def after?; end

  sig { returns(T.untyped) }
  def background; end

  sig { returns(T::Boolean) }
  def background?; end

  sig { returns(T.untyped) }
  def before; end

  sig { returns(T::Boolean) }
  def before?; end

  sig { returns(T.untyped) }
  def illustration; end

  sig { returns(T::Boolean) }
  def illustration?; end

  sig { returns(T.untyped) }
  def text; end

  sig { returns(T::Boolean) }
  def text?; end

  sig { params(args: T.nilable(T::Array[T.untyped]), _arg1: T.untyped, block: T.untyped).returns(T.untyped) }
  def with_after(*args, **_arg1, &block); end

  sig { params(args: T.nilable(T::Array[T.untyped]), _arg1: T.untyped, block: T.untyped).returns(T.untyped) }
  def with_background(*args, **_arg1, &block); end

  sig { params(args: T.nilable(T::Array[T.untyped]), _arg1: T.untyped, block: T.untyped).returns(T.untyped) }
  def with_before(*args, **_arg1, &block); end

  sig { params(args: T.nilable(T::Array[T.untyped]), _arg1: T.untyped, block: T.untyped).returns(T.untyped) }
  def with_illustration(*args, **_arg1, &block); end

  sig { params(args: T.nilable(T::Array[T.untyped]), _arg1: T.untyped, block: T.untyped).returns(T.untyped) }
  def with_text(*args, **_arg1, &block); end
end
