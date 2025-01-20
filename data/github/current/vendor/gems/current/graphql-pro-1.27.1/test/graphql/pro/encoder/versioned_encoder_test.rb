# frozen_string_literal: true
require "test_helper"

class GraphQLProEncoderVersionedEncoderTest < Minitest::Test
  class Enc3 < GraphQL::Pro::Encoder
    key("6684ccd3071cebf4")
  end

  class Enc2 < GraphQL::Pro::Encoder
    key("79dd3081ce51c307")
  end

  class Enc1 < GraphQL::Pro::Encoder
    cipher(nil)
    tag("9077792")
  end

  VersionedEnc = GraphQL::Pro::Encoder.versioned(
    Enc3,
    Enc2,
    Enc1
  )

  def test_it_encodes_with_the_latest_version
    assert_equal VersionedEnc.encode("Top Secret"), Enc3.encode("Top Secret")
  end

  def test_it_decodes_with_any_version
    enc_enc_1 = Enc1.encode("Abcd")
    enc_enc_2 = Enc2.encode("Abcd")
    enc_enc_3 = Enc3.encode("Abcd")

    # They're all different
    assert_equal 3, [enc_enc_1, enc_enc_2, enc_enc_3].uniq.size

    assert_equal "Abcd", VersionedEnc.decode(enc_enc_1)
    assert_equal "Abcd", VersionedEnc.decode(enc_enc_2)
    assert_equal "Abcd", VersionedEnc.decode(enc_enc_3)
    assert_equal GraphQL::Pro::Encoder::DECODE_FAILED, VersionedEnc.decode("nonsense")

    assert_equal ["Abcd", Enc1], VersionedEnc.versioned_decode(enc_enc_1)
    assert_equal ["Abcd", Enc2], VersionedEnc.versioned_decode(enc_enc_2)
    assert_equal ["Abcd", Enc3], VersionedEnc.versioned_decode(enc_enc_3)
    assert_equal [GraphQL::Pro::Encoder::DECODE_FAILED, nil], VersionedEnc.versioned_decode("nonsense")
  end

  def test_it_can_use_tagless_encs
    enc_1 = Class.new(GraphQL::Pro::Encoder) {
      cipher(nil)
    }

    enc_2 = Class.new(GraphQL::Pro::Encoder) {
      cipher(nil)
      tag("v2")
    }

    versioned_enc = GraphQL::Pro::Encoder.versioned(enc_2, enc_1)

    enc_data_1 = enc_1.encode("Xyz!")
    enc_data_2 = enc_2.encode("Xyz!")

    refute_equal enc_data_1, enc_data_2
    assert_equal "Xyz!", versioned_enc.decode(enc_data_1)
    assert_equal "Xyz!", versioned_enc.decode(enc_data_2)
    assert_equal ["Xyz!", enc_1], versioned_enc.versioned_decode(enc_data_1)
    assert_equal ["Xyz!", enc_2], versioned_enc.versioned_decode(enc_data_2)
    # Plain base64 can't determine whether it was successful or not
    # so you just get garbage:
    assert_instance_of String, versioned_enc.decode("nonsense")
  end
end
