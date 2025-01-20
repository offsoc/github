# frozen_string_literal: true
module GraphQL
  module Pro
    class OperationStore
      # Functions for working with the database-backed index.
      #
      # It also uses the OperationStore's `@backend` for persistence operations.
      #
      # @example Reindex a schema
      #   MySchema.operation_store.reindex
      #
      # @api private
      class Index
        def initialize(operation_store:, backend:)
          @operation_store = operation_store
          @backend = backend
        end

        # Get the entry by this name, along with its references
        # @param key [String]
        # @return [GraphQLIndexEntry]
        def get_entry(key)
          # find_or_initialize_by isn't support on Rails 3.2
          @backend.get_index_entry(key)
        end

        # Remove everything from the index
        def purge
          @backend.purge_index
        end

        def get_entry_references(key)
          @backend.get_operations_by_index_entry(key)
        end

        # Drop the whole index and rebuild everything from scratch
        def reindex
          purge
          current_page = 1
          has_next_page = true
          iterations = 0
          while has_next_page && iterations < 1000
            iterations += 1
            op_page = @backend.all_operations(page: current_page, per_page: 100)
            op_map = {}
            op_page.items.each do |operation|
              # Parse the query string
              document = GraphQL.parse(operation.body)
              # Validate it (and run the visitor),
              # accumulating entries in query.context
              # Assume it will pass since it passed previously
              _errs, query = Validate.validate(@operation_store.schema, document, client_name: nil)
              # For each operation, add entries (there should only be one operation)
              index_entries = query.context[:index_entries]
              op_map[operation] = index_entries
            end

            @backend.create_index_references(op_map)
            has_next_page = op_page.next_page
          end
        end

        def index_entry_chain(name)
          parts = name.split(".")
          parts.each_with_index.map do |part, idx|
            case idx
            when 0
              part
            when 1
              "#{parts[0]}.#{part}"
            when 2
              "#{parts[0]}.#{parts[1]}.#{part}"
            else
              raise "Unexpected idx: #{idx} (#{name})"
            end
          end
        end
      end
    end
  end
end
