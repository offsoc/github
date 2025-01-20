require "treelights/version"
require "treelights/proto/highlighter_twirp"

module Github
  module Treelights
    class Client
      class ResponseError < StandardError; end
  
      attr_reader :rpc
  
      def initialize(conn)
        @rpc = Github::Treelights::HighlighterClient.new(conn)
      end
  
      def highlight(scopes, contents, timeout: 0, mode: :DEFAULT, highlight_format: :HTML)
        req = self.class.highlight_request(scopes, contents, timeout, mode, highlight_format)
        res = rpc.highlight(req)
  
        raise ResponseError.new(res.error.to_s) if res.error
  
        # The response may contain fewer documents than the request, if
        # some documents couldn't be highlighted, either because of timeouts
        # or unknown scopes
        index = 0
        result = Array.new(req.docs.length)
        res.data.docs.each do |highlighted|
          # Leave a `nil` value for any documents that couldn't be highlighted.
          index += 1 while req.docs[index].id != highlighted.id
          result[index] = highlighted.lines.to_a
        end
  
        result
      end

      def styling_directives(scopes, contents, timeout: 0)
        req = self.class.styling_directives_request(scopes, contents, timeout)
        res = rpc.styling_directives(req)

        raise ResponseError.new(res.error.to_s) if res.error

        # The response may contain fewer documents than the request, if
        # some documents couldn't be highlighted, either because of timeouts
        # or unknown scopes
        index = 0
        result = Array.new(req.docs.length)
        res.data.docs.each do |highlighted|
          # Leave a `nil` value for any documents that couldn't be highlighted.
          index += 1 while req.docs[index].id != highlighted.id
          result[index] = highlighted.lines.to_a
        end

        result
      end

      def info
        res = rpc.info(Github::Treelights::InfoRequest.new)
        raise ResponseError.new(res.error.to_s) if res.error
  
        {
          version: res.data.version,
          scopes: res.data.scopes
        }
      end
  
      def self.highlight_request(scopes, contents, timeout, mode, highlight_format)
        Github::Treelights::HighlightRequest.new(
          docs: documents(scopes, contents),
          timeout_ms: timeout,
          mode: mode,
          format: highlight_format
        )
      end

      def self.styling_directives_request(scopes, contents, timeout)
        Github::Treelights::StylingDirectivesRequest.new(
          docs: documents(scopes, contents),
          timeout_ms: timeout
        )
      end

      def self.documents(scopes, contents)
        if scopes.size != contents.size
          raise ArgumentError.new("scopes and contents should have the same length")
        end

        scopes.zip(contents).map.with_index do |(scope, content), i|
          content = content.b if content.encoding != Encoding::ASCII_8BIT
          Github::Treelights::Document.new(id: i, content: content, scope: scope)
        end
      end
    end
  end
end
