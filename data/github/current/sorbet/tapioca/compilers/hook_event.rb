# typed: strict
# frozen_string_literal: true

module Tapioca
  module Compilers
    # We use `Hook::Event` subclasses to represent Web hook payloads. The
    # attributes on the payload are specified with the `event_attr` DSL.
    # All events have some common attributes, which are also dynamically
    # defined (`triggered_at`, `delivered_hook_ids`, etc.)
    #
    # This compiler exposes the setter and getter methods for each event
    # attribute, and the arguments for the `#initialize` and `.queue` methods.
    #
    # Example:
    # ~~~rb
    # class Hook::Event::MyEvent < Hook::Event
    #   event_attr :foo, required: true
    #   event_attr :bar
    # end
    # ~~~
    #
    # Generates something similar to the following RBI file. The full list of
    # standard hook event fields has been elided for clarity:
    #
    # ~~~rbi
    # class Hook::Event::MyEvent
    #   sig do
    #     params(
    #       foo: T.untyped,
    #       triggered_at: T.untyped,
    #       delivered_hook_ids: T.untyped,
    #       bar: T.untyped
    #       # ...
    #     ).void
    #   end
    #   def initialize(foo:, triggered_at:, delivered_hook_ids: nil, bar: nil); end
    #
    #   sig { returns(T.untyped) }
    #   def bar; end
    #
    #   sig { params(value: T.untyped).void }
    #   def bar=(value); end
    #
    #   sig { returns(T.untyped) }
    #   def foo; end
    #
    #   sig { params(value: T.untyped).void }
    #   def foo=(value); end
    #
    #   class << self
    #     sig do
    #       params(
    #         foo: T.untyped,
    #         triggered_at: T.untyped,
    #         bar: T.untyped,
    #         delivered_hook_ids: T.untyped
    #       ).void
    #     end
    #     def queue(foo:, triggered_at:, bar: nil, delivered_hook_ids: nil); end
    #   end
    # end
    # ~~~
    class HookEvent < Tapioca::Dsl::Compiler
      extend T::Sig

      ConstantType = type_member { { fixed: T.class_of(Hook::Event) } }

      sig { override.returns(T::Enumerable[Module]) }
      def self.gather_constants
        all_classes.select { |c| c < ::Hook::Event }
      end

      sig { override.void }
      def decorate
        return if constant.valid_attribute_keys.empty?

        # Several events have a `primary_resource` attribute that doesn't show
        # up in `constant.valid_attribute_keys`
        attributes = constant.valid_attribute_keys
        attributes << :primary_resource

        # Sort the attributes required first, then by name.
        # When we define methods using these arguments we must put all of
        # the required arguments before all of the optional arguments.
        sorted_attributes = constant.valid_attribute_keys.sort_by do |name|
          [
            constant.required_attribute_keys.include?(name) ? 0 : 1,
            name,
          ]
        end

        root.create_path(constant) do |event|
          initializer_params = sorted_attributes.map do |name|
            if constant.required_attribute_keys.include?(name)
              create_kw_param(name, type: "T.untyped")
            else
              create_kw_opt_param(name, type: "T.untyped", default: "nil")
            end
          end

          # Only add a signature for the inherited queue method if it hasn't been
          # overridden in the Hook::Event subclass.
          if constant.method(:queue).owner == ::Hook::Event.singleton_class
            event.create_method(
              "queue",
              parameters: initializer_params,
              return_type: "T::Boolean",
              class_method: true,
            )
          end

          event.create_method(
            "initialize",
            parameters: initializer_params,
            return_type: "void",
          )

          sorted_attributes.each do |name|
            event.create_method(name, return_type: "T.untyped")
            event.create_method(
              "#{name}=",
              parameters: [create_param("value", type: "T.untyped")],
              return_type: "void",
            )
          end
        end
      end
    end
  end
end
