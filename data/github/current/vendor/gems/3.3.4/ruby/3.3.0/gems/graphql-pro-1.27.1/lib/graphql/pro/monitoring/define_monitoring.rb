# frozen_string_literal: true
module GraphQL
  module Pro
    module Monitoring
      module DefineMonitoring
        def self.schema_monitoring(schema, *platforms_and_opts)
          warn "GraphQL::Pro::Monitoring is deprecated. See Tracing for a replacement: https://graphql-ruby.org/queries/tracing.html"

          options = if platforms_and_opts.last.is_a?(Hash)
            platforms_and_opts.pop
          else
            {}
          end
          platforms = platforms_and_opts
          instrumentation = Monitoring::Instrumentation.new(platforms, options)
          schema.instrumenters[:query] << instrumentation
          schema.instrumenters[:field] << instrumentation
        end

        def self.member_monitoring(member, setting)
          member.metadata[Monitoring::METADATA_KEY] = setting
        end
      end
    end
  end
end
