# frozen_string_literal: true

module GraphQL
  module Pro
    class OperationStore
      # Copy records from one backend into another.
      #
      # It leaves the old backend untouched.
      #
      # Caveats:
      #
      # - Any operations added _during_ the migration (or after it) won't be copied
      # - `created_at` and `last_synced_at` timestamps are not copied
      #
      # @example migrating from ActiveRecord to Redis backend
      #   redis = Redis.new # Your redis config here
      #   schema = MySchema # Your schema here
      #   # Initialize backend instances
      #   ar_backend = GraphQL::Pro::OperationStore::ActiveRecordBackend.new(operation_store: schema.operation_store)
      #   redis_backend = GraphQL::Pro::OperationStore::RedisBackend.new(operation_store: schema.operation_store, redis: redis)
      #   # Call the migration script
      #   GraphQL::Pro::OperationStore::Migration.call(
      #     schema: schema,
      #     old_backend: ar_backend,
      #     new_backend: redis_backend,
      #   )
      class Migration
        FAILURE_WARNING = <<-ERR
Failed to migrate:

- errors: %{errors}
- client_name: %{client_name},
- operation_alias: %{operation_alias},
- body: %{operation_body}

ERR

        def self.call(schema:, old_backend:, new_backend:, page_size: 50)
          client_page_number = 1
          next_client_page = true
          while next_client_page
            clients_page = old_backend.all_clients(page: client_page_number, per_page: page_size)
            clients_page.items.each do |client_record|
              # Add the client record
              new_backend.upsert_client(
                client_record.name,
                client_record.secret,
              )

              operations_page_number = 1
              next_operations_page = true
              while next_operations_page
                operations_page = old_backend.get_client_operations_by_client(client_record.name, page: operations_page_number, per_page: page_size)
                operations_page.items.each do |client_operation_record|
                  operation_record = old_backend.get_operation_by_digest(client_operation_record.digest)
                  # Add each operation record, this codepath also updates the index
                  res = GraphQL::Pro::OperationStore::AddOperation.call(
                    client_name: client_record.name,
                    body: operation_record.body,
                    operation_alias: client_operation_record.operation_alias,
                    schema: schema,
                    backend: new_backend
                  )

                  if res.errors.any?
                    warn(FAILURE_WARNING % {
                      errors: res.errors.inspect,
                      client_name: client_record.name.inspect,
                      operation_alias: client_operation_record.operation_alias.inspect,
                      operation_body: operation_record.body,
                    })
                  end
                end
                operations_page_number += 1
                next_operations_page = operations_page.next_page
              end
            end
            client_page_number += 1
            next_client_page = clients_page.next_page
          end
        end
      end
    end
  end
end
