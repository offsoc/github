# frozen_string_literal: true
module GraphQL
  module Pro
    module Monitoring
      # TODO:
      # - Skip scalars by default, support monitor_scalars: true
      # - Allow opting in to custom scalars
      # - Allow skipping types & fields
      class Instrumentation
        PLATFORMS = {
          appsignal: AppsignalPlatform,
          datadog: DatadogPlatform,
          new_relic: NewRelicPlatform,
          scout: ScoutPlatform,
          skylight: SkylightPlatform,
          statsd: StatsdPlatform,
        }

        def initialize(platforms, **options)
          @options = options
          @platforms = platforms.map { |pl| PLATFORMS[pl] || raise("No platform for: #{pl}") }
          if defined?(ActiveRecord)
            @platforms.unshift(EagerLoadRelation)
          end
        end

        def instrument(type, field)
          if instrument_field?(field, @options)
            @platforms.reduce(field) { |f, pl| instrument_with_platform(type, f, pl) }
          else
            field
          end
        end

        def before_query(query)
          @platforms.each { |pl| pl.before_query(query, **@options) }
        end

        def after_query(query)
          @platforms.each { |pl| pl.after_query(query, **@options) }
        end

        private

        def instrument_with_platform(type, field, platform)
          field.name
          prev_resolve = field.resolve_proc
          new_resolve = platform::Resolve.new(type, field, prev_resolve, lazy: false, **@options)
          prev_lazy_resolve = field.lazy_resolve_proc
          new_lazy_resolve = platform::Resolve.new(type, field, prev_lazy_resolve, lazy: true, **@options)
          field.redefine(resolve: new_resolve, lazy_resolve: new_lazy_resolve)
        end

        def instrument_field?(field, options)
          explicit_field_setting = field.metadata[METADATA_KEY]
          if explicit_field_setting == false
            false
          elsif explicit_field_setting == true
            true
          else
            type = field.type.unwrap
            explicit_setting = type.metadata[METADATA_KEY]
            if explicit_setting == false
              false
            elsif explicit_setting == true
              true
            elsif type.is_a?(GraphQL::ScalarType) && options[:monitor_scalars] == false
              false
            else
              true
            end
          end
        end
      end
    end
  end
end
