# frozen_string_literal: true
require "erb"

module GraphQL
  module Pro
    class Dashboard
      module Template
        TEMPLATE_HOME = File.expand_path("../templates", __FILE__)

        def self.render(route_or_template, locals:, layout: "layout")
          tmpl_path = if route_or_template.is_a?(String)
            File.join(TEMPLATE_HOME, "#{route_or_template}.erb")
          else
            component = route_or_template.component
            view_name = locals.fetch(:template, route_or_template.view.to_s)
            # The template must match the view name:
            File.join(component.template_path, "#{view_name}.erb")
          end

          tmpl_code = File.read(tmpl_path)
          ctx = Context.new(locals: locals)
          erb_instance = ERB.new(tmpl_code)
          erb_instance.location = [tmpl_path, 0]
          tmpl_content = erb_instance.result(ctx.to_binding)
          if layout == false
            tmpl_content
          else
            render(layout, locals: locals.merge({content: tmpl_content}), layout: false)
          end
        rescue Errno::ENOENT
          raise "Template not found: #{tmpl_path}"
        end
      end
    end
  end
end
