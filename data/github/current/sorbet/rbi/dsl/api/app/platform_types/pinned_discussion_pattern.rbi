# typed: true

# DO NOT EDIT MANUALLY
# This is an autogenerated file for dynamic methods in `Api::App::PlatformTypes::PinnedDiscussionPattern`.
# Please instead update this file by running `bin/tapioca dsl Api::App::PlatformTypes::PinnedDiscussionPattern`.

module Api::App::PlatformTypes::PinnedDiscussionPattern
  sig { returns(T::Boolean) }
  def chevron_up?; end

  sig { returns(T::Boolean) }
  def dot?; end

  sig { returns(T::Boolean) }
  def dot_fill?; end

  sig { returns(T::Boolean) }
  def heart_fill?; end

  sig { returns(T::Boolean) }
  def plus?; end

  sig { returns(T::Boolean) }
  def zap?; end

  CHEVRON_UP = T.let("CHEVRON_UP", String)
  DOT = T.let("DOT", String)
  DOT_FILL = T.let("DOT_FILL", String)
  HEART_FILL = T.let("HEART_FILL", String)
  PLUS = T.let("PLUS", String)
  ZAP = T.let("ZAP", String)
end
