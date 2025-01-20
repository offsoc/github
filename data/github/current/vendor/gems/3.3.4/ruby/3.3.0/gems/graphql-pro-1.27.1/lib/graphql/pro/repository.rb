# frozen_string_literal: true
require "graphql/pro/repository/add_typename_visitor"
require "graphql/pro/repository/operations_must_be_uniquely_named"
require "graphql/pro/repository/reloader"
require "graphql/pro/repository/usage_visitor"
require "set"

module GraphQL
  module Pro
    class Repository
      include GraphQL::Define::InstanceDefinable

      defn_method = respond_to?(:deprecated_accepts_definitions) ? :deprecated_accepts_definitions : :accepts_definitions
      public_send(defn_method, :schema, :string, :path, :add_typename, :arbitrary_input)

      RULES = GraphQL::StaticValidation::ALL_RULES - [
        GraphQL::StaticValidation::OperationNamesAreValid,
      ] + [
        GraphQL::Pro::Repository::OperationsMustBeUniquelyNamed,
      ]

      ARBITRARY_INPUT_SETTINGS = Set.new([:crash, :ignore, :execute])

      class InvalidRepositoryError < RuntimeError
        def initialize(messages)
          super(messages.join(", "))
        end
      end

      # @return [GraphQL::Schema]
      attr_accessor :schema

      # @return [String, nil]
      attr_accessor :path

      # @return [Hash{GraphQL::BaseType => Array<GraphQL::Field>}]
      attr_reader :unused_fields

      # @return [String] the original source of this repo
      attr_reader :to_source

      # @return [String] the normalized, reprinted documents for this repo
      attr_reader :to_query_string

      # @api private
      attr_writer :add_typename, :string

      # @return [Symbol]
      attr_reader :arbitrary_input

      # @return [String]
      attr_reader :source_filename

      def initialize
        warn("GraphQL::Pro::Repository is deprecated; See OperationStore for a replacement: https://graphql-ruby.org/operation_store/overview.html")
        self.arbitrary_input = :ignore
      end

      # Eagerly define
      def define(**kwargs, &block)
        # Queue up the lazy definition:
        super
        # Execute the definition:
        ensure_defined

        # Get the place where this was defined so that we can track changes:
        @source_filename = caller_locations(2, 1).first.path
        if @path
          Reloader.add(@source_filename, self)
        end

        reload
      end

      # Behaves just like {Schema#execute} __except__ if a query string or document
      # is provided, it handles it according to the {#arbitrary_input} mode
      # @param arbitrary_input [Symbol] How to handle a query string for this execution?
      # @see [Schema#execute]
      def execute(query_str = nil, document: nil, operation_name: nil, arbitrary_input: nil, **kwargs)
        arbitrary_input_value = query_str || document
        arbitrary_input_setting = arbitrary_input || @arbitrary_input
        exec_args = nil

        if arbitrary_input_value
          if arbitrary_input_setting == :crash
            raise ArgumentError, "arbitrary_input input is not allowed"
          elsif arbitrary_input_setting == :execute
            exec_args = [query_str, kwargs.merge(document: document, operation_name: operation_name)]
          end
        elsif !operation_name
          raise ArgumentError, "missing keyword argument: operation_name"
        end

        if !exec_args
          # Else, either there is no arbitrary input or we're ignoring it
          # Fall back to the whole document and let `Query#execute` handle the error:
          doc = @documents.fetch(operation_name, @source_document)
          exec_args = [kwargs.merge(document: doc, operation_name: operation_name)]
        end

        @schema.execute(*exec_args)
      end

      # Read files, prepare ASTs
      # (Call this to reload from Rails)
      # @return [void]
      def reload
        ensure_defined
        @to_source = load_source
        @source_document = GraphQL.parse(@to_source)
        # Assert that all operations are named
        # Assert that operation names are unique
        errors = validate_doc(schema, @source_document, rules: RULES)
        if errors.any?
          raise InvalidRepositoryError.new(errors.map(&:message))
        end

        visitor = GraphQL::Language::Visitor.new(@source_document)
        type_stack = GraphQL::StaticValidation::TypeStack.new(schema, visitor)
        usage = Repository::UsageVisitor.new(schema, visitor, type_stack)

        if @add_typename
          Repository::AddTypenameVisitor.mount(visitor)
        end

        visitor.visit

        @unused_fields = Hash.new { |h, k| h[k] = [] }
        usage.field_usages.each do |type, fields|
          fields.each do |field, field_usage|
            if field_usage.usages.length == 0
              @unused_fields[type] << field
            end
          end
        end

        @documents = {}

        # Slice the doc + dependencies ahead of time
        # to minimize the validation overhead for each query
        @source_document.definitions.each do |defn|
          name = defn.name
          @documents[name] = @source_document.slice_definition(name)
        end

        @to_query_string = @source_document.to_query_string
        nil
      end

      def arbitrary_input=(arbitrary_input_setting)
        if ARBITRARY_INPUT_SETTINGS.include?(arbitrary_input_setting)
          @arbitrary_input = arbitrary_input_setting
        else
          raise ArgumentError, "Invalid arbitrary_input setting: #{arbitrary_input_setting}"
        end
      end

      def glob
        File.join(@path.to_s, "**/*.graphql")
      end

      private

      def load_source
        if @string
          @string
        elsif @path
          files = Dir.glob(glob)
          if files.none?
            raise ArgumentError, "No files found for glob: #{glob}"
          end
          all_graphql = "".dup
          files.each do |f|
            all_graphql << File.read(f)
          end
          all_graphql
        else
          raise ArgumentError, "`string` or `path` is required to build a Repository!"
        end
      end

      # TODO replace this with Schema#validate when 1.5.0 ships
      def validate_doc(schema, string_or_document, rules: nil)
        doc = if string_or_document.is_a?(String)
          GraphQL.parse(string_or_document)
        else
          string_or_document
        end
        query = GraphQL::Query.new(schema, document: doc)
        validator_opts = { schema: schema }
        rules && (validator_opts[:rules] = rules)
        validator = GraphQL::StaticValidation::Validator.new(validator_opts)
        res = validator.validate(query)
        res[:errors]
      end
    end
  end
end
