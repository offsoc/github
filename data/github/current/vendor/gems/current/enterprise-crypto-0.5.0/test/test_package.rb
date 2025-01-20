require 'helper'

context "Package" do
  setup do
    @now = Time.now

    package_secret_key = File.read(File.join(KEY_DIR, 'package_sec.gpg'))
    package_public_key = File.read(File.join(KEY_DIR, 'package_pub.gpg'))
    @package_vault = PackageVault.new(package_secret_key, package_public_key, blank_password: true)

    Enterprise::Crypto.package_vault = @package_vault

    @cookbooks = File.join(Dir.mktmpdir, 'enterprise-cookbooks')
    @recipes = File.join(@cookbooks, 'cookbooks')
    @roles = File.join(@cookbooks, 'roles')

    FileUtils.mkdir_p File.join(@recipes, 'foo', 'recipes')
    FileUtils.touch   File.join(@recipes, 'foo', 'recipes', 'default.rb')
    FileUtils.mkdir_p File.join(@recipes, 'foo', 'files', 'default')
    FileUtils.touch   File.join(@recipes, 'foo', 'files', 'default', 'id_rsa')

    FileUtils.mkdir   @roles
    FileUtils.touch   File.join(@roles, 'build.rb')

    debs_dir      = File.join(Dir.mktmpdir, 'debs')
    @code_debs    = [File.join(debs_dir, 'github.deb')]
    @package_debs = [File.join(debs_dir, 'cowsay.deb')]

    (@code_debs + @package_debs).each do |path|
      FileUtils.mkdir_p(File.dirname(path))
      FileUtils.touch(path)
    end

    @version = '2011.08.1234'
    @empty_md5 = 'd41d8cd98f00b204e9800998ecf8427e'
  end

  test "creating a new package." do
    Package.new(@version, @recipes, @roles, @debs)
  end

  test "generating a package file." do
    package = Package.new(@version, @recipes, @roles, @debs)
    file    = File.join(Dir.mktmpdir, 'github.ghp')

    assert !File.exist?(file)

    package.to_ghp(file)

    assert File.exist?(file)
  end

  test "roundtripping a package file." do
    package = Package.new(@version, @recipes, @roles, @code_debs, @package_debs)
    file    = File.join(Dir.mktmpdir, 'github.ghp')

    package.to_ghp(file)

    output_dir = Dir.mktmpdir

    Package.extract(file, output_dir)

    assert File.exist?(File.join(output_dir, 'code_debs', 'github.deb'))
    assert File.exist?(File.join(output_dir, 'package_debs', 'cowsay.deb'))
    assert File.exist?(File.join(output_dir, 'cookbooks', 'foo', 'recipes', 'default.rb'))
    assert File.exist?(File.join(output_dir, 'roles', 'build.rb'))
  end

  test "metadata includes the version." do
    package = Package.new(@version, @recipes, @roles, @debs)
    file    = File.join(Dir.mktmpdir, 'github.ghp')

    package.to_ghp(file)

    output_dir = Dir.mktmpdir
    Package.extract(file, output_dir)

    metadata_file = File.join(output_dir, 'metadata.json')

    assert File.exist?(metadata_file)

    metadata = JSON.parse(File.read(metadata_file))

    assert metadata['version']
  end

  test "metadata includes the md5 checksum of debian packages." do
    package = Package.new(@version, @recipes, @roles, @code_debs, @package_debs)

    assert_equal @empty_md5, package.metadata['checksum']['code_debs/github.deb']
    assert_equal @empty_md5, package.metadata['checksum']['package_debs/cowsay.deb']
  end

  test "extract fails if the checksums don't match." do
    package = Package.new(@version, @recipes, @roles, @code_debs, @package_debs)
    file    = File.join(Dir.mktmpdir, 'github.ghp')

    package.to_ghp(file)

    output_dir = Dir.mktmpdir

    with_corrupt_md5 do
      assert_raise(Error) do
        Package.extract(file, output_dir)
      end
    end

    assert_equal [], Dir.glob(File.join(output_dir, '**', '*'))
  end

  test "unpacking executes the support script." do
    file        = File.join(Dir.mktmpdir, 'github.ghp')
    tempfile    = "/tmp/.enterprise-crypto-#{@version}"
    output_dir  = Dir.mktmpdir

    support_script = <<-BASH
#!/bin/bash
touch #{tempfile}
    BASH

    File.delete(tempfile) if File.exist?(tempfile)

    package = Package.new(@version, @recipes, @roles, @code_debs, @package_debs, nil, support_script)
    package.to_ghp(file)

    Package.extract(file, output_dir)

    assert File.exist?(tempfile)
  end

  test "cleans out the cookbooks." do
    assert !Dir.glob(File.join(@cookbooks, '**', 'id_rsa')).empty?

    package = Package.new(@version, @recipes, @roles, @code_debs, @package_debs)
    file    = File.join(Dir.mktmpdir, 'github.ghp')

    package.to_ghp(file)

    output_dir = Dir.mktmpdir

    Package.extract(file, output_dir)

    assert Dir.glob(File.join(output_dir, 'cookbooks', '**', 'id_rsa')).empty?
  end

  test "specific input directory" do
    input_dir = Dir.mktmpdir

    package = Package.new(@version, @recipes, @roles, @code_debs, @package_debs)
    file    = File.join(Dir.mktmpdir, 'github.ghp')

    package.to_ghp(file, Enterprise::Crypto.package_vault, input_dir)

    assert !Dir.glob(File.join(input_dir, '*')).empty?

    FileUtils.rm_rf(input_dir)
  end

  test "sets a specific architecture in the metadata" do
    package = Package.new(@version, @recipes, @roles, @code_debs, @package_debs)

    assert_equal package.metadata['architecture'], 'i386'

    package.architecture = 'x86_64'

    assert_equal package.metadata['architecture'], 'x86_64'
  end
end
