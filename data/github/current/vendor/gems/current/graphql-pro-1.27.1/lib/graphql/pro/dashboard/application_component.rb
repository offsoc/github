# frozen_string_literal: true
module GraphQL
  module Pro
    class Dashboard
      # Base views for the ui
      class ApplicationComponent < Component
        def enabled?; true; end

        template_path_from(__FILE__)

        configure_routes({
          "GET" => {
            "" => :home,
            "404" => :not_found,
            "no_components" => :no_components,
            "inactive_component" => :inactive_component,
          }
        })

        def home(request:)
          components = request.env["graphql-pro.dashboard"].components
          first_active_component = components.find { |c| c != self && c.enabled?}
          first_path = if first_active_component
            first_active_component.home_path
          else
            "/no_components"
          end
          redirect_to(first_path)
        end

        def no_components(request:)
          {
            title: "No Active Components",
            components: request.env["graphql-pro.dashboard"].components,
            tab: "",
          }
        end

        def not_found(request:)
          {
            title: "404",
            tab: "",
          }
        end

        def inactive_component(request:)
          {
            title: "Inactive Component",
            tab: "",
          }
        end
      end
    end
  end
end
