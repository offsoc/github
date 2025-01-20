# frozen_string_literal: true
require "test_helper"

class GraphQLProRepositoryReloaderTest < Minitest::Test
  include RepositoryHelpers

  def setup
    @new_file_paths = []
  end

  def teardown
    @new_file_paths.each { |f| FileUtils.rm_rf(f) }
  end

  def test_it_reloads_from_path
    repo = get_repo(path: DOCS_PATH)
    res = repo.execute(operation_name: "GetStuff3")
    assert_equal 1, res["errors"].length

    new_operation_path = File.join(DOCS_PATH, "get_stuff_3.graphql")
    @new_file_paths << new_operation_path
    File.write(new_operation_path, "query GetStuff3($intVal: Int = 5) { int(value: $intVal) }")

    reload_repositories

    res = repo.execute(operation_name: "GetStuff3")
    assert_equal({"int" => 5}, res["data"])

    FileUtils.rm_rf(new_operation_path)
    reload_repositories

    res = repo.execute(operation_name: "GetStuff3")
    assert_equal(1, res["errors"].length)
  end

  def test_it_doesnt_leave_zombie_watchers
    # The first repo is defined
    repo = get_repo(path: DOCS_PATH)
    # But then it's redefined
    new_repo = get_repo(path: DOCS_PATH)

    # Write a new file which causes the new repo to update:
    new_operation_path = File.join(DOCS_PATH, "get_stuff_3.graphql")
    @new_file_paths << new_operation_path
    File.write(new_operation_path, "query GetStuff3($intVal: Int = 5) { int(value: $intVal) }")
    reload_repositories

    res = new_repo.execute(operation_name: "GetStuff3")
    assert_equal({"int" => 5}, res["data"])

    # The old repo wasn't reloaded:
    res = repo.execute(operation_name: "GetStuff3")
    assert_equal(1, res["errors"].length)
  end
end
