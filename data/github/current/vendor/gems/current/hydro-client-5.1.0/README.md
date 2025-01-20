# hydro-client

hydro-client is an API wrapper to send messages to Hydro, the data pipeline.

For installation and usage instructions, see [the hydro docs](https://thehub.github.com/epd/engineering/products-and-services/internal/hydro/installation/ruby/).

## Using the client with Rails
If using the Hydro client in a Rails app, make sure to wrap the application code on a [Rails executor](https://guides.rubyonrails.org/threading_and_code_execution.html#wrapping-application-code):
```
Rails.application.executor.wrap do
 process_hydro_message(message)
end
```
Failure to do this can lead to availability incidents on your Rails app. Context [here](https://github.com/github/data-pipelines/issues/2167#issuecomment-1804896314).

## Telemetry

The Hydro Ruby client emits some telemetry events you can consume in order to emit logs, metrics, and report errors to Sentry. Here is a list of events you can subscribe to:

* `hydro.kafka_sink.close.message_flush_retry` is emitted with a payload of `{exception: e, retries: <retry num>}`
* `hydro.kafka_sink.close.message_flush_failure` is emitted with a payload of `{exception: e}`
* `"hydro.kafka_source.batch_processed"` is emitted with a payload containing the keys `:client_id`, `:group_id`, `:max_bytes_per_partition`, `:subscribe_options` and `:start_from_beginning: subscribe_options`
* `"hydro.kafka_source.message_processed"` is emitted with a payload containing the keys `:client_id`, `:group_id`, `:max_bytes_per_partition`, `:subscribe_options` and `:start_from_beginning: subscribe_options`
* `"hydro.kafka_source.consumer_initialized"` is emitted with a payload container the keys `:client_id`, `:group_id`, and `:consumer_options`.
* `"hydro.kafka_source.consumer_subscribed"` is emitted with a payload containing the keys `:topic`, `:client_id`, `:group_id`, `:max_bytes_per_partition`, `:subscribe_options` and `:start_from_beginning: subscribe_options`

### Hydro Client Logging

To configure logging from Hydro Ruby client gem code and Kafka producer and consumer clients, set the `Hydro.logger` like this:

```ruby
Hydro.logger = GitHub::Telemetry::Logs.lib_logger("Hydro")
```

The `Hydro.logger` defaults to a null Ruby standard logger if not set.

You can use any logger for the `Hydro.logger`, but the recommendation is to use an OpenTelemetry-compliant [`GitHub::Telemetry::Logs` lib logger](https://github.com/github/github-telemetry-ruby). The default log level of such a logger is `fatal`. The level of _all_ lib loggers is controlled by the `GITHUB_TELEMETRY_LOGS_LIB_LEVEL` environment variable. So, you could set that env var to a high log level, but that will impact all lib loggers your application may use, and it will impact the Rails logger if you're using the `rails_semantic_logger` gem. To initialize a single lib logger with a higher level, do this:

```ruby
Hydro.logger = GitHub::Telemetry::Logs.lib_logger("Hydro", level: :info)
```

More info on this configuration of `GitHub::Telemetry::Logs` [here](https://thehub.github.com/epd/engineering/dev-practicals/observability/logging/github-telemetry-ruby-user-guide/#third-party-logs).

If you configure a `Hydro.logger`, then that logger will be used in two places:

* It will emit a log statement every time one of the telemetry events listed above occurs.
* It will pass that logger to Kafka Ruby gem producer and consumer client initialization, and the Kafka gem will emit logs using that logger.

If you want the free log statements emitted for every telemetry event, you must start the `Hydro::LogStreamer` subscriber like this:

```ruby
Hydro::LogStreamer.start
```

### Configuring a Custom Consumer and Publisher Logger

If you don't want to use the `Hydro.logger` for both consumer and producer, you can set a custom logger for either or both, like this:

```ruby
Hydro.consumer_logger = GitHub::Telemetry::Logs.lib_logger("Hydro", level: :info)
Hydro.publisher_logger = GitHub::Telemetry::Logs.lib_logger("Hydro", level: :debug)
```

Do this if you need to control the log level of the consumer or publisher logs independently. If you do not set `#consumer_logger` or `#publisher_logger`, the gem will default to using `Hydro.logger`.

## Upgrading to 5.x

Version 5.0 removes the explicit `before_open` and `after_close` callbacks on processors in favor of a more flexible callback implementation (backed by `ActiveSupport::Callbacks`) that allows before, after, and around callbacks to be defined on `open` and `close`.

If your processor implements either of these messages you'll need to add `set_callback :open, :before, :before_open` and/or `set_callback :close, :after, :after_close` in your processor.

## Upgrading from 2.x to 3.x

Version 3.0 introduced the following breaking changes:

* The Hydro gem does not emit log statements unless you:
  * Set `Hydro.logger = some_valid_logger`
  * Start the logger subscriber with `Hydro::LogStreamer.start`
* The `KafkaSink` and `KafkaSource` initialization on longer accept a `:logger` option. The only way to configure the logger is through `Hydro.logger=`.

### Configure the Hydro Logger

Version 3.0 changed the `KafkaSink` and `KafkaSource` initialization so that they no longer accept a logger. To configure a logger for the Kafka producer and consumer clients, set the `Hydro.logger`, like this:

```ruby
Hydro.logger = GitHub::Telemetry::Logs.lib_logger("Hydro")
```

You can use any logger for the `Hydro.logger`, but the recommendation is to use an OpenTelemetry-compliant `GitHub::Telemetry::Logs` lib logger. The default log level of such a logger is `fatal`. To initialize a lib logger with a higher level, do this:

```ruby
Hydro.logger = GitHub::Telemetry::Logs.lib_logger("Hydro", level: :info)
```

### Start the Log Subscriber

To have the Hydro Ruby client emit log statements for the telemetry events listed above, you must start the log streamer like this:

```ruby
Hydro::LogStreamer.start
```

Log statements that used to be emitted by Hydro Ruby client code are no longer emitted as such. Instead, the configured `Hydro.logger` will log information about the listed telemetry events.

### Do Not Initialize `KafkaSink` and `KafkaSource` with `:logger`

Lastly, wherever you were manually initializing a `KafkaSource` or `KafkaSink` instance with an explicit `:logger` option, you must remove that option. The only way to configure the logger is through `Hydro.logger=`.

## Upgrading from 1.x to 2.x

Version 2.0 changed the Hydro processor default to use individual message mode (non-batch) to promote more consumer stability and reliability. The `batching?` method now returns false; processors that rely on batched mechanics must override the `batching?` method to return true.

## Upgrading from 0.x to 1.x

Version 1.0 changed the default topic naming convention. Prior to 1.x the default behavior prefixed topic names with the site and namespace (almost always `cp1-iad.ingest.`) but moving to 1.x we no longer add the prefix by default. For publishing to topics that have the prefix in their names you'll need to explicitly set the topic format version. This can be done at the publisher level, or on individual publish calls.

If the topic uses the V2 format (that is, it does not have the `cp1-iad.ingest.` prefix) - currently the default for new topics:

```ruby
publisher.publish(payload, schema: "octochat.v0.Login")
```

If the topic uses the deprecated V1 format (that is, it has the `cp1-iad.ingest.` prefix)

```ruby
publisher.publish(payload, schema: "octochat.v0.Login",
  topic_format_options: { format_version: Hydro::Topic::FormatVersion::V1 })
```

To automate this process you can include this rubocop and run it with the auto-correct option:

```ruby
require "rubocop"

module RuboCop
  module Cop
    class HydroTopicFormats < Base
      extend AutoCorrector

      MSG = "No topic format specified"

      def on_send(node)
        return unless hydro_publish_call?(node)

        topic_format_options_argument = node.last_argument.child_nodes.find do |argument|
          argument.key.value == :topic_format_options
        end

        if topic_format_options_argument.nil?
          add_offense(node) do |corrector|
            corrector.insert_after(node.last_argument.source_range, ", topic_format_options: { format_version: Hydro::Topic::FormatVersion::V1 }")
          end
        elsif !topic_format_options_argument.value.keys.map(&:value).include?(:format_version)
          add_offense(topic_format_options_argument) do |corrector|
            corrector.insert_after(topic_format_options_argument.value.child_nodes.last.source_range, ", format_version: Hydro::Topic::FormatVersion::V1")
          end
        end
      end

      private

      # We only care to check methods called `publish` that have an options
      # hash (or really, kwargs) that includes a `schema` option since that's
      # what's required by the hydro client gem's API. This level of
      # specificity helps us reduce false positives.
      def hydro_publish_call?(node)
        node.method_name == :publish &&
          node.last_argument&.hash_type? &&
          node.last_argument.child_nodes.any? { |argument| argument.key.value == :schema }
      end
    end
  end
end
```

## Development

1. Run `script/bootstrap` to install required dependencies.
2. Run `script/test` to make sure everything's working.
