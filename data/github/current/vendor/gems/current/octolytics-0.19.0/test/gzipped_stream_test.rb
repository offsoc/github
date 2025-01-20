require "helper"
require "octolytics/gzipped_stream"
require "stringio"
require "zlib"
require "digest/md5"

class GzippedStreamTest < Minitest::Test
  BLOCKSIZE=1024*10
  CONTENT_HASH="f3f69037d653be0287584bb84caddede"
  def test_gzipped_stream
    digest = Digest::MD5.new
    stream = Octolytics::GzippedStream.new(lambda { |chunk| digest << chunk })
    File.open(File.join(File.dirname(__FILE__), 'gzip/gzip-test.gz')) do |f|
      stream.call(f.read(BLOCKSIZE)) until f.eof?
    end
    stream.close

    assert_equal digest.hexdigest, CONTENT_HASH
  end
end
