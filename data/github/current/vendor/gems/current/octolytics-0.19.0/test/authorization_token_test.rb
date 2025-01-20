require 'helper'
require 'octolytics/authorization_token'

module Octolytics
  class AuthorizationTokenTest < Minitest::Test
    def test_generating_an_authorization_token
      token = AuthorizationToken.new("s1cr3t")

      str = token.generate(Time.utc(2013, 8, 5), foo: "bar")
      assert_equal "eyJmb28iOiJiYXIiLCJleHBpcmVzX2F0IjoxMzc1NjYwODAwfQ==--d05cc77499f6ed7de61eeba142e65996a8e7f189",
                   str
    end

    def test_stringifies_values
      token = AuthorizationToken.new("s1cr3t")

      str = token.generate(Time.utc(2013, 8, 5), foo: 1234)
      assert_equal "eyJmb28iOiIxMjM0IiwiZXhwaXJlc19hdCI6MTM3NTY2MDgwMH0=--735dadd432aa60a743286277f449b8c9cd0d42d1",
                   str
    end

    def test_verifies_authorization_token_matches_parameters
      token = AuthorizationToken.new('secr3t')
      str = "eyJkaW1lbnNpb24iOiJyZXBvc2l0b3J5X2lkIiwiZGltZW5zaW9uX2lkIjoxLCJleHBpcmVzX2F0IjoxMzc3OTA3MjAwfQ==--80a0ee29406b4b0a5de0ec209250de8a59ca8082"

      now = Time.utc(2013, 8, 30)
      assert token.verify(str, { :dimension => 'repository_id', :dimension_id => 1 }, now)
      refute token.verify(str, { :dimension => 'repository_id', :dimension_id => 2 }, now)
    end

    def test_verifies_nil_token
      token = AuthorizationToken.new('secr3t')
      refute token.verify(nil, { :dimension => 'repository_id', :dimension_id => 2 })
    end

    def test_verifies_invalid_token
      token = AuthorizationToken.new('secr3t')

      refute token.verify("INVALID--abc123", { :dimension => 'repository_id', :dimension_id => 1 })
      refute token.verify("--", { :dimension => 'repository_id', :dimension_id => 1 })
      refute token.verify("", { :dimension => 'repository_id', :dimension_id => 1 })
    end

    def test_verifies_expired_token
      token = AuthorizationToken.new('secr3t')
      str = "eyJkaW1lbnNpb24iOiJyZXBvc2l0b3J5X2lkIiwiZGltZW5zaW9uX2lkIjoxLCJleHBpcmVzX2F0IjoxMzc3OTA3MjAwfQ==--80a0ee29406b4b0a5de0ec209250de8a59ca8082"

      now = Time.utc(2013, 9, 1)
      refute token.verify(str, { :dimension => 'repository_id', :dimension_id => 1 }, now)
    end
  end
end
