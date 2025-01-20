require 'helper'

context "Customer" do
  setup do
    secret_key = File.read(File.join(KEY_DIR, 'customer_sec.gpg'))
    public_key = File.read(File.join(KEY_DIR, 'customer_pub.gpg'))

    @vault = CustomerVault.new(secret_key, public_key, blank_password: true)
    Enterprise::Crypto.customer_vault = @vault
  end

  test "generating a new customer." do
    customer = Customer.generate('Fake Customer', 'fake@example.com')

    assert_equal customer.name, 'Fake Customer'
    assert_equal customer.email, 'fake@example.com'
    assert_equal customer.secret_key.name, 'Fake Customer'
    assert_equal customer.secret_key.email, 'fake@example.com'
    assert_equal customer.secret_key.comment, customer.uuid
    assert_equal customer.public_key.name, 'Fake Customer'
    assert_equal customer.public_key.email, 'fake@example.com'
    assert_equal customer.public_key.comment, customer.uuid

    assert customer.uuid

    Vault.verify_key_signature!(customer.public_key, @vault.secret_key)
  end

  test "roundtripping from a Customer to keys and back." do
    original_customer = Customer.generate('Foo Bar', 'foo@example.com')

    customer = Customer.from(original_customer.secret_key_data, original_customer.public_key_data)

    assert_equal customer, original_customer
  end

  test "exports ASCII encoded keys." do
    customer = Customer.generate('Fake Customer', 'fake@example.com')

    assert customer.public_key_data =~ /\A-----BEGIN PGP PUBLIC KEY BLOCK-----/
    assert customer.secret_key_data =~ /\A-----BEGIN PGP PRIVATE KEY BLOCK-----/
  end
end
