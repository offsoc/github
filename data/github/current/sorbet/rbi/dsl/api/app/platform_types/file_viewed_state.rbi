# typed: true

# DO NOT EDIT MANUALLY
# This is an autogenerated file for dynamic methods in `Api::App::PlatformTypes::FileViewedState`.
# Please instead update this file by running `bin/tapioca dsl Api::App::PlatformTypes::FileViewedState`.

module Api::App::PlatformTypes::FileViewedState
  sig { returns(T::Boolean) }
  def dismissed?; end

  sig { returns(T::Boolean) }
  def unviewed?; end

  sig { returns(T::Boolean) }
  def viewed?; end

  DISMISSED = T.let("DISMISSED", String)
  UNVIEWED = T.let("UNVIEWED", String)
  VIEWED = T.let("VIEWED", String)
end
