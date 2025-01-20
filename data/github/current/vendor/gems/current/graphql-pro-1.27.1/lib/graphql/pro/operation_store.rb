# frozen_string_literal: true
require "digest"

module GraphQL
  module Pro
    class OperationStore
      # This is required by active_record_adapter:
      OPERATION_ID_SEPARATOR = "/"
    end
  end
end


if defined?(ActiveRecord)
  require "graphql/pro/operation_store/active_record_backend"
end

require "graphql/pro/operation_store/add_operation"
require "graphql/pro/operation_store/add_operation_batch"
require "graphql/pro/operation_store/add_result"
require "graphql/pro/operation_store/client_operation_record"
require "graphql/pro/operation_store/client_record"
require "graphql/pro/operation_store/dashboard_page"
require "graphql/pro/operation_store/endpoint"
require "graphql/pro/operation_store/index"
require "graphql/pro/operation_store/index_entry_record"
require "graphql/pro/operation_store/index_visitor"
require "graphql/pro/operation_store/operation_names_are_present_and_unique"
require "graphql/pro/operation_store/operation_record"
require "graphql/pro/operation_store/migration"
require "graphql/pro/operation_store/normalize"
require "graphql/pro/operation_store/query_instrumentation"
require "graphql/pro/operation_store/redis_backend"
require "graphql/pro/operation_store/validate"

