require "aleph/version"
require "aleph/proto/code_analysis_twirp"

module Aleph
  class AnalysisClient
    attr_reader :rpc, :proxy

    def initialize(conn)
      @rpc = Aleph::Proto::CodeAnalysisClient.new(conn)
    end

    # Public: Check the health of the service.
    #
    # Returns Twirp::ClientResp with Semanticd::Proto::PingResponse.
    def ping
      res = rpc.ping(service: "aleph-client")
      if res.error
        raise ResponseError.new(res.error.to_s)
      end

      res.data
    end

    # Public: Generate symbols for blobs.
    #
    # blobs - Array of Hashes with the following keys
    #   :content  - String blob content
    #   :path     - String path
    #   :language - Symbol language as defined in proto schema.
    #
    # Returns a Semanticd::Proto::ParseTreeSymbolResponse.
    # Raises Semanticd::Client::ResponseError on errors.
    def parse_tree_symbols(blobs:)
      blobs = blobs.map { |b| to_api_blob(b) }

      res = rpc.parse_tree_symbols(blobs: blobs)
      if res.error
        raise ResponseError.new(res.error.to_s)
      end

      res.data
    end

    # Public: Generate incremental stack graphs for blobs.
    #
    # blobs - Array of Hashes with the following keys
    #   :content  - String blob content
    #   :path     - String path
    #   :language - Symbol language as defined in proto schema.
    #
    # Returns a Semanticd::Proto::StackGraphResponse.
    # Raises Semanticd::Client::ResponseError on errors.
    def get_stack_graphs(blobs:, package_name: "")
      blobs = blobs.map { |b| to_api_blob(b) }

      res = rpc.get_stack_graphs(blobs: blobs, package_name: package_name)
      if res.error
        raise ResponseError.new(res.error.to_s)
      end

      res.data
    end

    private

    def to_api_blob(info)
      Aleph::Proto::Blob.new(
        path: info[:path],
        content: info[:content],
        language: info[:language]
      )
    end
  end
end
