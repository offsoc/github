class TestVault < Enterprise::Crypto::Vault
  KEYS = %w[
    test_gh_vm_pub.gpg
    test_gh_vm_sec.gpg
    test_gh_license_pub.gpg
    test_gh_license_sec.gpg
  ]

  VM_FINGERPRINT      = '7779C3A9AF320038272D262C4CB0870FE9C32698'
  LICENSE_FINGERPRINT = 'EF6C76BB97CBA0C9C07E963416465F38E6C788C5'

  def load_vault
    KEYS.each do |key|
      import_key(File.read(File.join(File.dirname(__FILE__), 'files', key)))
    end
  end

  def vm_public_key
    find_public_key(VM_FINGERPRINT)
  end

  def vm_private_key
    find_private_key(VM_FINGERPRINT)
  end

  def license_public_key
    find_public_key(LICENSE_FINGERPRINT)
  end

  def license_private_key
    find_private_key(LICENSE_FINGERPRINT)
  end
end
