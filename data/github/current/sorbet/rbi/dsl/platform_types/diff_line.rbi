# typed: true

# DO NOT EDIT MANUALLY
# This is an autogenerated file for dynamic methods in `PlatformTypes::DiffLine`.
# Please instead update this file by running `bin/tapioca dsl PlatformTypes::DiffLine`.

class PlatformTypes::DiffLine < GraphQL::Client::Schema::ObjectClass
  sig { returns(T.nilable(String)) }
  def __typename; end

  sig { returns(Integer) }
  def blob_line_number; end

  sig { returns(T::Boolean) }
  def blob_line_number?; end

  sig { returns(String) }
  def html; end

  sig { returns(T::Boolean) }
  def html?; end

  sig { returns(T::Boolean) }
  def is_missing_newline_at_end; end

  sig { returns(T::Boolean) }
  def is_missing_newline_at_end?; end

  sig { returns(T.nilable(Integer)) }
  def left; end

  sig { returns(T::Boolean) }
  def left?; end

  sig { returns(Integer) }
  def position; end

  sig { returns(T::Boolean) }
  def position?; end

  sig { returns(String) }
  def raw; end

  sig { returns(T::Boolean) }
  def raw?; end

  sig { returns(T.nilable(Integer)) }
  def right; end

  sig { returns(T::Boolean) }
  def right?; end

  sig { returns(String) }
  def text; end

  sig { returns(T::Boolean) }
  def text?; end

  sig { returns(T.nilable(PlatformTypes::PullRequestThreadConnection)) }
  def threads; end

  sig { returns(T::Boolean) }
  def threads?; end

  sig { returns(String) }
  def type; end

  sig { returns(T::Boolean) }
  def type?; end
end
