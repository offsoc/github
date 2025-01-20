# frozen_string_literal: true
module GraphQL
  module Pro
    class Dashboard
      class Route
        attr_reader :view, :component, :path
        def initialize(path:, view:, component:)
          @path = path
          @view = view
          @component = component
        end

        def ==(other)
          other.class == self.class &&
            other.path == self.path &&
            other.view == self.view &&
            other.component.class == self.component.class &&
            other.component.schema == self.component.schema
        end
      end
    end
  end
end
