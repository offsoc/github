# typed: true

# DO NOT EDIT MANUALLY
# This is an autogenerated file for dynamic methods in `Api::App::PlatformTypes::SponsorshipPrivacy`.
# Please instead update this file by running `bin/tapioca dsl Api::App::PlatformTypes::SponsorshipPrivacy`.

module Api::App::PlatformTypes::SponsorshipPrivacy
  sig { returns(T::Boolean) }
  def private?; end

  sig { returns(T::Boolean) }
  def public?; end

  PRIVATE = T.let("PRIVATE", String)
  PUBLIC = T.let("PUBLIC", String)
end
