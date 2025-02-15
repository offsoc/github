# typed: true

# DO NOT EDIT MANUALLY
# This is an autogenerated file for dynamic methods in `MonolithTwirp::Registrymetadata::Core::V1::OauthLogin`.
# Please instead update this file by running `bin/tapioca dsl MonolithTwirp::Registrymetadata::Core::V1::OauthLogin`.

class MonolithTwirp::Registrymetadata::Core::V1::OauthLogin
  sig do
    params(
      scopes: T.nilable(T.any(Google::Protobuf::RepeatedField[String], T::Array[String])),
      user_id: T.nilable(Integer),
      user_name: T.nilable(String)
    ).void
  end
  def initialize(scopes: T.unsafe(nil), user_id: nil, user_name: nil); end

  sig { void }
  def clear_scopes; end

  sig { void }
  def clear_user_id; end

  sig { void }
  def clear_user_name; end

  sig { returns(Google::Protobuf::RepeatedField[String]) }
  def scopes; end

  sig { params(value: Google::Protobuf::RepeatedField[String]).void }
  def scopes=(value); end

  sig { returns(Integer) }
  def user_id; end

  sig { params(value: Integer).void }
  def user_id=(value); end

  sig { returns(String) }
  def user_name; end

  sig { params(value: String).void }
  def user_name=(value); end
end
