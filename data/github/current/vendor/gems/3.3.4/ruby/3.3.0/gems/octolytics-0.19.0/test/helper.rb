require "minitest/autorun"
require "webmock/minitest"
require "support/vcr_minitest"
require "stringio"
require "zlib"
require "uri"

module FactoryHelpers
  def build(type, *args)
    send("build_#{type}", *args)
  end

  def gzip(text)
    compressed_data = StringIO.new
    writer = Zlib::GzipWriter.new(compressed_data)
    writer << text
    writer.close

    compressed_data.string
  end
end

Minitest::Test.send :include, FactoryHelpers
