# frozen_string_literal: true
module GraphQL
  module Pro
    class OperationStore
      class AddOperationBatch
        class BatchFailedError < StandardError; end
        # Add each of `operations` to `operation_store`, belong to `client_name`.
        #
        # @param client_name [String]
        # @param operation_store [GraphQL::Pro::OperationStore]
        # @param operations [Array<Hash("alias" => String, "body" => String)]
        # @param changeset_version [String] specifies the API version to use, if present
        # @param context [Hash] Context to be used when *validating* incoming documents. (Not used for execution.)
        # @return [Hash(added: Array<String>, not_modified: Array<String>, failed: Array<String>, errors: Hash<String => Array<<Hash>>)]
        def self.call(client_name:, operation_store:, operations:, context: {}, changeset_version: nil)
          response_data = {
            added: [],
            not_modified: [],
            failed: [],
            errors: {},
          }

          if changeset_version
            response_data[:changeset_version] = changeset_version
          end

          committed = true

          operation_store.transaction do |rollback|
            batch_add = self.new(client_name: client_name, operation_store: operation_store, context: context, changeset_version: changeset_version)

            operations.each do |operation|
              begin
                op_alias = operation.fetch("alias")
                op_body = operation.fetch("body")
              rescue KeyError => error
                raise BatchFailedError, "Invalid input structure, missing JSON key: #{error.key.inspect}"
              end

              result = batch_add.prepare_operation(body: op_body, operation_alias: op_alias)

              if result && result.failed?
                break
              end
            end

            batch_add.save!

            batch_add.results.each do |op_result|
              if op_result.added?
                response_data[:added] << op_result.operation_alias
              elsif op_result.not_modified?
                response_data[:not_modified] << op_result.operation_alias
              elsif op_result.failed?
                response_data[:failed] << op_result.operation_alias
                response_data[:errors][op_result.operation_alias] = op_result.errors
              end
            end

            if response_data[:errors].any?
              committed = false
              rollback.call
              # This indicates that `rollback.call` was a no-op
              committed = nil
            end
          end

          case committed
          when false
            response_data[:not_modified] = []
            response_data[:added] = []
            response_data[:committed] = false
          when nil
            response_data[:committed] = "partial"
          when true
            response_data[:committed] = true
          end

          response_data
        end

        # @param operation_store [GraphQL::Pro::OperationStore, GraphQL::Pro::OperationStore::RedisBackend, GraphQL::Pro::OperationStore::ActiveRecordBackend]
        # @param schema [Class<GraphQL::Schema>] Required if a backend is given as `operation_store`, otherwise `operation_store.schema` is used.
        def initialize(client_name:, operation_store:, context: {}, changeset_version: nil, schema: nil)
          @client = operation_store.get_client(client_name) || raise("No GraphQL Operation Store client called #{client_name.inspect}")
          @operation_store = operation_store
          @supports_batch_upsert = @operation_store.supports_batch_upsert?
          @context = context
          @schema = schema || operation_store.schema
          @results = []
          @operation_queries = []
          @index_queries = []
          @finished = false
          @changeset_version = changeset_version
        end

        # Assert that GraphQL is syntactically valid
        # and appropriate input for the schema.
        #
        # If it passes, enqueue the operation for saving with `.save!`
        #
        # @return [AddResult, nil]
        def prepare_operation(body:, operation_alias:)
          document = GraphQL.parse(body)

          if @supports_batch_upsert
            @operation_queries << [nil, operation_alias, document]
          else
            document = GraphQL.parse(body)
            errs, query = Validate.validate(@schema, document, context: @context.dup, client_name: @client.name, changeset_version: @changeset_version)
            if errs.any?
              OperationStore.debug { errs.map(&:to_h) }
              error_messages = errs.map { |e|
                locations = e.to_h["locations"]
                  .select { |l| l["line"] }
                  .map { |l| "#{l["line"]}:#{l["column"]}" }
                  .join(", ")

                if !locations.empty?
                  locations = " (#{locations})"
                end

                "#{e.message}#{locations}"
              }
              result = AddResult.new(:failed, errors: error_messages, operation_alias: operation_alias)
              @results << result
              return result
            end
            @operation_queries << [query, operation_alias, document]
          end

          # Find the operation definitions in this document
          operation_definitions = document.definitions.select { |defn| defn.is_a?(GraphQL::Language::Nodes::OperationDefinition) }
          if operation_definitions.length != 1
            op_names = operation_definitions.map { |d| d.name || "(anonymous)" }.join(", ")
            result = AddResult.new(:failed, errors: ["Documents must contain only 1 operation, but received: #{op_names}"], operation_alias: operation_alias)
            @results << result
            return result
          end

          nil
        rescue GraphQL::ParseError => err
          result = AddResult.new(:failed, errors: ["Syntax error: #{err.message}"], operation_alias: operation_alias)
          @results << result
          result
        end

        # @return [void]
        def save!
          operations_to_upsert = @operation_queries.map do |(query, operation_alias, document)|
            defn = document.definitions.find { |defn| defn.is_a?(GraphQL::Language::Nodes::OperationDefinition) }
            # Split out the operation with its dependencies
            with_deps = document.slice_definition(defn.name)
            # Make a normalized string & hash it
            defn_str = Normalize.to_normalized_graphql(with_deps)
            defn_hash = get_hash(defn_str)
            {
              query: query,
              definition_string: defn_str,
              operation_document: with_deps,
              operation_digest: defn_hash,
              operation_alias: operation_alias,
              operation_name: defn.name,
            }
          end

          if @supports_batch_upsert
            upsert_results = @operation_store.batch_upsert_client_operations(@client, operations_to_upsert, context: @context, changeset_version: @changeset_version)
            @results.concat(upsert_results)
          else
            operation_index_map = {}
            operations_to_upsert.each do |operation_to_upsert|
              begin
                operation_alias = operation_to_upsert[:operation_alias]
                add_result = @operation_store.upsert_client_operation(
                  @client,
                  operation_to_upsert[:definition_string],
                  operation_to_upsert[:operation_digest],
                  operation_to_upsert[:operation_name],
                  operation_alias,
                )
                @results << add_result
                if add_result.failed?
                  break
                elsif add_result.added? && add_result.operation_record
                  query = operation_to_upsert[:query]
                  index_entries = query.context[:index_entries]
                  operation_index_map[add_result.operation_record] = index_entries
                end
              rescue StandardError => err
                OperationStore.debug(err: err)
                @results << AddResult.new(:failed, errors: ["An internal error occurred"], operation_alias: operation_alias)
                break
              end
            end

            @operation_store.create_index_references(operation_index_map)
          end
          nil
        end

        def failed?
          @results.any?(&:failed?)
        end

        # @return [Array<AddResult>]
        def results
          @results
        end

        private

        def get_hash(str)
          Digest::MD5.hexdigest(str)
        end
      end
    end
  end
end
