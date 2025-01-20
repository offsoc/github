# frozen_string_literal: true

require "minitest/test"

require "spokes-proto"

class SpokesProtoTypesTest < Minitest::Test
  Types = GitHub::Spokes::Proto::Types

  def test_repository_types
    repo = Types.new_repository(1)
    assert_equal 1, repo.id
    assert_equal :TYPE_REPOSITORY, repo.type

    gist = Types.new_gist(1)
    assert_equal 1, gist.id
    assert_equal :TYPE_GIST, gist.type

    wiki = Types.new_wiki(1)
    assert_equal 1, wiki.id
    assert_equal :TYPE_WIKI, wiki.type
  end
end