module GraphQL
  module Pro
    class OperationStore
      class InvalidClientNameError < StandardError
        def initialize(client_name)
          super("Client name is invalid: #{client_name.inspect}. It may not include /.")
        end
      end

      extend Forwardable
      KEY = :__graphql_pro_operation_store__

      def self.use(defn, trace: false, **options)
        schema = defn.is_a?(Class) ? defn : defn.target
        operation_store = self.new(schema: schema, trace: trace, **options)
        if schema.respond_to?(:metadata)
          schema.metadata[KEY] = operation_store
        end
        schema.operation_store = operation_store
        if trace
          # This is how it _used_ to work, but the order dependency made things too wonky
          if schema.respond_to?(:trace_with)
            schema.trace_with(QueryTrace)
          else
            query_instrumentation = GraphQL::Pro::OperationStore::QueryInstrumentation.new
            # Put this first so it comes before anything that depends on `query_string`.
            if schema.respond_to?(:tracer)
              schema.tracer(query_instrumentation)
            else
              schema.tracers.unshift(query_instrumentation)
            end
          end
        end
      end

      module QueryTrace
        def execute_multiplex(multiplex:)
          multiplex.queries.each { |q| q.check_operation_store }
          super
        end
      end

      attr_reader :schema

      # @return [Boolean] If true, set `last_used_at` on operations and index entries whenever a query is run from the store
      attr_accessor :default_touch_last_used_at

      # @return [GraphQL::Pro::OperationStore::Index]
      attr_reader :index

      def initialize(schema:, trace: false, backend_class: nil, default_touch_last_used_at: true, update_last_used_at_every: nil, **backend_options)
        if backend_class.nil?
          backend_class = if backend_options[:redis]
            if update_last_used_at_every
              raise ArgumentError, "`update_last_used_at_every: ...` is only supported for ActiveRecord, please remove that option."
            end
            OperationStore::RedisBackend
          else
            OperationStore::ActiveRecordBackend
          end
        end
        @trace = trace
        @default_touch_last_used_at = default_touch_last_used_at
        @backend = backend_class.new(operation_store: self, **backend_options)
        @schema = schema
        @index = OperationStore::Index.new(operation_store: self, backend: @backend)
        @pending_last_used_ats = {}
        @mutex = Thread::Mutex.new
        @update_last_used_at_every = update_last_used_at_every || 5
        @ticker_thread = nil
      end

      # @return [Boolean] if true, then this operation store installed a tracer
      def trace?
        @trace
      end

      # Log this new last_used_at to be updated later
      # @api private
      def touch_last_used_at(client_operation_record_id, last_used_at)
        @mutex.synchronize do
          @pending_last_used_ats[client_operation_record_id] = last_used_at
        end

        if update_last_used_at_every == 0
          flush_pending_last_used_ats
        else
          @ticker_thread ||= Thread.new do
            sleep(update_last_used_at_every)
            @ticker_thread = nil
            flush_pending_last_used_ats
          end
        end
      end

      # @api private
      attr_reader :pending_last_used_ats

      # @return [Integer] with ActiveRecord, update `last_used_at` after this many seconds
      attr_accessor :update_last_used_at_every

      # Destroy the index and rebuild it from scratch
      # @return [void]
      def reindex
        @index.reindex
      end

      # Find an operation which was stored by Client `client_name`
      # with the alias `operation_alias`.
      # @return [OperationRecord, nil]
      def get(client_name:, operation_alias:, touch_last_used_at: false)
        @backend.get_operation(client_name, operation_alias, touch_last_used_at: touch_last_used_at)
      end

      # Ensure that `body` is registered to `client_name` as `client_alias`.
      # This may insert several records:
      #
      # - Add an operation if `body` is not found
      # - Add a client_operation if `operation_alias` is not found for this client
      #
      # Or, if all those are found, it performs no changes.
      #
      # The addition is run in a transaction. If the `add` fails,
      # the whole transaction is rolled back.
      #
      # @param body [String] GraphQL string containing one operation
      # @param client_name [String] Name of a client
      # @param operation_alias [String] This client's alias for `body`
      # @return [OperationStore::AddOperation::AddResult]
      def add(body:, client_name:, operation_alias:)
        AddOperation.call(
          body: body,
          client_name: client_name,
          operation_alias: operation_alias,
          schema: schema,
          backend: schema.operation_store,
        )
      end

      def upsert_client(name, secret)
        if name.include?("/")
          raise InvalidClientNameError.new(name)
        else
          @backend.upsert_client(name, secret)
        end
      end

      # These persistence operations are all delegated to the backend.
      # See also usages of `@backend` in this file and `index.rb`
      def_delegators :@backend,
        :get_operation_by_digest,
        :get_client_operations_by_digest,
        :get_index_entries_by_digest,
        :get_operations_by_index_entry,
        :get_operation,
        :get_client,
        :delete_client,
        :delete_operation,
        :transaction,
        :upsert_client_operation,
        :get_client_operations_by_client,
        :all_operations,
        :all_index_entries,
        :all_clients,
        :archive_operations,
        :archive_client_operations,
        :create_index_references,
        :supports_batch_upsert?,
        :batch_upsert_client_operations,
        :update_last_used_ats

      # @api private
      def flush_pending_last_used_ats
        @mutex.synchronize do
          if @pending_last_used_ats.any?
            update_last_used_ats(@pending_last_used_ats)
            @pending_last_used_ats.clear
          end
        end
      end

      # Assign `query_string` and `operation_name` if `query.query_string` is null.
      # Based on `context[:operation_id]`.
      # @return [void]
      def populate_operation(query)
        if query.document.nil? && query.query_string.nil?
          operation_id = query.context[:operation_id]
          if operation_id
            operation_id_parts = operation_id.split(OPERATION_ID_SEPARATOR, 2)
            if operation_id_parts.length == 2
              client_name, operation_name = operation_id_parts
              touch_last_used_at = query.context.fetch(:operation_store_touch_last_used_at, default_touch_last_used_at)
              operation = get(client_name: client_name, operation_alias: operation_name, touch_last_used_at: touch_last_used_at)
              if operation
                query.query_string = operation.body
                query.operation_name = operation.name
              else
                err = GraphQL::ExecutionError.new("Operation not found for \"#{operation_id}\"")
                query.context.add_error(err)
              end
            else
              err = GraphQL::ExecutionError.new("Failed to deconstruct operation id: #{operation_id} (got: #{operation_id_parts})")
              query.context.add_error(err)
            end
          end
        end
        nil
      end

      private

      class << self
        def debug(err: nil)
          if err
            debug {
              "#{err.class}: #{err.message} (#{err.inspect})\n#{err.backtrace.first(3)}"
            }
          else
            logger.debug("GraphQL::Pro::OperationStore") { "OperationStore: " + yield.to_s }
          end
        end

        def logger
          if @logger
            @logger
          elsif defined?(Rails) && Rails.logger
            Rails.logger
          else
            @logger = Logger.new($stdout)
          end
        end

        attr_writer :logger
      end

      module SchemaExtension
        attr_writer :operation_store

        def operation_store
          if defined?(@operation_store)
            @operation_store
          else
            # In GraphQL >= 1.9, the first call to `.graphql_definition`
            # will cause the operation_store to be assigned to the class.
            @operation_store = nil
            @operation_store = self.class.operation_store
          end
        end

        module ClassMethods
          attr_writer :operation_store

          def operation_store
            if defined?(@operation_store)
              @operation_store
            elsif respond_to?(:graphql_definition) && GraphQL::VERSION.start_with?("1.9.")
              # On GraphQL 1.9, a defined object proxy is passed to `use`,
              # and the assignment is made on the schema instance, not the class.
              # So, reach for that in this case.
              deprecated_graphql_definition.operation_store
            else
              nil
            end
          end
        end
      end

      module QueryExtension
        def initialize(*_args, **_kwargs)
          super
          if schema.operation_store && !schema.operation_store.trace?
            check_operation_store
          end
        end

        def check_operation_store
          schema.operation_store.populate_operation(self)
        end
      end

      GraphQL::Schema.include(SchemaExtension)
      GraphQL::Schema.extend(SchemaExtension::ClassMethods)
      GraphQL::Query.prepend(QueryExtension)
    end
  end
end
