# typed: true

# DO NOT EDIT MANUALLY
# This is an autogenerated file for dynamic methods in `Api::App::PlatformTypes::VerifiableDomainOrderField`.
# Please instead update this file by running `bin/tapioca dsl Api::App::PlatformTypes::VerifiableDomainOrderField`.

module Api::App::PlatformTypes::VerifiableDomainOrderField
  sig { returns(T::Boolean) }
  def created_at?; end

  sig { returns(T::Boolean) }
  def domain?; end

  CREATED_AT = T.let("CREATED_AT", String)
  DOMAIN = T.let("DOMAIN", String)
end
