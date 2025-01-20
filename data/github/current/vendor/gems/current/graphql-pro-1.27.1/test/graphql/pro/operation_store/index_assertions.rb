# frozen_string_literal: true
require "test_helper"

module OperationStoreIndexAssertions
  include OperationStoreHelpers

  def get_entry(k)
    @store.index.get_entry(k)
  end

  def clear_index
    @store.index.purge
  end

  def reindex
    @store.reindex
  end

  def has_entry?(name)
    matching_entries = @store.all_index_entries(search_term: name, page: 1, per_page: 100).items
    exact_entries = matching_entries.select { |e| e.name == name }
    exact_entries.size > 0
  end

  def test_it_writes_to_the_database
    init_clients("index-0") do
      clear_index
      @store.add(body: "query IndexTypename { __typename }", client_name: "index-0", operation_alias: "IndexTypename")
      assert has_entry?("Query")
    end
  ensure
    reindex
  end

  def test_it_records_schema_members
    clear_index
    added_entries = [
      "Artist",
      "Artist.name",
      "Printable.printings",
      "Color",
      "Card.printings",
      "PrintableInput.name",
      "Printing",
      "Query.printable.printableInput",
      "Rarity",
      "Rarity.MYTHIC_RARE",
      "Rarity.UNCOMMON",
      "Rarity.COMMON",
    ]

    added_entries.each { |e|
      refute has_entry?(e), "#{e} is not present at first"
    }

    doc = <<-GRAPHQL
      query GetShadowmoor {
        printable(printableInput: { name: "Shadowmoor" }) {
          m_r: printings(rarity: MYTHIC_RARE) {
            artist { name }
            card { colors }
          }
          uc: printings(rarity: [UNCOMMON, COMMON]) {
            artist { name }
          }
        }
      }
    GRAPHQL

    init_clients("index-1") do
      @store.add(body: doc, operation_alias: "x", client_name: "index-1")

      added_entries.each { |e|
        assert has_entry?(e), "#{e} is added by the doc"
      }
    end
  ensure
    reindex
  end

  def test_it_indexes_variable_types
    init_clients("index-2") do

      clear_index
      refute has_entry?("PrintableInput")

      doc = <<-GRAPHQL
        query GetShadowmoor($input: PrintableInput!) {
          printable(printableInput: $input) {
            __typename
          }
        }
      GRAPHQL

      @store.add(body: doc, operation_alias: "x", client_name: "index-2")

      assert has_entry?("PrintableInput")
    end
  ensure
    reindex
  end

  def test_it_indexes_fragment_types
    clear_index
    added_entries = [
      "Anything",
      "Artist",
      "Card",
      "Person",
      "Printable",
    ]

    not_added_entries = [
      "Expansion",
    ]

    added_entries.each { |e| refute has_entry?(e) }
    not_added_entries.each { |e| refute has_entry?(e) }

    doc = <<-GRAPHQL
      query GetAnything {
        anything(id: "1") {
          ... on Printable {
            ... on Card {
              name
            }
          }

          ...PersonFields
        }
      }

      fragment PersonFields on Person {
        ... on Artist {
          name
        }
      }
    GRAPHQL
    init_clients("index-3") do
      @store.add(body: doc, operation_alias: "x", client_name: "index-3")

      added_entries.each { |e| assert(has_entry?(e), "#{e} is present") }
      not_added_entries.each { |e| refute has_entry?(e) }
    end
  ensure
    reindex
  end

  def test_it_can_reindex
    total_operations = operation_count

    clear_index
    refs = @store.index.get_entry_references("Query")
    assert_equal 0, refs.count

    reindex
    refs = @store.index.get_entry_references("Query")
    assert_equal total_operations, refs.count
  end

  def build_chain(name)
    @store.index.index_entry_chain(name)
  end

  def test_it_knows_chain
    assert_equal ["Query"], build_chain("Query")
    assert_equal ["Query", "Query.card"], build_chain("Query.card")
    assert_equal ["Query", "Query.card", "Query.card.id"], build_chain("Query.card.id")
    assert_raises(RuntimeError) {
      build_chain("Query.card.id.wtf")
    }
  end
end
