# typed: true

# DO NOT EDIT MANUALLY
# This is an autogenerated file for dynamic methods in `PlatformTypes::CommentBodyFormatter`.
# Please instead update this file by running `bin/tapioca dsl PlatformTypes::CommentBodyFormatter`.

module PlatformTypes::CommentBodyFormatter
  sig { returns(T::Boolean) }
  def email?; end

  sig { returns(T::Boolean) }
  def markdown?; end

  EMAIL = T.let("EMAIL", String)
  MARKDOWN = T.let("MARKDOWN", String)
end
