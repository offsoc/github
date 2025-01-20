# frozen_string_literal: true
require "test_helper"

class GraphQLProEncoderNullCipherTest < Minitest::Test
  def test_it_encrypts_and_decrypts
    test_enc = Class.new(GraphQL::Pro::Encoder) do
      cipher(nil)
    end

    encrypted_id = test_enc.encode("Person/1")

    decrypted_contents = test_enc.decode(encrypted_id)
    assert_equal "Person/1", decrypted_contents
    assert_equal "UGVyc29uLzE", encrypted_id
  end
end
