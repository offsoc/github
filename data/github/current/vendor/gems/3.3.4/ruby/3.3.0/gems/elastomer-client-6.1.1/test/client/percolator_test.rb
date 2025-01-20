# frozen_string_literal: true

require_relative "../test_helper"

describe ElastomerClient::Client::Percolator do

  before do
    if $client.version_support.es_version_8_plus?
      skip "Percolate not supported in ES version #{$client.version}"
    end

    @index = $client.index "elastomer-percolator-test"
    @index.delete if @index.exists?
    @docs = @index.docs("docs")
  end

  after do
    @index.delete if @index.exists?
  end

  describe "when an index exists" do
    before do
      base_mappings = { mappings: { percolator: { properties: { query: { type: "percolator" } } } } }

      @index.create(base_mappings)
      wait_for_index(@index.name)
    end

    it "creates a query" do
      percolator = @index.percolator "1"
      response = percolator.create query: { match_all: { } }

      assert response["created"], "Couldn't create the percolator query"
    end

    it "gets a query" do
      percolator = @index.percolator "1"
      percolator.create query: { match_all: { } }
      response = percolator.get

      assert response["found"], "Couldn't find the percolator query"
    end

    it "deletes a query" do
      percolator = @index.percolator "1"
      percolator.create query: { match_all: { } }
      response = percolator.delete

      assert response["found"], "Couldn't find the percolator query"
    end

    it "checks for the existence of a query" do
      percolator = @index.percolator "1"

      refute_predicate percolator, :exists?, "Percolator query exists"
      percolator.create query: { match_all: { } }

      assert_predicate percolator, :exists?, "Percolator query does not exist"
    end

    it "cannot delete all percolators by providing a nil id" do
      assert_raises(ArgumentError) { @index.percolator nil }
    end
  end
end
