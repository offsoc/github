# GitHub::Telemetry

Centralized, default configurations for OpenTelemetry w/ Ruby at GitHub

<details>
<summary>
Table of Contents
</summary>
<!-- Re-generate TOC with `markdown-toc --no-first-h1 -i` -->

<!-- toc -->

- [Install Guide](INSTALL.md)
- [Usage](#usage)
  - [In Development](#in-development)
  - [In Production](https://thehub.github.com/epd/engineering/dev-practicals/observability/distributed-tracing/instrumentation/#production-environments)
  - [Traces](https://thehub.github.com/epd/engineering/dev-practicals/observability/distributed-tracing/github-telemetry-ruby-user-guide/)
  - [Logs](https://thehub.github.com/epd/engineering/dev-practicals/observability/logging/github-telemetry-ruby-user-guide/)
  - [Metrics](#metrics)
- [Further reading](#further-reading)
  - [Monitoring Internal Performance](#monitoring-internal-performance)
    - [Statsd Client](#statsd-client)
  - [Customizing the SDK](#customizing-the-sdk)
  - [YardDoc](#yarddoc)
- [Architecture Decision Records](ADR.md)
- [Contributing](CONTRIBUTING.md)

<!-- tocstop -->
</details>

## Usage

Our documentation is now on The Hub!

- [Traces](https://thehub.github.com/epd/engineering/dev-practicals/observability/distributed-tracing/github-telemetry-ruby-user-guide/)
- [Logs](https://thehub.github.com/epd/engineering/dev-practicals/observability/logging/github-telemetry-ruby-user-guide/)

### Metrics

The [OpenTelemetry Metrics API and SDK specifications][otel-metrics-spec] are still under development are are therefore not included in this package. At this time, we encourage you to use the [`statsd-instrument`][statsd-instrument] gem `v3` or newer to generate custom metrics.

## Further reading

### Monitoring Internal SDK Performance

It is highly recommended that you add client side metrics to monitor the internal performance of the OTel SDK.

This package includes implemenations of OTel Ruby [`MetricsExporters`][otel-metrics-reporter] that support [`datadog-statsd`][datadog-statsd] and [`statsd-instrument`][statsd-instrument] gems.

The metrics in the table below are generated from the OTel SDK are tracked in Datadog on the [Distributed Tracing Clients Dashboard][datadog-clients-dashboard].

| Component | Name | Type | Description |
| --- | --- | --- | --- |
| `BatchSpanProcessor` | `otel.bsp.buffer_utilization` | `GAUGE` | `spans.size / max_queue_size` |
| `BatchSpanProcessor` | `otel.bsp.error` | `COUNT` | Error count that occur restarting threads |
| `BatchSpanProcessor` | `otel.bsp.export.success` | `COUNT` | Number of successfully exported batches |
| `BatchSpanProcessor` | `otel.bsp.exported_spans` | `COUNT` | Number of spans exported in a batch |
| `BatchSpanProcessor` | `otel.bsp.export.failure` | `COUNT` | Number of failed exported batches |
| `BatchSpanProcessor` | `otel.bsp.dropped_spans` | `COUNT` | Number of spans dropped due to failures or buffer overflow |
| `OTLP::Exporter` | `otel.otlp_exporter.request_duration` | `DISTRIBUTION` | Request latency to OTLP Traces Collector Endpoint |
| `OTLP::Exporter` | `otel.otlp_exporter.failure` | `COUNT` | Number of errors that occur when trying to export traces |

#### Statsd Client

Initialize `statsd` object instance and provide it to the railtie configuration:

```ruby

module MyRailsApp
  class Application < Rails::Application
    # ...
    config.telemetry.statsd = $statsd
  end
end

```

### Correlating requests with legacy telemetry

This gem provides helper classes that propagates the legacy [GitHub Request Id](glb-request-id) used to correlate requests in Splunk. We strongly encourage you to replace any custom Request-Id propagation code with the following, if using Rack and/or Faraday:

For Rails applications, this gem will automatically insert the [Rack](lib/github/telemetry/rack/request_id.rb) middleware at the top of the stack, as well as configure Action Dispatch to use the GitHub Request Id when calling `request.request_id` or when using the request_id in log tags (`config.log_tags = [ :request_id ]`)

If you need some finer grained control, you can turn off the automatic behavior by adding the following to your application.rb

```ruby

module MyRailsApp
  class Application < Rails::Application
    # ...
    config.telemetry.enable_rack_github_request_id = false
  end
end

```

You can then manually insert the [Rack](lib/github/telemetry/rack/request_id.rb) middleware in the stack:

```ruby
module MyRailsApp
  class Application < Rails::Application
    # ...
    config.telemetry.enable_rack_github_request_id = false
    config.middleware.use(GitHub::Telemetry::Rack::RequestId)

  end
end
```

Next, include the provided [Faraday Middleware](lib/github/telemetry/faraday_middleware/request_id.rb) to generate HTTP Requests:

```ruby

  Faraday.new do |f|
    f.use GitHub::Telemetry::FaradayMiddleware::RequestId, hostname: Socket.gethostname # It is preferred that you use a memoized value for this parameter.
  end

```

### YardDoc

We have complete YARD documentation available for this gem. After installing gem dependencies, you can run `yard server` to get an in-browser presentation of the documentation (or, use whichever means you typically prefer to read YARD documentation).

<!-- Links -->
[datadog-statsd]: https://github.com/DataDog/dogstatsd-ruby/
[otel-metrics-spec]: https://github.com/open-telemetry/opentelemetry-specification/blob/main/specification/metrics/README.md
[otel-metrics-reporter]: https://github.com/open-telemetry/opentelemetry-ruby/blob/main/sdk/lib/opentelemetry/sdk/trace/export/metrics_reporter.rb
[statsd-instrument]: http://shopify.github.io/statsd-instrument/
[datadog-clients-dashboard]: (https://app.datadoghq.com/dashboard/bqf-5i8-2xt/distributed-tracing-clients)
