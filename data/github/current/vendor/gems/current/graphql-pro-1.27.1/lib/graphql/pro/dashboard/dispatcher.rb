# frozen_string_literal: true
module GraphQL
  module Pro
    class Dashboard
      class Dispatcher
        def initialize(routes)
          @routing_table = {}
          routes.each do |method, paths|
            method_key = "#{method}//"
            paths.each do |path, route|
              if path.start_with?("/")
                raise ArgumentError, "Routes shouldn't start with `/` (#{method} #{path.inspect})"
              end
              add_route(method_key, path, to: route)
            end
          end
        end

        def dispatch(request)
          # This accounts for Rails mount point:
          route, params = get_route(request.request_method, request.path_info)
          request.params.merge!(params)
          request.env["graphql-pro.dispatcher.params"] = request.params
          if !route
            render_not_found(request: request)
          elsif !route.component.enabled?
            render_inactive_component(route.component, request: request)
          else
            render_view(route, request: request)
          end
        end

        private

        # Find the Route object that matches this reqest
        def get_route(request_method, relative_path)
          parts = relative_path.split("/")
          parts.shift # remove leading ""
          method_key = "#{request_method}//"
          parts.unshift(method_key)
          table = @routing_table
          params = {}
          parts.each do |part|
            next_tbl = table[part]
            if !next_tbl
              next_part = table.keys.find { |k| k.is_a?(String) && k.start_with?(":") }
              if next_part
                next_part_name = next_part[1..-1]
                params[next_part_name] = part
                next_tbl = table[next_part]
              end
            end
            table = next_tbl
            if !table
              break
            end
          end

          route = table && table[:route]
          return route, params
        end

        # Given a Route:
        # - call the corresponding method with the right args
        # - render the ERB template
        # - also, handle 404 and redirects here
        def render_view(route, request:, locals: {})
          component = route.component
          view_name = route.view

          view_locals = component.call_view(view_name, request: request)
          request.env["graphql-pro.dispatcher.locals"] = locals

          if view_locals.nil?
            render_not_found(request: request)
          elsif view_locals.key?(:redirect)
            redirect_path = view_locals.fetch(:redirect)
            # Sometimes this is `""`
            redirect_prefix = request.script_name.split("/", 2).last
            if redirect_prefix.nil?
              redirect_prefix = ""
            elsif redirect_prefix && !redirect_prefix.start_with?("/")
              redirect_prefix = "/#{redirect_prefix}"
            end
            params = view_locals.fetch(:params)
            uri_module = request.scheme == "https" ? URI::HTTPS : URI::HTTP
            uri = uri_module.build(
              host: request.host,
              port: request.port,
              path: redirect_prefix + redirect_path,
              query: params.any? ? URI.encode_www_form(params) : nil
            )
            [302, {"Location" => uri.to_s}, []]
          else
            # For the view, add:
            # - everything returned from the view
            # - "globals": request, component
            # - any overrides from the dispatcher call (eg `inactive_component`)
            tmpl_locals = view_locals
              .merge({request: request, component: component})
              .merge(locals)

            html = Dashboard::Template.render(route, locals: tmpl_locals)
            headers = {
              "Content-Type" => "text/html",
              "Content-Length" => html.bytesize.to_s,
            }
            [200, headers, [html]]
          end
        end

        def render_not_found(request:)
          # 404 is a magic route provided by Application
          route, _params = (get_route("GET", "/404") || raise("Failed to get 404 error page"))
          rack_response = render_view(route, request: request)
          rack_response[0] = 404
          rack_response
        end

        def render_inactive_component(component, request:)
          # magic route provided by Application
          route, _params = (get_route("GET", "/inactive_component") || raise("Failed to get inactive_component error page"))
          # override the component so that the inactive component is reflected in the view
          render_view(route, request: request, locals: {component: component})
        end

        # Build up the routing table
        def add_route(method, path, to:)
          parts = path.split("/")
          parts.unshift(method)
          table = @routing_table
          parts.each do |part|
            table = table[part] ||= {}
          end
          table[:route] = to
        end
      end
    end
  end
end
