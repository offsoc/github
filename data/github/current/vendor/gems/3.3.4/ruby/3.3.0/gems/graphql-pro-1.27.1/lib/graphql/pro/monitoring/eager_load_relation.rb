# frozen_string_literal: true
module GraphQL
  module Pro
    module Monitoring
      class EagerLoadRelation
        class Resolve
          attr_reader :inner_resolve

          def initialize(type, field, inner_resolve, options)
            @inner_resolve = inner_resolve
          end

          def call(o, a, c)
            val = @inner_resolve.call(o, a, c)
            if val.is_a?(ActiveRecord::Relation)
              val.load
            end
            val
          end
        end

        def self.before_query(q, o); end
        def self.after_query(q, o); end
      end
    end
  end
end
