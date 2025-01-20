# frozen_string_literal: true
require "erb"

module GraphQL
  module Pro
    class Dashboard
      class Context
        def initialize(locals:)
          @local_values = locals
          @local_ostruct = OpenStruct.new(locals)
        end

        # When mounted in a Rails app,
        # this will include the mount prefix
        def prefixed_path(path)
          request.script_name + path
        end

        def static_path(file_name)
          prefixed_path("/static/" + file_name)
        end

        def to_binding
          instance_eval { binding }
        end

        def method_missing(method_name, *args)
          if @local_ostruct.respond_to?(method_name)
            @local_ostruct.public_send(method_name, *args)
          else
            super
          end
        end

        def respond_to_missing?(method_name, include_private = false)
          @local_ostruct.respond_to?(method_name, include_private) || super
        end

        def link_to(text, path, opts = {})
          cls = opts[:class]
          if opts[:params]
            query_s = to_query_string(opts[:params])
            if query_s != ""
              path = path + "?" + query_s
            end
          end
          "<a href=\"#{path}\" #{cls ? "class='#{cls}'" : ""}>#{text}</a>"
        end

        def render_partial(name)
          Template.render(name, locals: @local_values, layout: false)
        end

        def to_query_string(params)
          params
            .map { |k, v| (v.nil? || v == "") ? nil : "#{k}=#{v}" }
            .compact
            .join("&")
        end

        def pluralize(word, count)
          if word.end_with?("y")
            "#{count} #{word[0..-2]}#{count == 1 ? "y" : "ies"}"
          else
            "#{count} #{word}#{count == 1 ? "" : "s"}"
          end
        end

        def localize_date(datetimeish)
          datetime = case datetimeish
          when DateTime, Time
            datetimeish
          when String
            DateTime.parse(datetimeish)
          when nil
            nil
          else
            raise ArgumentError, "Unexpected datetimeish: #{datetimeish.inspect}"
          end
          if datetime.nil?
            "—"
          else
            datetime_s = datetime.strftime("%FT%T%:z")
            %|<time datetime="#{datetime_s}" class="localize-date">#{datetime_s}</time>|
          end
        end

        private

        def interpolate_path_args(path, kwargs)
          kwargs.each do |arg_name, value|
            path = path.sub(":#{arg_name}", value.to_s)
          end
          path
        end
      end
    end
  end
end
