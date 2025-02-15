# typed: true

# DO NOT EDIT MANUALLY
# This is an autogenerated file for dynamic methods in `Api::App::PlatformTypes::MergeQueueMethod`.
# Please instead update this file by running `bin/tapioca dsl Api::App::PlatformTypes::MergeQueueMethod`.

module Api::App::PlatformTypes::MergeQueueMethod
  sig { returns(T::Boolean) }
  def group?; end

  sig { returns(T::Boolean) }
  def jump?; end

  sig { returns(T::Boolean) }
  def solo?; end

  GROUP = T.let("GROUP", String)
  JUMP = T.let("JUMP", String)
  SOLO = T.let("SOLO", String)
end
