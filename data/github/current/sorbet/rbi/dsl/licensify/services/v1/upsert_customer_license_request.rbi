# typed: true

# DO NOT EDIT MANUALLY
# This is an autogenerated file for dynamic methods in `Licensify::Services::V1::UpsertCustomerLicenseRequest`.
# Please instead update this file by running `bin/tapioca dsl Licensify::Services::V1::UpsertCustomerLicenseRequest`.

class Licensify::Services::V1::UpsertCustomerLicenseRequest
  sig { params(customerLicense: T.nilable(Licensify::Services::V1::CustomerLicense)).void }
  def initialize(customerLicense: nil); end

  sig { void }
  def clear_customerLicense; end

  sig { returns(T.nilable(Licensify::Services::V1::CustomerLicense)) }
  def customerLicense; end

  sig { params(value: T.nilable(Licensify::Services::V1::CustomerLicense)).void }
  def customerLicense=(value); end
end
