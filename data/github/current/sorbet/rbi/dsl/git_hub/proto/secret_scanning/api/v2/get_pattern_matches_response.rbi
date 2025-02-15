# typed: true

# DO NOT EDIT MANUALLY
# This is an autogenerated file for dynamic methods in `GitHub::Proto::SecretScanning::Api::V2::GetPatternMatchesResponse`.
# Please instead update this file by running `bin/tapioca dsl GitHub::Proto::SecretScanning::Api::V2::GetPatternMatchesResponse`.

class GitHub::Proto::SecretScanning::Api::V2::GetPatternMatchesResponse
  sig do
    params(
      error: T.nilable(GitHub::Proto::SecretScanning::Api::V2::CustomPatternError),
      pattern_matches: T.nilable(T.any(Google::Protobuf::RepeatedField[GitHub::Proto::SecretScanning::Api::V2::PatternMatch], T::Array[GitHub::Proto::SecretScanning::Api::V2::PatternMatch])),
      warning: T.nilable(GitHub::Proto::SecretScanning::Api::V2::CustomPatternWarning)
    ).void
  end
  def initialize(error: nil, pattern_matches: T.unsafe(nil), warning: nil); end

  sig { void }
  def clear_error; end

  sig { void }
  def clear_pattern_matches; end

  sig { void }
  def clear_warning; end

  sig { returns(T.nilable(GitHub::Proto::SecretScanning::Api::V2::CustomPatternError)) }
  def error; end

  sig { params(value: T.nilable(GitHub::Proto::SecretScanning::Api::V2::CustomPatternError)).void }
  def error=(value); end

  sig { returns(Google::Protobuf::RepeatedField[GitHub::Proto::SecretScanning::Api::V2::PatternMatch]) }
  def pattern_matches; end

  sig { params(value: Google::Protobuf::RepeatedField[GitHub::Proto::SecretScanning::Api::V2::PatternMatch]).void }
  def pattern_matches=(value); end

  sig { returns(T.nilable(GitHub::Proto::SecretScanning::Api::V2::CustomPatternWarning)) }
  def warning; end

  sig { params(value: T.nilable(GitHub::Proto::SecretScanning::Api::V2::CustomPatternWarning)).void }
  def warning=(value); end
end
