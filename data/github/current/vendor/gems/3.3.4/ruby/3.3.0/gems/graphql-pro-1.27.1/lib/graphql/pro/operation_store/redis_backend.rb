# frozen_string_literal: true

module GraphQL
  module Pro
    class OperationStore
      # This backend receives persistence commands from OperationStore.
      # You can extend it or use it as inspiration for another backend.
      #
      # It uses `.keys` for many of the dashboard lists. At a certain scale,
      # that's no longer feasible. If you run into problems here,
      # email me (rmosolgo@graphql.pro) and we'll re-implement it using
      # a sorted set to index records, and `sscan` to work through the set.
      #
      # If you're looking for details about method signatures, also check out `active_record_backend.rb`.
      class RedisBackend
        PREFIX = "gql:opstore:"

        # You can provide a custom-initialized Redis here.
        #
        # @param operation_store [GraphQL::Pro::OperationStore]
        # @param redis [Redis]
        def initialize(operation_store:, redis: Redis.new)
          @operation_store = operation_store
          @redis_client = RedisScriptClient.new(redis)
        end

        def supports_batch_upsert?
          # Maybe performance could be improved by pipelining these updates
          false
        end

        def upsert_client(name, secret)
          key = client_key(name)
          now = Time.now.to_i
          @redis_client.with_redis do |redis|
            redis.hmset(key, "name", name, "secret", secret)
            redis.hsetnx(key, "created_at", now)
          end
          ClientRecord.new(
            name: name,
            secret: secret,
            created_at: parse_timestamp(now),
            operations_count: 0, # Not used from this method
            archived_operations_count: 0, # Not used from this method
            last_synced_at: nil,
            last_used_at: nil,
          )
        end

        def get_client(name)
          client_data = @redis_client.with_redis do |redis|
            redis.hgetall(client_key(name))
          end

          if client_data.empty?
            nil
          else
            ClientRecord.new(
              name: client_data["name"],
              secret: client_data["secret"],
              created_at: parse_timestamp(client_data["created_at"].to_i),
              operations_count: 0, # not used from this method
              archived_operations_count: 0, # not used from this method
              last_synced_at: client_data["last_synced_at"] && parse_timestamp(client_data["last_synced_at"].to_i),
              last_used_at: client_data["last_used_at"] && parse_timestamp(client_data["last_used_at"].to_i),
            )
          end
        end

        def delete_client(name)
          # Remove this client's aliased operations
          clops_key = client_operation_keys_key(name)
          @redis_client.with_redis do |redis|
            clops_keys = redis.smembers(clops_key)
            clops_keys.each do |client_op_key|
              op_digest = redis.hget(client_op_key, "digest")
              # Remove the link from operation -> client_operation
              op_refs = operation_client_operation_ref_key(op_digest)
              redis.srem(op_refs, [client_op_key])
              # Remove the operation if this was the last reference to it
              if redis.scard(op_refs) == 0
                delete_operation(op_digest)
              end
              redis.del(client_op_key)
              # Remove the client record
              redis.del(redis_key("client", name))
            end
            redis.del(clops_key)
          end
        end

        def get_operation(client_name, operation_alias, touch_last_used_at:)
          cl_op_key = client_operation_key(client_name, operation_alias)
          digest, is_archived = @redis_client.with_redis do |redis|
            redis.hmget(cl_op_key, "digest", "is_archived")
          end
          if digest && !is_archived
            if touch_last_used_at
              now_i = Time.now.to_i
              op_key = operation_key(digest)
              cl_key = client_key(client_name)
              index_entries = get_index_entries_by_digest(digest)

              @redis_client.with_redis do |redis|
                redis.pipelined do |pipeline|
                  pipeline.hset(cl_op_key, "last_used_at", now_i)
                  pipeline.hset(op_key, "last_used_at", now_i)
                  pipeline.hset(cl_key, "last_used_at", now_i)
                  pipeline.zadd(clients_by_last_used_key, now_i, client_name)
                  index_entries.each do |i_entry|
                    i_entry_key = index_entry_key(i_entry.name)
                    pipeline.hset(i_entry_key, "last_used_at", now_i)
                  end
                end
              end
            end
            get_operation_by_digest(digest)
          else
            nil
          end
        end

        def get_operation_by_digest(digest)
          op_data = @redis_client.with_redis do |r|
            r.hgetall(operation_key(digest))
          end
          if op_data.empty?
            nil
          else
            clop_keys = nil
            any_active_client_ops = nil
            @redis_client.with_redis do |redis|
              clop_keys = redis.smembers(operation_client_operation_ref_key(digest))
              any_active_client_ops = clop_keys.any? { |k| !redis.hget(k, "is_archived") }
            end
            OperationRecord.new(
              name: op_data["name"],
              body: op_data["body"],
              digest: digest,
              clients_count: nil,
              is_archived: !any_active_client_ops,
              last_used_at: op_data["last_used_at"] ? parse_timestamp(op_data["last_used_at"].to_i) : nil,
            )
          end
        end

        def get_client_operations_by_digest(digest)
          @redis_client.with_redis do |redis|
            clop_keys = redis.smembers(operation_client_operation_ref_key(digest))
            clop_keys.map do |clop_key|
              data = redis.hgetall(clop_key)
              ClientOperationRecord.new(
                client_name: data["client"],
                operation_alias: data["alias"],
                digest: digest,
                name: data["name"],
                created_at: parse_timestamp(data["created_at"].to_i),
                last_used_at: data["last_used_at"] ? parse_timestamp(data["last_used_at"].to_i) : nil,
                is_archived: data["is_archived"],
              )
            end
          end
        end

        def get_index_entries_by_digest(digest)
          index_entry_names = @redis_client.with_redis do |redis|
            redis.smembers(index_operation_ref_key(digest))
          end

          index_entry_names.map do |name|
            IndexEntryRecord.new(
              name: name,
              references_count: nil,
              archived_references_count: nil,
              persisted: true,
              last_used_at: nil,
            )
          end
        end

        def delete_operation(digest)
          @redis_client.with_redis do |redis|
            # Remove the main operation
            redis.del(operation_key(digest))
            digests = [digest]
            # Remove references _to_ this operation from the index
            index_refs_key = index_operation_ref_key(digest)
            redis.smembers(index_refs_key).each do |index_key|
              index_ref_key = index_entry_ref_key(index_key)
              redis.srem(index_ref_key, digests)
              # if this was the last operation pointing at this index entry, remove the index entry
              if redis.scard(index_ref_key) == 0
                redis.del(index_entry_key(index_key))
              end
            end
            # Remove this operation's references to index entries
            redis.del(index_refs_key)
            # Remove client_operations pointing to this operation
            ref_key = operation_client_operation_ref_key(digest)
            client_op_keys = redis.smembers(ref_key)
            client_op_keys.each do |client_op_key|
              client_name = redis.hget(client_op_key, "client")
              clops_key = client_operation_keys_key(client_name)
              redis.srem(clops_key, client_op_key)
              redis.del(client_op_key)
            end
            redis.del(ref_key)
          end
        end

        def upsert_client_operation(client, body, digest, op_name, operation_alias)
          @redis_client.with_redis do |redis|
            client_name = client.name
            # First, make sure the operation is present in the database
            operation_key = operation_key(digest)
            redis.hmset(operation_key, "digest", digest, "body", body, "name", op_name)
            newly_created = redis.hsetnx(operation_key, "created_at", Time.now.to_i)

            # And make a reference from this client to the operation
            cl_op_key = client_operation_key(client_name, operation_alias)
            ref_created = redis.hsetnx(cl_op_key, "created_at", Time.now.to_i)
            redis.hset(client_key(client_name), "last_synced_at", Time.now.to_i)

            if ref_created
              redis.hmset(cl_op_key, "client", client_name, "alias", operation_alias, "name", op_name, "digest", digest)
              redis.sadd(client_operation_keys_key(client_name), [cl_op_key])
              redis.sadd(operation_client_operation_ref_key(digest), [cl_op_key])

              op_record = if newly_created
                OperationRecord.new(
                  name: op_name,
                  digest: digest,
                  body: body,
                  clients_count: nil,
                  last_used_at: nil,
                  is_archived: false,
                )
              else
                nil
              end
              AddResult.new(:added, operation_alias: operation_alias, operation_record: op_record)
            else
              prev_digest = redis.hget(cl_op_key, "digest")
              if prev_digest == digest
                AddResult.new(:not_modified, operation_alias: operation_alias)
              else
                AddResult.new(:failed, errors: [
                  "Uniqueness validation failed: make sure operation aliases are unique for '#{client_name}'"
                ], operation_alias: operation_alias)
              end
            end
          end
        end

        # This is an admin task, so it uses `.keys`
        def purge_index
          @redis_client.with_redis do |redis|
            [INDEX_ENTRY_PREFIX, INDEX_ENTRY_REF_PREFIX, INDEX_OPERATION_REF_PREFIX].each do |prefix|
              index_keys = redis.keys(redis_key(prefix, "*"))
              if !index_keys.empty?
                redis.del(*index_keys)
              end
            end
          end
        end

        def get_index_entry(key)
          @redis_client.with_redis do |redis|
            entry_data = redis.hgetall(index_entry_key(key))
            references_count, archived_references_count = ref_counts_for_index_key(key)
            IndexEntryRecord.new(
              name: key,
              references_count: references_count,
              archived_references_count: archived_references_count,
              persisted: !!entry_data["name"],
              last_used_at: entry_data["last_used_at"] ? parse_timestamp(entry_data["last_used_at"].to_i) : nil,
            )
          end
        end

        def get_operations_by_index_entry(key)
          digests = @redis_client.with_redis do |redis|
            redis.smembers(index_entry_ref_key(key))
          end
          digests.map { |d| get_operation_by_digest(d) }
        end

        def create_index_references(operation_index_map)
          all_keys = Set.new
          operation_index_map.each_value { |keys| all_keys.merge(keys) }
          if all_keys.empty?
            return # nothing to write
          end
          @redis_client.with_redis do |redis|
            all_keys.each do |key|
              # Add this item to the index, in case it's not there
              redis.hmset(index_entry_key(key), "name", key)
            end

            operation_index_map.each do |operation_record, keys|
              digest = operation_record.digest
              redis.sadd(index_operation_ref_key(digest), keys.to_a)
              new_digests = [digest]
              keys.each do |key|
                # Build two-way references
                redis.sadd(index_entry_ref_key(key), new_digests)
              end
            end
          end
        end

        # Using `keys` because it's just for the dashboard.
        def all_operations(page:, per_page:, is_archived: false, order_by: nil, order_dir: nil)
          keys_like = redis_key(OPERATION_PREFIX, "*")
          records = []
          @redis_client.with_redis do |redis|
            all_keys = redis.keys(keys_like)
            all_keys.each do |key|
              op_data = redis.hgetall(key)
              digest = op_data["digest"]
              clients_count = 0
              client_ops_keys = redis.smembers(operation_client_operation_ref_key(digest))

              operation_is_archived = true

              client_ops_keys.each do |clop_key|
                clop_is_archived = !!redis.hget(clop_key, "is_archived")
                # If this is false even once, then the operation is not archived
                operation_is_archived &= clop_is_archived

                if clop_is_archived == is_archived
                  clients_count += 1
                end
              end

              if clients_count > 0
                records << OperationRecord.new(
                  name: op_data["name"],
                  body: op_data["body"],
                  digest: digest,
                  clients_count: clients_count,
                  is_archived: operation_is_archived,
                  last_used_at: op_data["last_used_at"] ? parse_timestamp(op_data["last_used_at"].to_i) : nil,
                )
              end
            end
          end

          # I hate to do this in memory -- another option is to maintain a sorted set or something.
          sorted_records = if order_by == "last_used_at"
            unused_operations, used_operations = records.partition { |r| r.last_used_at.nil? }
            sorted_used_ops = used_operations.sort { |l, r| l.last_used_at <=> r.last_used_at}
            sorted_unused_ops = unused_operations.sort { |l, r| l.name <=> r.name }
            sorted_unused_ops + sorted_used_ops
          elsif order_by == "name" || order_by.nil?
            records.sort { |l, r| l.name <=> r.name }
          else
            raise ArgumentError, "unexpected order_by: #{order_by.inspect}"
          end

          if order_dir == :desc
            sorted_records.reverse!
          end

          paginate_keys(sorted_records, page: page, per_page: per_page)
        end

        # Using `keys` because it's just for the dashboard.
        def all_clients(page:, per_page:, order_by: nil, order_dir: nil)
          keys_like = redis_key(CLIENT_PREFIX, "*")
          @redis_client.with_redis do |redis|
            all_keys = redis.keys(keys_like).sort

            # Override with a different ordering, putting unused ones last
            if order_by == "last_used_at"
              client_names = redis.zrange(clients_by_last_used_key, 0, -1)
              last_used_at_keys = client_names.map { |n| client_key(n) }
              unused_client_keys = all_keys - last_used_at_keys
              all_keys = last_used_at_keys + unused_client_keys
            elsif order_by != "name" && !order_by.nil?
              raise ArgumentError, "unexpected order_by: #{order_by.inspect}"
            end

            if order_dir == :desc
              all_keys.reverse!
            end

            paginate_keys(all_keys, page: page, per_page: per_page) do |key|
              data = redis.hgetall(key)
              client_op_keys = redis.smembers(client_operation_keys_key(data["name"]))
              operations_count = 0
              archived_operations_count = 0
              client_op_keys.each do |clop_key|
                if redis.hget(clop_key, "is_archived")
                  archived_operations_count += 1
                else
                  operations_count += 1
                end
              end

              ClientRecord.new(
                name: data["name"],
                secret: data["secret"],
                created_at: parse_timestamp(data["created_at"].to_i),
                operations_count: operations_count,
                archived_operations_count: archived_operations_count,
                last_synced_at: data["last_synced_at"] && parse_timestamp(data["last_synced_at"].to_i),
                last_used_at: data["last_used_at"] ? parse_timestamp(data["last_used_at"].to_i) : nil,
              )
            end
          end
        end

        # Using `keys` because it's just for the dashboard.
        def all_index_entries(search_term: nil, page:, per_page:)
          keys_like = if search_term
            redis_key(INDEX_ENTRY_PREFIX, "*#{search_term}*")
          else
            redis_key(INDEX_ENTRY_PREFIX, "*")
          end
          @redis_client.with_redis do |redis|
            all_keys = redis.keys(keys_like).sort
            paginate_keys(all_keys, page: page, per_page: per_page) do |key|
              data = redis.hgetall(key)
              entry_name = data["name"]
              references_count, archived_references_count = ref_counts_for_index_key(entry_name)
              IndexEntryRecord.new(
                name: entry_name,
                references_count: references_count,
                archived_references_count: archived_references_count,
                persisted: true,
                last_used_at: data["last_used_at"] ? parse_timestamp(data["last_used_at"].to_i) : nil,
              )
            end
          end
        end

        def get_client_operations_by_client(client_name, page:, per_page:, is_archived: false, order_by: nil, order_dir: nil)
          client_ops = []
          @redis_client.with_redis do |redis|
            cl_op_keys = redis.smembers(client_operation_keys_key(client_name))
            cl_op_keys.each do |cl_op_key|
              clop = redis.hgetall(cl_op_key)
              if !!clop["is_archived"] == is_archived
                client_ops << ClientOperationRecord.new(
                  client_name: client_name,
                  operation_alias: clop["alias"],
                  digest: clop["digest"],
                  name: clop["name"],
                  created_at: parse_timestamp(clop["created_at"].to_i),
                  last_used_at: clop["last_used_at"] ? parse_timestamp(clop["last_used_at"].to_i) : nil,
                  is_archived: clop["is_archived"],
                )
              end
            end
          end

          if order_by == "last_used_at"
            unused_client_ops, used_client_ops = client_ops.partition { |clop| clop.last_used_at.nil? }
            unused_client_ops.sort! { |l, r| l.name <=> r.name }
            used_client_ops.sort! { |l, r| l.last_used_at <=> r.last_used_at }
            client_ops = unused_client_ops + used_client_ops
          else
            client_ops.sort! { |l, r| l.name <=> r.name }
          end

          if order_dir == :desc
            client_ops.reverse!
          end

          paginate_keys(client_ops, page: page, per_page: per_page)
        end

        # A no-op
        def transaction
          rollback = ->{}
          yield(rollback)
        end

        def archive_operations(digests:, is_archived:)
          @redis_client.with_redis do |redis|
            digests.each do |digest|
              clops_key = operation_client_operation_ref_key(digest)
              client_operation_keys = redis.smembers(clops_key)
              client_operation_keys.each do |clop_key|
                if is_archived
                  redis.hset(clop_key, "is_archived", "true")
                else
                  redis.hdel(clop_key, "is_archived")
                end
              end
            end
          end
          nil
        end

        def archive_client_operations(client_name:, operation_aliases:, is_archived:)
          @redis_client.with_redis do |redis|
            operation_aliases.each do |op_alias|
              clop_key = client_operation_key(client_name, op_alias)
              if is_archived
                redis.hset(clop_key, "is_archived", "true")
              else
                redis.hdel(clop_key, "is_archived")
              end
            end
          end
          nil
        end

        private

        def paginate_keys(all_keys, page:, per_page:)
          offset = (page - 1) * per_page
          this_page_keys = all_keys[offset, per_page] || []

          items = if block_given?
            this_page_keys.map do |key|
              yield(key)
            end
          else
            this_page_keys
          end


          total = all_keys.size
          page_total = items.size

          if page_total < total
            prev_page = offset > 0 ? page - 1 : false
            next_page = (offset + page_total) < total ? page + 1 : false
          else
            next_page = false
            prev_page = false
          end

          DashboardPage.new(
            items: items,
            next_page: next_page,
            prev_page: prev_page,
            total_count: total,
          )
        end

        def ref_counts_for_index_key(entry_name)
          references_count = nil
          archived_references_count = nil

          @redis_client.with_redis do |redis|
            op_digests = redis.smembers(index_entry_ref_key(entry_name))
            references_count = 0
            archived_references_count = 0
            op_digests.each do |digest|
              clop_keys = redis.smembers(operation_client_operation_ref_key(digest))
              active_key = clop_keys.find { |k| !redis.hget(k, "is_archived") }
              if active_key
                references_count += 1
              else
                archived_references_count += 1
              end
            end
          end

          return references_count, archived_references_count
        end

        CLIENT_PREFIX = "cl"

        def client_key(client_name)
          redis_key(CLIENT_PREFIX, client_name)
        end

        OPERATION_PREFIX = "op"

        def operation_key(digest)
          redis_key(OPERATION_PREFIX, digest)
        end

        def client_operation_keys_key(client_name)
          redis_key("clops", client_name)
        end

        def client_operation_key(client_name, op_alias)
          redis_key("clop", client_name, op_alias)
        end

        # These are references from an operation to the client-operations
        def operation_client_operation_ref_key(digest)
          redis_key("opclop", digest)
        end

        INDEX_ENTRY_PREFIX = "idx"

        def index_entry_key(name)
          redis_key(INDEX_ENTRY_PREFIX, name)
        end

        INDEX_ENTRY_REF_PREFIX = "idxref"

        def index_entry_ref_key(name)
          redis_key(INDEX_ENTRY_REF_PREFIX, name)
        end

        INDEX_OPERATION_REF_PREFIX = "opref"

        def index_operation_ref_key(digest)
          redis_key(INDEX_OPERATION_REF_PREFIX, digest)
        end

        def clients_by_last_used_key
          redis_key("clused")
        end

        def redis_key(*strs)
          "#{PREFIX}#{strs.join(":")}"
        end

        def parse_timestamp(int)
          Time.at(int).utc
        end
      end
    end
  end
end
