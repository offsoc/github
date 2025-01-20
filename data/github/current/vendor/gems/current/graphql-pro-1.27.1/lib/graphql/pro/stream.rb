# frozen_string_literal: true
require "forwardable"

module GraphQL
  module Pro
    class Stream < Schema::Directive
      description "Directs the executor to deliver this list item-by-item, after the requested `initialCount`."

      locations(GraphQL::Schema::Directive::FIELD)

      argument :if, Boolean, required: false,
        default_value: true,
        description: "If false, this field _won't_ be streamed."

      argument :label, String, required: false,
        description: "A unique label to identify the stream payload."

      argument :initial_count, Integer, required: false, default_value: 0,
        description: "The number of items to return in the initial response."

      def self.resolve_each(object, arguments, context, &block)
        if arguments[:if]
          initial_count = arguments[:initial_count]
          path = context[:current_path]
          if path.last < initial_count
            yield
          else
            defer = context[:defer] ||= Pro::Defer::Deferred.new(context)
            defer.deferrals << Pro::Defer::Deferral.new(
              block: block,
              path: path,
              context: context,
              label: arguments[:label],
            )
          end
        else
          yield
        end
      end

      def self.use(schema)
        schema.directive(self)
      end
    end
  end
end
