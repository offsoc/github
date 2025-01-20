# frozen_string_literal: true
require "test_helper"

class GraphQLProEncoderOpenSSLCipherTest < Minitest::Test
  def test_it_applies_the_key
    test_enc_1 = Class.new(GraphQL::Pro::Encoder) do
      key("79dd3081ce51c307")
    end

    test_enc_2 = Class.new(GraphQL::Pro::Encoder) do
      key("6684ccd3071cebf4")
    end

    data_string = "Here is some data"
    encrypted_id_1 = test_enc_1.encode(data_string)
    encrypted_id_2 = test_enc_2.encode(data_string)

    refute_equal encrypted_id_1, encrypted_id_2
    assert_equal "Here is some data", test_enc_1.decode(encrypted_id_1)
    assert_equal "Here is some data", test_enc_2.decode(encrypted_id_2)

    assert_decode_failed(test_enc_2, encrypted_id_1)
    assert_decode_failed(test_enc_1, encrypted_id_2)
  end

  def test_it_handles_short_input
    test_enc = Class.new(GraphQL::Pro::Encoder) do
      key("aa6c877091333929")
      encoder(GraphQL::Pro::Encoder::UrlSafeBase64Encoder)
    end
    assert_decode_failed(test_enc, "abcd")
    assert_decode_failed(test_enc, "UXVlc3Q6OlRpY2tldC02NTE=")
    assert_decode_failed(test_enc, "UXVlc3Q6OlRpY2tldC02NQ==")
    assert_decode_failed(test_enc, "VmlzaXQtNjU=")
  end

  def test_it_applies_the_nonce
    test_enc = Class.new(GraphQL::Pro::Encoder) do
      key("f38960f3825f411f")
    end

    data_string = "🔔 ding!"
    encrypted_id_1 = test_enc.encode(data_string, nonce: true)
    encrypted_id_2 = test_enc.encode(data_string, nonce: true)

    # They aren't the same, but they go to the same value
    refute_equal encrypted_id_1, encrypted_id_2
    assert_equal "🔔 ding!", test_enc.decode(encrypted_id_1, nonce: true).force_encoding("utf-8")
    assert_equal "🔔 ding!", test_enc.decode(encrypted_id_2, nonce: true).force_encoding("utf-8")
  end

  def test_it_authenticates_without_nonce
    test_enc = Class.new(GraphQL::Pro::Encoder) do
      key("f38960f3825f411f")
    end

    data_string = "ᕙ༼=ݓ益ݓ=༽ᕗ"
    encrypted_id_1 = test_enc.encode(data_string)
    encrypted_id_2 = test_enc.encode(data_string)

    assert_equal encrypted_id_1, encrypted_id_2
    assert_equal "ᕙ༼=ݓ益ݓ=༽ᕗ", test_enc.decode(encrypted_id_1).force_encoding("utf-8")
    assert_equal "ᕙ༼=ݓ益ݓ=༽ᕗ", test_enc.decode(encrypted_id_2).force_encoding("utf-8")
  end

  def test_it_applies_the_tag
    key = "79dd3081ce51c307"
    test_enc_1 = Class.new(GraphQL::Pro::Encoder) do
      tag("v1")
      key(key)
    end

    test_enc_2 = Class.new(GraphQL::Pro::Encoder) do
      tag("v2")
      key(key)
    end

    data_string = "__data__ 🍆"
    encrypted_id_1 = test_enc_1.encode(data_string)
    encrypted_id_2 = test_enc_2.encode(data_string)

    refute_equal encrypted_id_1, encrypted_id_2
    assert_equal "__data__ 🍆", test_enc_1.decode(encrypted_id_1).force_encoding("UTF-8")
    assert_equal "__data__ 🍆", test_enc_2.decode(encrypted_id_2).force_encoding("UTF-8")

    assert_decode_failed(test_enc_2, encrypted_id_1)
    assert_decode_failed(test_enc_1, encrypted_id_2)
  end

  def test_it_supports_a_bunch_of_ciphers
    assert_functioning_cipher("aes-128-gcm")
    assert_functioning_cipher("aes-256-gcm", encoder_key: "79dd3081ce51c30779dd3081ce51c307")
    assert_functioning_cipher("aes-128-cbc")
    assert_functioning_cipher("aes-256-cbc", encoder_key: "79dd3081ce51c30779dd3081ce51c307")
  end

  def assert_functioning_cipher(cipher_name, encoder_key: "79dd3081ce51c307")
    test_enc = Class.new(GraphQL::Pro::Encoder) do
      cipher(cipher_name)
      key(encoder_key)
    end

    data_string = "__data__ 🍆"

    encrypted_id = test_enc.encode(data_string)
    assert_equal "__data__ 🍆", test_enc.decode(encrypted_id).force_encoding("UTF-8")

    encrypted_id = test_enc.encode(data_string, nonce: true)
    assert_equal "__data__ 🍆", test_enc.decode(encrypted_id, nonce: true).force_encoding("UTF-8")

    test_tagged_enc_1 = Class.new(GraphQL::Pro::Encoder) do
      cipher(cipher_name)
      tag("79dd3081ce")
      key(encoder_key)
    end

    test_tagged_enc_2 = Class.new(GraphQL::Pro::Encoder) do
      cipher(cipher_name)
      tag("c3079077")
      key(encoder_key)
    end

    encrypted_id_1 = test_tagged_enc_1.encode(data_string)
    encrypted_id_2 = test_tagged_enc_2.encode(data_string)

    refute_equal encrypted_id_1, encrypted_id_2
    assert_equal "__data__ 🍆", test_tagged_enc_1.decode(encrypted_id_1).force_encoding("UTF-8")
    assert_equal "__data__ 🍆", test_tagged_enc_2.decode(encrypted_id_2).force_encoding("UTF-8")

    assert_decode_failed(test_tagged_enc_2, encrypted_id_1)
    assert_decode_failed(test_tagged_enc_1, encrypted_id_2)
  end

  def assert_decode_failed(encoder, input)
    assert_equal(
      GraphQL::Pro::Encoder::DECODE_FAILED,
      encoder.decode(input)
    )
  end
end
