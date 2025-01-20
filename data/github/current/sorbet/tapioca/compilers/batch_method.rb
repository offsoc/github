# typed: strict
# frozen_string_literal: true

module Tapioca
  module Compilers
    # We leverage the Prelude gem to handle batch loading of data from the database. In addition to the
    # prelude based method we also generate a Promised response for compatibility with GraphQL.
    # This compiler finds all classes which define batch methods and generates the two corresponding
    # methods.
    #
    # Example:
    # ~~~rb
    # class Repository < ApplicationRecord::Base
    #   batch_method(:latest_release) do |repos, actor|
    #     repos.index_with do |repo|
    #       repo.fetch_latest_release(actor)
    #     end
    #   end
    # end
    # ~~~
    #
    # Generates the following RBI file:
    #
    # ~~~rb
    # class Repository
    #   include GeneratedPreludeBatchMethods
    #
    #   module GeneratedPreludeBatchMethods
    #     sig { params(actor: T.untyped).returns(T.untyped) }
    #     def latest_release(actor); end
    #
    #     sig { params(actor: T.untyped).returns(Promise[T.untyped]) }
    #     def async_latest_release(actor); end
    #   end
    # end
    # ~~~

    class BatchMethod < Tapioca::Dsl::Compiler
      extend T::Sig

      ConstantType = type_member { { fixed: T.class_of(::GitHub::BatchMethod) } }

      sig { override.returns(T::Enumerable[Module]) }
      def self.gather_constants
        all_classes.select { |c| c < ::GitHub::BatchMethod }
      end

      sig { override.void }
      def decorate
        return if constant.prelude_methods.empty?

        root.create_path(constant) do |model|
          model.create_module("GeneratedPreludeBatchMethods") do |mod|
            constant.prelude_methods.each do |name, method|
              return_type = T.cast(constant, GitHub::BatchMethod::ClassMethods).prelude_return_types[name]&.to_s || "T.untyped"

              proc = method.instance_variable_get(:@definition)
              params = proc.parameters.drop(1).map do |_type, name|
                create_param(name, type: "T.untyped")
              end

              mod.create_method(name, parameters: params, return_type: return_type)
              mod.create_method("async_batch_#{name}", parameters: params, return_type: "Promise[#{return_type}]")
            end
          end

          model.create_include("GeneratedPreludeBatchMethods")
        end
      end
    end
  end
end
