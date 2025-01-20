require 'helper'

context "Tar" do
  setup do
    class TarMock
      include Enterprise::Crypto::Tar
      def self.extract(tar_path, output)
        from_tar(tar_path, output)
      end
    end
    @tar = TarMock.new
  end

  test "creating a new tar file, untarring" do
    Dir.mktmpdir do |tmpdir|
      testdir = File.join(tmpdir, 'tar-test')
      FileUtils.mkdir_p testdir
      FileUtils.touch File.join(testdir, 'foo')
      tarpath = File.join(tmpdir, 'test.tar')
      file = @tar.to_tar(testdir, tarpath)

      assert file.is_a? File
      assert File.exist?(file), "Tar file not found"

      outdir = File.join(tmpdir, 'tar-test-out')
      FileUtils.mkdir_p outdir
      from_tar_returned = @tar.class.extract(tarpath, outdir)

      assert_equal true, from_tar_returned, "from_tar did not return boolean true"
      assert File.exist?(File.join(outdir,'foo')), "Expected output from untarring not found"
    end
  end
end

