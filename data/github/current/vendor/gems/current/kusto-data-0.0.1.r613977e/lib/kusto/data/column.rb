# typed: true
# frozen_string_literal: true

module Kusto
  module Data
    class Column
      extend T::Sig

      sig { returns(String) }
      attr_reader :name

      sig { returns(String) }
      attr_reader :type

      sig { params(column_hash: T::Hash[String, T.untyped]).void }
      def initialize(column_hash)
        @name = column_hash["ColumnName"] || raise(ArgumentError, "ColumnName is required")
        @type = column_hash["ColumnType"] || raise(ArgumentError, "ColumnType is required")
      end
    end
  end
end
