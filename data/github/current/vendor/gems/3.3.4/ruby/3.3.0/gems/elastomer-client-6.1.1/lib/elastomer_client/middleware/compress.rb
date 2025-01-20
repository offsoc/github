# frozen_string_literal: true
require "stringio"

module ElastomerClient
  module Middleware
    # Request middleware that compresses request bodies with GZip for supported
    # versions of Elasticsearch.
    #
    # It will only compress when there is a request body that is a String. This
    # middleware should be inserted after JSON serialization.
    class Compress < Faraday::Middleware
      CONTENT_ENCODING = "Content-Encoding"
      GZIP = "gzip"
      # An Ethernet packet can hold 1500 bytes. No point in compressing anything smaller than that (plus some wiggle room).
      MIN_BYTES_FOR_COMPRESSION = 1400

      attr_reader :compression

      # options - The Hash of "keyword" arguments.
      #           :compression - the compression level (0-9, default Zlib::DEFAULT_COMPRESSION)
      def initialize(app, options = {})
        super(app)
        @compression = options[:compression] || Zlib::DEFAULT_COMPRESSION
      end

      def call(env)
        if body = env[:body]
          if body.is_a?(String) && body.bytesize > MIN_BYTES_FOR_COMPRESSION
            output = StringIO.new
            output.set_encoding("BINARY")
            gz = Zlib::GzipWriter.new(output, compression, Zlib::DEFAULT_STRATEGY)
            gz.write(env[:body])
            gz.close
            env[:body] = output.string
            env[:request_headers][CONTENT_ENCODING] = GZIP
          end
        end

        @app.call(env)
      end
    end
  end
end

Faraday::Request.register_middleware(elastomer_compress: ElastomerClient::Middleware::Compress)
