# frozen_string_literal: true

module GraphQL
  module Pro
    class Dashboard
      class LimiterComponent < GraphQL::Pro::Dashboard::Component
        template_path_from(__FILE__)

        def enabled?
          defined?(GraphQL::Enterprise::Limiter) &&
            (
              !!@schema.enterprise_active_operation_limiter ||
              !!@schema.enterprise_runtime_limiter ||
              !!(@schema.respond_to?(:enterprise_mutation_limiter) && @schema.enterprise_mutation_limiter)
            )
        end

        def doc_url
          "http://graphql-ruby.org/limiters/overview"
        end

        configure_routes({
          "GET" => {
            "limiter/:limiter_name" => :limiter_show,
          },
          "POST" => {
            "limiter/:limiter_name/soft" => :limiter_toggle_soft,
          },
        })

        def home_path
          limiter_name = (enabled? && @schema.enterprise_active_operation_limiter) ? "active_operations" : "runtime"
          super.sub(":limiter_name", limiter_name)
        end

        def limiter_toggle_soft(request:)
          name = request.params["limiter_name"]
          limiter = limiter_for(name)
          if limiter.nil?
            nil
          else
            limiter.toggle_soft_limit
            redirect_to("/limiter/#{name}", params: { chart: request.params["chart"]})
          end
        end

        def limiter_show(request:)
          name = request.params["limiter_name"]
          title = case name
          when "runtime"
            "Runtime Limiter"
          when "active_operations"
            "Active Operation Limiter"
          when "mutations"
            "Mutation Limiter"
          else
            raise ArgumentError, "Unknown limiter name: #{name}"
          end

          limiter = limiter_for(name)
          if limiter.nil?
            {
              title: title,
              install_path: "http://graphql-ruby.org/limiters/#{name}",
              enabled: false,
              tab: name,
            }
          else
            chart_mode = case request.params["chart"]
            when "hour", "day", "month"
              request.params["chart"]
            else
              "day"
            end
            {
              enabled: true,
              title: title,
              current_soft: limiter.soft_limit_enabled?,
              chart_mode: chart_mode,
              histogram: limiter.dashboard_histogram(chart_mode),
              tab: name,
            }
          end
        end

        private

        def limiter_for(name)
          case name
          when "runtime"
            @schema.enterprise_runtime_limiter
          when "active_operations"
            @schema.enterprise_active_operation_limiter
          when "mutations"
            @schema.enterprise_mutation_limiter
          else
            raise "Unknown limiter: #{name}"
          end
        end
      end
    end
  end
end
