# frozen_string_literal: true
module GraphQL
  module Pro
    module Access
      class Instrumentation
        # Wrap the field's resolve function with authorization:
        #
        # - Check the parent_role before resolving the field
        # - Check the field's role and return type's role after resolving the field
        #
        # For lists, filter the list so that unauthorized objects are removed.
        class AuthorizedResolve
          def initialize(return_type, merged_gate, inner_resolve)
            @return_type = return_type
            @merged_gate = merged_gate
            @inner_resolve = inner_resolve
          end

          def call(obj, args, ctx)
            inner_value = (defined?(GraphQL::Schema::Field) && obj.is_a?(GraphQL::Schema::Object)) ? obj.object : obj

            # AllowedValue.call doesn't really apply since it uses @return_type
            if ctx.schema.lazy?(obj) || @merged_gate.allowed_parent?(ctx.query, ctx[STRATEGY_KEY], inner_value)
              value = @inner_resolve.call(obj, args, ctx)
              if ctx.schema.lazy?(value)
                # This will get authorized later, in lazy_resolve
                value
              else
                v = AllowedValue.call(@merged_gate, ctx, @return_type, value)
                if v.equal?(AllowedValue::NOT_ALLOWED)
                  AllowedValue.unauthorized_object(value, ctx)
                else
                  v
                end
              end
            else
              AllowedValue.unauthorized_object(value, ctx)
            end
          end

          private

          module AllowedValue
            NOT_ALLOWED = :__graphql_pro_access_not_allowed__
            def self.call(merged_gate, ctx, type, value, fallback: NOT_ALLOWED)
              if value.nil?
                nil
              else
                strategy = ctx[STRATEGY_KEY]
                case type.kind.name
                when "LIST"
                  # These objects get scoping treatment:
                  if (
                      (defined?(ActiveRecord::Relation) && value.is_a?(ActiveRecord::Relation)) ||
                      (defined?(Mongoid::Criteria) && value.is_a?(Mongoid::Criteria))
                    ) && strategy.respond_to?(:scope)
                    value = merged_gate.allowed_value(ctx.query, strategy, value, fallback: fallback)
                  end
                  AllowedList.new(merged_gate, ctx, type.of_type, value)
                when "NON_NULL"
                  call(merged_gate, ctx, type.of_type, value, fallback: fallback)
                when "OBJECT", "UNION", "INTERFACE", "ENUM", "INPUT_OBJECT", "SCALAR"
                  merged_gate.allowed_value(ctx.query, strategy, value, fallback: fallback)
                else
                  raise "Unknown Type: #{type.inspect}"
                end
              end
            end

            def self.unauthorized_object(obj, ctx)
              # Call the handler but ignore the return value
              ctx.schema.metadata[UNAUTHORIZED_OBJECT_KEY].call(obj, ctx) { |i| i }
            end
          end

          # Filter `inner_list` according to the auth gate.
          # Iterate over it only once.
          # Also filter any nested lists.
          class AllowedList
            include Enumerable

            def initialize(merged_gate, ctx, inner_type, inner_list)
              @ctx = ctx
              @merged_gate = merged_gate
              @inner_type = if inner_type.is_a?(GraphQL::NonNullType)
                inner_type.of_type
              else
                inner_type
              end
              @inner_list = inner_list
              # Cache the filtered result here after the first run:
              @allowed_items = nil
            end

            def each
              if @allowed_items
                @allowed_items.each { |i| yield(i) }
              else
                @allowed_items = []

                @inner_list.each do |item|
                  allowed_item = AllowedValue.call(@merged_gate, @ctx, @inner_type, item)
                  if allowed_item.equal?(AllowedValue::NOT_ALLOWED)
                    # Give the user a chance to return something else:
                    allowed_item = AllowedValue.unauthorized_object(item, @ctx) || allowed_item
                  end

                  # If it is now allowed, enumerate over it
                  if !allowed_item.equal?(AllowedValue::NOT_ALLOWED)
                    @allowed_items << allowed_item
                    yield(allowed_item)
                  end
                end
              end
              # Just to make double-sure we don't leak any unchecked objects:
              nil
            end
          end
        end
      end
    end
  end
end
