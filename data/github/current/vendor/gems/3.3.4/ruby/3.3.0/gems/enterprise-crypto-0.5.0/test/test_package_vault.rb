require 'helper'

context "Package Vault" do
  setup do
    package_secret_key = File.read(File.join(KEY_DIR, 'package_sec.gpg'))
    package_public_key = File.read(File.join(KEY_DIR, 'package_pub.gpg'))
    @package_vault = PackageVault.new(package_secret_key, package_public_key, blank_password: true)

    Enterprise::Crypto.package_vault = @package_vault
  end

  test "package vault raises an error on a license." do
    customer_secret_key = File.read(File.join(KEY_DIR, 'customer_sec.gpg'))
    customer_public_key = File.read(File.join(KEY_DIR, 'customer_pub.gpg'))
    customer_vault = CustomerVault.new(customer_secret_key, customer_public_key, blank_password: true)

    license_secret_key = File.read(File.join(KEY_DIR, 'license_sec.gpg'))
    license_public_key = File.read(File.join(KEY_DIR, 'license_pub.gpg'))
    license_vault = LicenseVault.new(license_secret_key, license_public_key, blank_password: true)

    customer = Enterprise::Crypto.with_vault(customer_vault) do
      Customer.generate('Foo Bar', 'foobar@example.org')
    end

    license = Enterprise::Crypto.with_vault(license_vault) do
      customer.generate_license(100, DateTime.now)
    end


    Tempfile.new(['enterprise-license', '.ghl']) do |tmp|
      tmp << license.to_bin
      tmp.close
      assert_raise(Enterprise::Crypto::Error) do
        @package_vault.read_package(tmp)
      end
    end
  end
end
