# frozen_string_literal: true

module GitHub
  module Spokes
    module Proto
      # GitHub::Spokes::Proto::Client is the top-level client that can be used
      # to create each API-specific client.
      class Client
        # Initialize with a URL or a Faraday::Connection.
        #
        # The URL (either as an arg here, or as the base URL on the
        # Faraday::Connection) should be one of these values:
        #
        #   github/spokes-api: http://127.0.0.1:12080/twirp/
        #   staging:           https://spokesd-staging.service.iad.github.net:10033/twirp/
        #   production:        https://spokesd-production.service.iad.github.net:10013/twirp/
        #   GHES/GHAE:         ENV["ENTERPRISE_SPOKESD_URL"]
        #
        # When you provide the URL as a String, the following options may be
        # set also:
        #
        #   - service_name (String) - the name of your app, will be used in the User-Agent request header.
        #
        #   - current_sha (String) - the current version of your app, will be used in the User-Agent request header.
        #
        #   - ssl (Hash, optional) - a hash with :ca_file, :client_cert, and :client_key paths.
        #
        #   - timeout (Number, default 15.0) - seconds allowed per request.
        #
        #   - (block) - if provided, will be called with the Faraday::Connection so you can set up additional middlewares
        def initialize(conn_or_url, **opts)
          case conn_or_url
          when :development
            @conn = build_connection("http://127.0.0.1:12080/twirp/", **opts) { |c| yield c if block_given? }
          when :production
            @conn = build_connection("https://spokesd-production.service.iad.github.net:10013/twirp/", **opts) { |c| yield c if block_given? }
          when :staging
            @conn = build_connection("https://spokesd-staging.service.iad.github.net:10033/twirp/", **opts) { |c| yield c if block_given? }
          when String
            @conn = build_connection(conn_or_url, **opts) { |c| yield c if block_given? }
          when Faraday::Connection
            if opts != {}
              raise ArgumentError, "opts are not allowed when a Faraday::Connection is passed"
            end
            if block_given?
              raise ArgumentError, "a block is not allowed when a Faraday::Connection is passed"
            end
            @conn = conn_or_url
          else
            raise ArgumentError, "expected a String or a Faraday::Connection, but got a #{conn_or_url.class.name}"
          end
        end

        def blobs
          @blobs ||= GitHub::Spokes::Proto::Blobs::V1::BlobsAPIClient.new(@conn)
        end

        def commits
          @commits ||= GitHub::Spokes::Proto::Commits::V1::CommitsAPIClient.new(@conn)
        end

        def diffs
          @diffs ||= GitHub::Spokes::Proto::Commits::V1::DiffsAPIClient.new(@conn)
        end

        def gitauth
          @gitauth ||= GitHub::Spokes::Proto::Gitauth::V1::GitauthAPIClient.new(@conn)
        end

        def legacygitrpc
          @legacygitrpc ||= GitHub::Spokes::Proto::LegacyGitrpc::V1::LegacyGitrpcAPIClient.new(@conn)
        end

        def merges
          @merges ||= GitHub::Spokes::Proto::Merges::V1::MergesAPIClient.new(@conn)
        end

        def objects
          @objects ||= GitHub::Spokes::Proto::Objects::V1::ObjectsAPIClient.new(@conn)
        end

        def references
          @references ||= GitHub::Spokes::Proto::References::V1::ReferencesAPIClient.new(@conn)
        end

        def repositories
          @repositories ||= GitHub::Spokes::Proto::Repositories::V1::RepositoriesAPIClient.new(@conn)
        end

        def trees
          @trees ||= GitHub::Spokes::Proto::Trees::V1::TreesAPIClient.new(@conn)
        end

        private

        def build_connection(url, service_name:, current_sha:, ssl: nil, timeout: 15.0)
          Faraday.new(url, ssl: ssl) do |conn|
            yield conn

            conn.headers[:user_agent]   = "#{service_name}/#{current_sha}"
            conn.options[:open_timeout] = 0.25
            conn.options[:timeout]      = timeout
          end
        end
      end
    end
  end
end
