# frozen_string_literal: true
require "graphql/pro/dashboard/context"
require "graphql/pro/dashboard/dispatcher"
require "graphql/pro/dashboard/route"
require "graphql/pro/dashboard/template"
# Components, one per UI feature:
require "graphql/pro/dashboard/component"
require "graphql/pro/dashboard/application_component"
require "graphql/pro/dashboard/limiter_component"
require "graphql/pro/dashboard/operation_store_component"
require "graphql/pro/dashboard/subscriptions_component"

module GraphQL
  module Pro
    # An in-browser UI for a GraphQL system
    # @example Mounting in a Rails app
    #   mount GraphQL::Pro::Dashboard.new(schema: MyAppSchema), at: "/graphql/dashboard"
    class Dashboard
      class << self
        def register_component(component_class)
          @component_classes ||= []
          @component_classes << component_class
          nil
        end

        attr_reader :component_classes
      end

      register_component(GraphQL::Pro::Dashboard::ApplicationComponent)
      register_component(GraphQL::Pro::Dashboard::OperationStoreComponent)
      register_component(GraphQL::Pro::Dashboard::SubscriptionsComponent)
      register_component(GraphQL::Pro::Dashboard::LimiterComponent)

      def initialize(schema: nil, schema_class_name: nil)
        @components = nil
        if schema.nil? && schema_class_name.nil?
          raise ArgumentError, "either `schema:` or `schema_class_name:` is required."
        elsif schema
          @schema = schema
          @schema_class_name = nil
          load_components
        else
          @schema = nil
          @schema_class_name = schema_class_name
        end
      end

      def call(env)
        load_components
        request = Rack::Request.new(env)
        request.env["graphql-pro.dashboard"] = self

        if request.path_info =~ /static/
          @asset_server.call(env)
        else
          @dispatcher.dispatch(request)
        end
      end

      attr_reader :components

      # Better rendering in Rails Routes output
      def inspect
        "#<GraphQL::Pro::Dashboard[#{@schema || @schema_class_name.inspect}]>"
      end

      private

      def load_components
        return if @components
        if @schema.nil?
          @schema = Object.const_get(@schema_class_name)
        end

        @components = self.class.component_classes.map { |c| c.new(schema: @schema) }

        routes = {
          "GET" => {},
          "POST" => {},
        }

        components.each do |comp|
          merge_routes!(routes, comp)
        end

        @dispatcher = Dispatcher.new(routes)

        @asset_server = Rack::Static.new(self, {
          urls: ["/static"],
          root: File.expand_path("../dashboard/", __FILE__),
          header_rules: [
            [:all, {"Cache-Control" => 'public, max-age=31536000'}]
          ]
        })
      end

      # Merge component's routes into prev_routes,
      # modifying the prev_routes hash.
      def merge_routes!(prev_routes, component)
        next_routes = component.routes
        prev_routes.each do |method, paths|
          next_method_routes = next_routes[method] || {}
          next_method_routes.each do |path, route|
            if paths.key?(path)
              raise "Conflict for route on #{path} (prev: #{paths[path]}, new: #{route.view})"
            else
              paths[path] = route
            end
          end
        end
      end
    end
  end
end
