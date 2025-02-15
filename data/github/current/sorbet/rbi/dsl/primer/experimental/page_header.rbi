# typed: true

# DO NOT EDIT MANUALLY
# This is an autogenerated file for dynamic methods in `Primer::Experimental::PageHeader`.
# Please instead update this file by running `bin/tapioca dsl Primer::Experimental::PageHeader`.

class Primer::Experimental::PageHeader
  sig { returns(T.untyped) }
  def actions; end

  sig { returns(T::Boolean) }
  def actions?; end

  sig { returns(T.untyped) }
  def back_button; end

  sig { returns(T::Boolean) }
  def back_button?; end

  sig { returns(T.untyped) }
  def description; end

  sig { returns(T::Boolean) }
  def description?; end

  sig { returns(T.untyped) }
  def leading_visual; end

  sig { returns(T::Boolean) }
  def leading_visual?; end

  sig { returns(T.untyped) }
  def navigation; end

  sig { returns(T::Boolean) }
  def navigation?; end

  sig { returns(T.untyped) }
  def parent_link; end

  sig { returns(T::Boolean) }
  def parent_link?; end

  sig { returns(T.untyped) }
  def title; end

  sig { returns(T::Boolean) }
  def title?; end

  sig { returns(T.untyped) }
  def trailing_visual; end

  sig { returns(T::Boolean) }
  def trailing_visual?; end

  sig { params(args: T.nilable(T::Array[T.untyped]), _arg1: T.untyped, block: T.untyped).returns(T.untyped) }
  def with_actions(*args, **_arg1, &block); end

  sig { params(args: T.nilable(T::Array[T.untyped]), _arg1: T.untyped, block: T.untyped).returns(T.untyped) }
  def with_back_button(*args, **_arg1, &block); end

  sig { params(args: T.nilable(T::Array[T.untyped]), _arg1: T.untyped, block: T.untyped).returns(T.untyped) }
  def with_description(*args, **_arg1, &block); end

  sig { params(args: T.nilable(T::Array[T.untyped]), _arg1: T.untyped, block: T.untyped).returns(T.untyped) }
  def with_leading_visual(*args, **_arg1, &block); end

  sig { params(args: T.nilable(T::Array[T.untyped]), _arg1: T.untyped, block: T.untyped).returns(T.untyped) }
  def with_navigation(*args, **_arg1, &block); end

  sig { params(args: T.nilable(T::Array[T.untyped]), _arg1: T.untyped, block: T.untyped).returns(T.untyped) }
  def with_parent_link(*args, **_arg1, &block); end

  sig { params(args: T.nilable(T::Array[T.untyped]), _arg1: T.untyped, block: T.untyped).returns(T.untyped) }
  def with_title(*args, **_arg1, &block); end

  sig { params(args: T.nilable(T::Array[T.untyped]), _arg1: T.untyped, block: T.untyped).returns(T.untyped) }
  def with_trailing_visual(*args, **_arg1, &block); end
end
