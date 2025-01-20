# typed: true
# frozen_string_literal: true

require "kusto/data/table"

module Kusto
  module Data
    class Dataset
      extend T::Sig

      sig { returns(T::Array[Table]) }
      attr_reader :tables

      sig { params(frame_hashes: T::Array[T::Hash[String, T.untyped]]).void }
      def initialize(frame_hashes)
        @tables = frame_hashes
          .select { |hash| hash["FrameType"] == "DataTable" }
          .each_with_index.map { |table_hash, index| Table.new(index, table_hash) }
      end

      sig { returns(T::Array[Table]) }
      def primary_result_tables
        @tables.select(&:primary_result?)
      end

      sig { returns(Table) }
      def primary_result_table
        T.must(primary_result_tables.first)
      end
    end
  end
end
