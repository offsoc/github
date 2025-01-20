require 'helper'

context "Vault" do

  setup do
    @vault = Vault.new
    @vault.open!
  end

  test "Master Public Key" do
    assert @vault.master_key
  end

  test "raises an error when a key signature is missing." do
    key = File.read(File.join(KEY_DIR, 'unsigned_pub.gpg'))

    assert_raise(Enterprise::Crypto::Error) do
      vault = Vault.new(key)
      vault.open!
    end
  end

  test "verify_key_fingerprint! raises an error when a fingerprint doesn't match" do
    return # pending("Can't find a secret key when the fingerprints don't match.")

    private_key = File.read(File.join(KEY_DIR, 'license_sec.gpg'))
    public_key  = File.read(File.join(KEY_DIR, 'customer_pub.gpg'))

    assert_raise(Enterprise::Crypto::Error) do
      vault = Vault.new(private_key, public_key)
      vault.open!
    end
  end

  test "blank_password" do
    vault = Vault.new
    refute_includes vault.default_context_options, :pinentry_mode
    refute_includes vault.default_context_options, :password

    vault = Vault.new(blank_password: true)
    assert_equal GPGME::PINENTRY_MODE_LOOPBACK, vault.default_context_options.fetch(:pinentry_mode)
    assert_equal "", vault.default_context_options.fetch(:password)
  end
end
