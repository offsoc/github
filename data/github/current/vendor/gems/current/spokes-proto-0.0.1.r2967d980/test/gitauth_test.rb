# frozen_string_literal: true

require "minitest/test"

require "spokes-proto"

class GitauthAPITest < Minitest::Test
  Gitauth = GitHub::Spokes::Proto::Gitauth

  def test_host_status
    ok = Gitauth.new_ok_host_status(replica_name: "dgit1", host: "localhost", path: "/a/b/c")
    assert_equal "dgit1", ok.replica_name
    assert_equal "localhost", ok.host
    assert_equal "/a/b/c", ok.path
    assert_equal :ok_result, ok.result

    ok = Gitauth.new_ok_host_status(host: "localhost", path: "/a/b/c")
    assert_equal "", ok.replica_name
    assert_equal "localhost", ok.host
    assert_equal "/a/b/c", ok.path
    assert_equal :ok_result, ok.result

    err = Gitauth.new_error_host_status(host: "localhost", path: "/a/b/c", error: "error: boom")
    assert_equal "", err.replica_name
    assert_equal "localhost", err.host
    assert_equal "/a/b/c", err.path
    assert_equal :error_result, err.result
    assert_equal "error: boom", err.error_result.error_message

    err = Gitauth.new_error_host_status(replica_name: "dgit1", host: "localhost", path: "/a/b/c", error: "error: boom")
    assert_equal "dgit1", err.replica_name
    assert_equal "localhost", err.host
    assert_equal "/a/b/c", err.path
    assert_equal :error_result, err.result
    assert_equal "error: boom", err.error_result.error_message
  end
end
