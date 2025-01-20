# frozen_string_literal: true
module GraphQL
  module Pro
    class Dashboard
      # Different features of the UI are added as components
      # The component has:
      # - view methods that prepare data
      # - templates that render data
      class Component
        def initialize(schema:)
          @schema = schema
        end

        attr_reader :schema

        # Based on self.class.routes Hash
        # { Method => { Path => Route} }
        def routes
          route_map = {}

          self.class.routes.map do |method, paths|
            method_routes = route_map[method] = {}
            paths.each do |path, view|
              method_routes[path] = Dashboard::Route.new(path: path, view: view, component: self)
            end
          end

          route_map
        end

        # Invoke the view method for `name`
        def call_view(name, request:)
          self.public_send(name, request: request)
        end

        # Directory where templates may be found
        def template_path
          self.class.template_path
        end

        # The first GET path is the home of this component
        def home_path
          self.class.routes["GET"].first.first || raise("No home_path for #{self.class.name}")
        end

        # The class name, without namespaces
        def name
          self.class.name.split("::").last
        end

        # Feature detection; returns true if configured
        def enabled?
          raise NotImplementedError, "#{self.class.name}#enabled? tells whether or not the component should be rendered"
        end

        class << self
          # Assign a Hash of { "METHOD" => { "path/to" => :method_name } }
          attr_reader :routes

          def configure_routes(routes_hash)
            @routes = routes_hash
            routes_hash.each do |http_method, path_map|
              # Create a path-building helper method for each route name
              path_map.each do |path, method_name|
                GraphQL::Pro::Dashboard::Context.class_eval <<-RUBY, __FILE__, __LINE__
                  def #{method_name}_path(**kwargs)
                    prefixed_path(interpolate_path_args("/#{path}", kwargs))
                  end
                RUBY
              end
            end
            nil
          end

          def template_path
            @template_path || raise("No configured `template_path_from(__FILE__)` for #{self}")
          end

          def template_path_from(component_file_path)
            component_root = File.dirname(component_file_path)
            component_name = File.basename(component_file_path).sub(".rb", "")
            @template_path = File.join(component_root, "templates", component_name)
          end
        end

        def per_page_param(params)
          params.fetch("per_page", 25).to_i
        end

        def page_param(params)
          params.fetch("page", 1).to_i
        end

        def redirect_to(path, params: {})
          if !path.start_with?("/")
            path = "/#{path}"
          end
          {
            redirect: path,
            params: params,
          }
        end
      end
    end
  end
end
