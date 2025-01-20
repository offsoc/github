# typed: true
# frozen_string_literal: true

require "kusto/data/column"

module Kusto
  module Data
    class Table
      extend T::Sig

      sig { returns(Integer) }
      attr_reader :id

      sig { returns(Integer) }
      attr_reader :index

      sig { returns(String) }
      attr_reader :name

      sig { returns(String) }
      attr_reader :kind

      sig { returns(T::Array[Column]) }
      attr_reader :columns

      sig { returns(T::Array[T::Array[T.untyped]]) }
      attr_reader :rows

      sig { params(index: Integer, table_hash: T::Hash[String, T.untyped]).void }
      def initialize(index, table_hash)
        @index = index

        @id = table_hash["TableId"] || raise(ArgumentError, "TableId is required")
        @name = table_hash["TableName"] || raise(ArgumentError, "TableName is required")
        @kind = table_hash["TableKind"] || raise(ArgumentError, "TableKind is required")

        @columns = table_hash["Columns"]&.map { |column_hash| Column.new(column_hash) } || raise(ArgumentError, "Columns is required")
        @rows = table_hash["Rows"] || raise(ArgumentError, "Rows is required")
      end

      sig { returns(T::Boolean) }
      def primary_result?
        kind == "PrimaryResult"
      end
    end
  end
end
