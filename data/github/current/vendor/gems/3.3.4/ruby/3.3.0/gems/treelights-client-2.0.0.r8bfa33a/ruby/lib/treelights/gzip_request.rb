require 'faraday'
require 'zlib'

module Github::Treelights
  class GzipRequest < Faraday::Middleware
    GZIP = 'gzip'
    CONTENT_ENCODING = 'Content-Encoding'
    MIN_CONTENT_LENGTH = 1400

    def call(env)
      # Only bother gzipping if the body is larger than a typical network packet.
      if env.body.bytesize > MIN_CONTENT_LENGTH
        env[:request_headers][CONTENT_ENCODING] = GZIP
        env[:body] = Zlib.gzip(env[:body])
      end
      @app.call(env)
    end
  end
end
