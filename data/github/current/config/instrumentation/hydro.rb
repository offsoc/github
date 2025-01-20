# typed: true
# frozen_string_literal: true

# This file forwards events instrumented within the application to hydro.
# Typically, forwarding involves subscribing to an event, mapping the event
# payload to a hydro schema, and publishing to hydro.
#
# For example, to publish repository rename events to hydro, first add
# application instrumentation for renames.
#
#
#     def rename
#       # Rename logic...
#       GlobalInstrumenter.instrument("repository.rename", {
#         renamed_by: current_user,
#         repository: current_repository,
#         old_name: current_repository.name_was,
#         new_new: current_repository.name,
#       })
#
#
# Then create an event forwarding subscription and map the event payload to a
# hydro payload.
#
#
#     Hydro::EventForwarder.configure(source: GlobalInstrumenter) do
#       # Other subscriptions
#
#       subscribe("repository.rename") do |payload, event|
#         message = {
#           renamed_by: {
#             id: payload[:renamed_by].id,
#             loging: payload[:renamed_by].login,
#           },
#           repository_id: payload[:repository].id,
#           old_name: payload[:old_name],
#           new_name: payload[:new_name],
#         }
#
#         publish(message, schema: "github.v0.RepoRename")
#       end
#     end
#
#
# N.B. The above assumes that you have created a `github.v0.RepoRename` schema
# in https://github.com/github/hydro-schemas.

# Load entity serializers
Dir[Rails.root.join("config", "instrumentation", "hydro", "entity_serializer", "**", "*.rb")].each do |file|
  require file
end

require_relative "hydro/entity_serializer"

# To avoid repetition, common entities like users have associated
# `EntitySerializer` helper methods to fill in hydro payload fields. In this
# example, we can replace `renamed_by` fields with `serializer#user`.
#
#
#     Hydro::EventForwarder.configure(source: GlobalInstrumenter) do
#       # Other subscriptions
#
#       subscribe("repository.rename") do |payload, event|
#         message = {
#           renamed_by: serializer.user(payload[:renamed_by]),
#           repository_id: payload[:repository].id,
#           old_name: payload[:old_name],
#           new_name: payload[:new_name],
#         }
#
#         publish(message, schema: "github.v0.RepoRename")
#       end
#     end

module Hydro
  autoload :PublishRetrier, "hydro/publish_retrier"

  class EventForwarder
    extend T::Sig

    sig do
      params(
        source: T.untyped,
        block: T.proc.bind(::Hydro::EventForwarder).params(arg0: T.untyped).void
      ).void
    end
    def self.configure(source:, &block)
      instance = new(source)
      instance.instance_exec(&block)
    end

    def initialize(instrumenter)
      @instrumenter = instrumenter
      @role_tag = "role:#{GitHub.role}"
    end

    def publish(payload, options = {})
      publisher = options.delete(:publisher) || GitHub.hydro_publisher
      result = publisher.publish(payload, **options)

      if !result.success? && result.error.is_a?(Hydro::Sink::MessagesTooLarge)
        if GitHub.compress_oversized_hydro_messages?
          tags = ["schema:#{options[:schema]}"]
          GitHub.dogstats.increment("hydro_client.retry_with_compression", tags: tags)
          result = publisher.publish(payload, **options.merge(compress: true))
        end
      end

      if !result.success?
        report_error(result.error, **options.slice(:schema))
      end

      result
    end

    def publish_without_error_reporting(message, **options)
      GitHub.hydro_publisher.publish(message, **options)
    end

    def report_error(error, schema:)
      GitHub.dogstats.increment("hydro_client.publish_error", tags: [
        "schema:#{schema}",
        "error:#{error.class.name.underscore}",
      ])

      GitHub.report_hydro_error(error, { schema: schema })
    end

    def subscribe(pattern, &block)
      @instrumenter.subscribe(pattern) do |event, _, _, _, payload|
        if GitHub.hydro_enabled?
          GitHub.dogstats.distribution_time("hydro_client.subscriber_time", {
            tags: ["event:#{event}", @role_tag],
          }) do
            begin
              yield payload, event
            rescue => e # rubocop:todo Lint/GenericRescue
              if Rails.env.production?
                GitHub.report_hydro_error(e)
              else
                puts "Failed to encode hydro message: #{e.message}"
                raise(e)
              end
            end
          end
        end
      end
    end

    def serializer
      Hydro::EntitySerializer
    end

    def browser_request_context_overrides(payload)
      request_url = payload[:originating_url]
      controller, action = GitHub::BrowserStatsHelper.guess_url_controller_action(request_url)
      {
        client_id: payload[:client_id],
        referrer: payload[:referrer],
        request_url: request_url,
        controller: controller,
        controller_action: action,
      }
    end
  end
end
