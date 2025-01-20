# frozen_string_literal: true

module Authnd
  module Client
    module FaradayMiddleware
      # Faraday middleware that inserts tenant id and shortcode headers into requests.
      class TenantContext < ::Faraday::Middleware
        TENANT_ID_HEADER = "X-GitHub-Tenant-ID"
        TENANT_SHORTCODE_HEADER = "X-GitHub-Tenant-Shortcode"
        TENANT_SLUG_HEADER = "X-GitHub-Tenant"

        # Public: Initialize the middleware with tenant headers
        #
        # app              - The faraday application/middlewares stack.
        # tenant_id        - Integer tenant id.
        # tenant_shortcode - String tenant shortcode.
        # tenant_slug      - String tenant slug.
        def initialize(app, options = {})
          super(app)
          @tenant_id = options[:tenant_id]
          @tenant_shortcode = options[:tenant_shortcode]
          @tenant_slug = options[:tenant_slug]
        end

        def call(env)
          env.request_headers[TENANT_ID_HEADER] = @tenant_id.to_s
          env.request_headers[TENANT_SHORTCODE_HEADER] = @tenant_shortcode
          env.request_headers[TENANT_SLUG_HEADER] = @tenant_slug
          @app.call(env)
        end
      end
    end
  end
end
