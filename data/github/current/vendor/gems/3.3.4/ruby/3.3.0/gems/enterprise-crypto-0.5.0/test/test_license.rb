# -*- coding: utf-8 -*-
require 'helper'
require 'rubygems/package'

context "License" do
  setup do
    @now = DateTime.now

    customer_secret_key = File.read(File.join(KEY_DIR, 'customer_sec.gpg'))
    customer_public_key = File.read(File.join(KEY_DIR, 'customer_pub.gpg'))
    @customer_vault = CustomerVault.new(customer_secret_key, customer_public_key, blank_password: true)

    license_secret_key = File.read(File.join(KEY_DIR, 'license_sec.gpg'))
    license_public_key = File.read(File.join(KEY_DIR, 'license_pub.gpg'))
    @license_vault = LicenseVault.new(license_secret_key, license_public_key, blank_password: true)

    Enterprise::Crypto.customer_vault = @customer_vault
    Enterprise::Crypto.license_vault  = @license_vault
  end

  test "generating a new license." do
    name      = "Fake Customer"
    email     = "fake@example.com"
    seats     = 100
    support   = "support"

    customer = Enterprise::Crypto.with_vault(@customer_vault) do
      Customer.generate(name, email)
    end

    license = Enterprise::Crypto.with_vault(@license_vault) do
      customer.generate_license(seats, @now, support)
    end

    assert_equal license.customer, customer

    assert_valid_license license, \
      :name => name,
      :email => email,
      :seats => seats,
      :now => @now.to_s

    assert_equal customer.secret_key_data, license.customer_private_key
    assert_equal customer.public_key_data, license.customer_public_key
    assert_equal support, license.support_key
    assert_false license.metered
  end

  test "roundtripping from a License to binary and back." do
    name      = "Fake Customer"
    email     = "fake@example.com"
    seats     = 100

    original_license = Enterprise::Crypto.with_vault(@customer_vault) do
      customer = Customer.generate(name, email)
      customer.generate_license(seats, @now)
    end

    license = Enterprise::Crypto.with_vault(@license_vault) do
      data = original_license.to_bin

      License.load(data)
    end

    assert_valid_license license, \
      :name => name,
      :email => email,
      :seats => seats,
      :now => @now.to_s

    assert_equal original_license.customer_private_key, license.customer_private_key
    assert_equal original_license.customer_public_key,  license.customer_public_key
    assert_equal original_license.support_key,          license.support_key
    assert_equal original_license.learning_lab_seats,   nil # EntWeb-generated license *may* have this key.
    assert_equal original_license.learning_lab_evaluation_expires, nil # EntWeb-generated license *may* have this key.
    assert_equal original_license.insights_enabled,     false
    assert_equal original_license.insights_expire_at,   nil
    assert_equal original_license.advanced_security_enabled,   false
    assert_equal original_license.advanced_security_seats, nil
    assert_equal original_license.metered, false
  end

  test "roundtripping from a License to binary and back, with optional fields set." do
    name      = "Fake Customer"
    email     = "fake@example.com"
    seats     = 100

    original_license = Enterprise::Crypto.with_vault(@customer_vault) do
      customer = Customer.generate(name, email)
      customer.generate_license(seats, @now)
    end
    original_license.learning_lab_seats = 40
    original_license.learning_lab_evaluation_expires = @now
    original_license.insights_enabled = true
    original_license.insights_expire_at = @now
    original_license.advanced_security_enabled = true
    original_license.advanced_security_seats = 42
    original_license.metered = true

    license = Enterprise::Crypto.with_vault(@license_vault) do
      data = original_license.to_bin

      License.load(data)
    end

    assert_valid_license license, \
      :name => name,
      :email => email,
      :seats => seats,
      :now => @now.to_s,
      :metered => true

    assert_equal original_license.customer_private_key,            license.customer_private_key
    assert_equal original_license.customer_public_key,             license.customer_public_key
    assert_equal original_license.support_key,                     license.support_key
    assert_equal original_license.learning_lab_seats,              40
    assert_equal original_license.learning_lab_evaluation_expires, @now
    assert_equal original_license.insights_enabled,                true
    assert_equal original_license.insights_expire_at,              @now
    assert_equal original_license.advanced_security_enabled,       true
    assert_equal original_license.advanced_security_seats,         42
    assert_equal original_license.metered,                         true
  end

  test "Verify license tar paths" do
    name      = "Fake Customer"
    email     = "fake@example.com"
    seats     = 100

    original_license = Enterprise::Crypto.with_vault(@customer_vault) do
      customer = Customer.generate(name, email)
      customer.generate_license(seats, @now)
    end

    data = nil
    Enterprise::Crypto.with_vault(@license_vault) do
      data = original_license.to_tar(original_license.to_dir).read
    end

    t = Tempfile.new("license-test")
    t.write(data)
    t.close

    tar = Gem::Package::TarReader.new(StringIO.new(data))
    entries = 0
    tar.each do |entry|
      assert entry.full_name !~ /^\.\//, "expected #{entry.full_name} to not start with ./" if entry.file?
      entries += 1
    end
    assert entries > 0
  end

  test "license from tar returns false when the tar process exits uncleanly" do
    # generate tar data
    name      = "Fake Customer"
    email     = "fake@example.com"
    seats     = 100

    original_license = Enterprise::Crypto.with_vault(@customer_vault) do
      customer = Customer.generate(name, email)
      customer.generate_license(seats, @now)
    end

    # create tar data
    data = nil
    Enterprise::Crypto.with_vault(@license_vault) do
      data = original_license.to_tar(original_license.to_dir)
    end

    tar_path = data.path
    data.close

    # make it unreadable
    FileUtils.chmod(0100, tar_path)

    Enterprise::Crypto.with_vault(@license_vault) do
      status = License.from_tar(tar_path)
      refute status
    end
  end

  test "license raises error when loading bad data" do
    assert_raises Enterprise::Crypto::Error do
      License.load("bad license data", @license_vault)
    end
  end

  test "optional support key." do
    original_license = Enterprise::Crypto.with_vault(@customer_vault) do
      customer = Customer.generate('Fake Customer', 'fake@example.com')
      customer.generate_license(100, @now, 'SUPPORT PUBLIC KEY')
    end

    license = Enterprise::Crypto.with_vault(@license_vault) do
      data = original_license.to_bin

      License.load(data)
    end

    license.support_key == 'SUPPORT PUBLIC KEY'
  end

  test "generating a new evaluation license" do
    metadata = { :evaluation => true }
    original_license = Enterprise::Crypto.with_vault(@customer_vault) do
      customer = Customer.generate('Fake Customer', 'fake@example.com')
      customer.generate_license(0, @now, 'SUPPORT PUBLIC KEY', metadata)
    end

    license = Enterprise::Crypto.with_vault(@license_vault) do
      data = original_license.to_bin

      License.load(data)
    end

    assert license.evaluation?, 'is an evaluation license'
  end

  test "generating a new license with unlimited seating" do
    metadata = { :unlimited_seating => true }
    original_license = Enterprise::Crypto.with_vault(@customer_vault) do
      customer = Customer.generate('Fake Customer', 'fake@example.com')
      customer.generate_license(0, @now, 'SUPPORT PUBLIC KEY', metadata)
    end

    license = Enterprise::Crypto.with_vault(@license_vault) do
      data = original_license.to_bin

      License.load(data)
    end

    assert license.unlimited_seating?, 'is unlimited seating'
    assert_equal 0, license.seats
  end

  test "generating a new license with perpetual length" do
    metadata = { :perpetual => true }
    original_license = Enterprise::Crypto.with_vault(@customer_vault) do
      customer = Customer.generate('Fake Customer', 'fake@example.com')
      customer.generate_license(0, @now, 'SUPPORT PUBLIC KEY', metadata)
    end

    license = Enterprise::Crypto.with_vault(@license_vault) do
      data = original_license.to_bin

      License.load(data)
    end

    assert license.perpetual?, 'is perpetual'
    assert_equal 0, license.seats
  end

  test "fields for Learning Lab licenses" do
    learning_lab_seats = 10
    learning_lab_evaluation_expires = DateTime.now.iso8601

    metadata = {
      learning_lab_seats: learning_lab_seats,
      learning_lab_evaluation_expires: learning_lab_evaluation_expires
    }

    original_license = Enterprise::Crypto.with_vault(@customer_vault) do
      customer = Customer.generate('Fake Customer', 'fake@example.com')
      customer.generate_license(0, @now, 'SUPPORT PUBLIC KEY', metadata)
    end

    license = Enterprise::Crypto.with_vault(@license_vault) do
      data = original_license.to_bin

      License.load(data)
    end

    assert_equal license.learning_lab_seats, learning_lab_seats
    assert_equal license.learning_lab_evaluation_expires, learning_lab_evaluation_expires
  end

  test "encoding" do
    old_internal = Encoding.default_internal
    Encoding.default_internal = Encoding::UTF_8

    original_license = Enterprise::Crypto.with_vault(@customer_vault) do
      customer = Customer.generate('Chäschüchli', 'cheese@google.ch')
      customer.generate_license(100, @now, 'SUPPORT PUBLIC KEY')
    end
    assert_equal 'Chäschüchli', original_license.customer.name

    license = Enterprise::Crypto.with_vault(@license_vault) do
      data = original_license.to_bin

      License.load(data)
    end

    assert_equal 'Chäschüchli', license.customer.name
    Encoding.default_internal = old_internal
  end

  test "unsigned license does not validate." do
    name      = "Fake Customer"
    email     = "fake@example.com"
    seats     = 100

    original_license = Enterprise::Crypto.with_vault(@customer_vault) do
      customer = Customer.generate(name, email)
      customer.generate_license(seats, @now)
    end

    data = nil
    license = Enterprise::Crypto.with_vault(@license_vault) do
      data = original_license.to_bin

      License.load(data)
    end

    assert_valid_license license, \
      :name => name,
      :email => email,
      :seats => seats,
      :now => @now.to_s

    assert_equal original_license.customer_private_key, license.customer_private_key
    assert_equal original_license.customer_public_key,  license.customer_public_key
    assert_equal original_license.support_key,          license.support_key

    tmp_dir = Dir.mktmpdir
    File.open(File.join(tmp_dir, "license.ghl"), "wb") {|f| f << data }

    # We are "decrypting" a known good license file and then repackaging it
    # using the "--store" gpg option to create a license file with no
    # signatures.
    command = %w[gpg]
    command << "--skip-verify"
    command << "--no-permission-warning"
    command << "--decrypt #{File.join(tmp_dir, 'license.ghl')}"
    command << "2>/dev/null"
    command << "| gpg"
    command << "--store"
    command << "--output #{File.join(tmp_dir, 'unsigned_license.ghl')}"
    command << "2>/dev/null"

    %x{#{command.join(' ')}}
    # Re-run as this can randomly fail on the first run.
    %x{#{command.join(' ')}} if $?.exitstatus != 0

    Enterprise::Crypto.with_vault(@license_vault) do
      data = File.open(File.join(tmp_dir, "unsigned_license.ghl")).read

      assert_raise(Enterprise::Crypto::Error) do
        License.load(data)
      end
    end

  end

  test "removes the extraction directory" do
    name      = "Fake Customer"
    email     = "fake@example.com"
    seats     = 100

    original_license = Enterprise::Crypto.with_vault(@customer_vault) do
      customer = Customer.generate(name, email)
      customer.generate_license(seats, @now)
    end

    extraction_dir = Dir.mktmpdir
    Enterprise::Crypto.with_vault(@license_vault) do
      data = original_license.to_bin

      License.load(data, @license_vault, extraction_dir)
    end

    assert !File.directory?(extraction_dir)
  end
end
