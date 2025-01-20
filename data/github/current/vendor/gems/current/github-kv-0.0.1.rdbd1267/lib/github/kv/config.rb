# frozen_string_literal: true

module GitHub
  class KV
    class Config
      attr_accessor :table_name, :encapsulated_errors, :use_local_time, :shard_key_column

      def initialize
        @table_name = "key_values"
        @encapsulated_errors = [SystemCallError]
        @use_local_time = false
        @shard_key_column = nil
      end
    end
  end
end
