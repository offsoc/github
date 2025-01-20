# typed: strict
# frozen_string_literal: true

if GitHub.billing_enabled?
  class ZuoraClientSubscriber
    extend T::Sig

    sig { returns(String) }
    attr_reader :client
    sig { returns(OpenTelemetry::SDK::Trace::Tracer) }
    attr_reader :tracer

    sig { params(client: String).void }
    def initialize(client: "default")
      @client = client
      @tracer = T.let(GitHub::Telemetry.tracer("ZuoraClientSubscriber-#{client}}"), OpenTelemetry::SDK::Trace::Tracer)
    end

    # Env gives us access to
    # Request
    # :method - :get, :post, ...
    # :url    - URI for the current request; also contains GET parameters
    # :body   - POST parameters for :post/:put requests
    # :request_headers
    #
    # Response
    # :status - HTTP response status code, such as 200
    # :body   - the response body
    # :response_headers
    sig { params(name: String, start: Time, ends: Time, transaction_id: String, env: Faraday::Env).void }
    def call(name, start, ends, transaction_id, env)
      tracer.in_span("call") do |span|
        http_method = env.method.to_s.upcase
        duration = ends - start
        status = env.status
        url = env.url
        path = url.path.to_s

        tags = [
          "http_method:#{http_method}",
          "status:#{status}",
          "path:#{normalize_path(http_method, path)}",
          "faraday_client:#{client}"
        ]

        if path.include?("/v1/action/query")
          object = env[:request_body]&.match(/from (.*?) /i)&.captures&.first
          tags << "object:#{object}" if object
        end

        if status.blank?
          span.add_event(
            "zuora-empty-response",
            attributes: {
              GitHub::Telemetry::Logs::SEVERITY_LEVEL => GitHub::Telemetry::Logs::Severity::INFO,
              "code.namespace" => "ZuoraClientSubscribler",
              "code.function" => "instrumentation.subscribe",
              "gh.billing.zuora_client.env" => env.inspect,
              "gh.billing.zuora_client.transaction_id" => transaction_id,
              "gh.billing.zuora_client.type" => client
            }
          )
        end

        GitHub.dogstats.timing("billing.zuora_client.request", duration.in_milliseconds, tags: tags)
        GitHub.dogstats.distribution("billing.zuora_client.response.dist.time", duration.in_milliseconds, tags: tags)
      end
    end

    private

    sig { params(method: String, path: String).returns(String) }
    def normalize_path(method, path)
      case method
      when "GET", "DELETE"
        case path
        when %r{/v1/invoices/[\w-]+/items}
          path.gsub(/(\/v1\/invoices)\/[\w-]+\/items/, "\\1/:id/items")
        else
          # Both GET and DELETE require an ending ID so we match everything up to the ID and replace the ID with
          # :id
          path.gsub(/(\/v1(:?[\/[\w-]+]+))\/[\w-]+/, "\\1/:id")
        end
      when "POST"
        # POST we are currently only using one path that requires obsufication through POST
        case path
        when %r{/v1/invoices/[\w-]+/emails}
          path.gsub(/(\/v1\/invoices)\/[\w-]+\/emails/, "\\1/:id/emails")
        when %r{/v1/payment-methods/[\w-]+/authorize}
          path.gsub(/(\/v1\/payment-methods)\/[\w-]+\/authorize/, "\\1/:id/authorize")
        when %r{/v1/payment-methods/[\w-]+/voidauthorize}
          path.gsub(/(\/v1\/payment-methods)\/[\w-]+\/voidauthorize/, "\\1/:id/voidauthorize")
        when %r{/v1/accounts/[\w-]+/billing-documents/generate}
          path.gsub(/(\/v1\/accounts)\/[\w-]+\/billing-documents\/generate/, "\\1/:id/billing-documents/generate")
        else
          path
        end
      when "PUT"
        # We only use PUT requests in a handful of places and they mostly follow the convention of
        # - /v1/object/foo/:id
        # - /v1/foo/:id
        # - /v1/subscription/:id/suspend or cancel or resume
        path.gsub(/(\/v1(?:\/object)?\/[\w-]+)(?:\/[\w-]+)?(\/(?:cancel|suspend|resume))?/, "\\1/:id\\2")
      else
        # If we see these, we should investigate other HTTP methods and which are supported by zuora
        "unknown"
      end
    end
  end

  GlobalInstrumenter.subscribe("billing.zuora_client.request", ZuoraClientSubscriber.new)
  GlobalInstrumenter.subscribe("billing.zuora_client.retry_client.request", ZuoraClientSubscriber.new(client: "retry_client"))
end
