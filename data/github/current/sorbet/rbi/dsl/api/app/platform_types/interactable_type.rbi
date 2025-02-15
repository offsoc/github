# typed: true

# DO NOT EDIT MANUALLY
# This is an autogenerated file for dynamic methods in `Api::App::PlatformTypes::InteractableType`.
# Please instead update this file by running `bin/tapioca dsl Api::App::PlatformTypes::InteractableType`.

module Api::App::PlatformTypes::InteractableType
  sig { returns(T::Boolean) }
  def issue?; end

  sig { returns(T::Boolean) }
  def pull_request?; end

  ISSUE = T.let("ISSUE", String)
  PULL_REQUEST = T.let("PULL_REQUEST", String)
end
