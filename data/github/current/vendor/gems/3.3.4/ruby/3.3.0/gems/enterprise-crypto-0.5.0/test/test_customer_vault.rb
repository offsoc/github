require 'helper'

context "Customer Vault" do
  setup do
    secret_key = File.read(File.join(KEY_DIR, 'customer_sec.gpg'))
    public_key = File.read(File.join(KEY_DIR, 'customer_pub.gpg'))

    @vault = Enterprise::Crypto::CustomerVault.new(secret_key, public_key, blank_password: true)
    Enterprise::Crypto.customer_vault = @vault
  end

  test "Generating a customer key signed by the Customer Key" do
    key = @vault.generate_customer_key('Foo', 'foo@example.com', 'abc123')

    Enterprise::Crypto.with_vault(@vault) do
      Enterprise::Crypto::Vault.verify_key_signature!(key, @vault.secret_key)
    end
  end

  test "Generating a customer key with the proper attributes" do
    key = @vault.generate_customer_key('Foo', 'foo@example.com', 'abc123')

    assert_equal key.name, 'Foo'
    assert_equal key.email, 'foo@example.com'
    assert_equal key.comment, 'abc123'
  end
end
