# typed: true

# DO NOT EDIT MANUALLY
# This is an autogenerated file for dynamic methods in `Site::ReadMoreListComponent`.
# Please instead update this file by running `bin/tapioca dsl Site::ReadMoreListComponent`.

class Site::ReadMoreListComponent
  sig { returns(T.untyped) }
  def items; end

  sig { returns(T::Boolean) }
  def items?; end

  sig { params(args: T.nilable(T::Array[T.untyped]), _arg1: T.untyped, block: T.untyped).returns(T.untyped) }
  def with_item(*args, **_arg1, &block); end
end
