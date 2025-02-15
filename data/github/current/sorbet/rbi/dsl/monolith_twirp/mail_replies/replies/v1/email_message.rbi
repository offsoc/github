# typed: true

# DO NOT EDIT MANUALLY
# This is an autogenerated file for dynamic methods in `MonolithTwirp::MailReplies::Replies::V1::EmailMessage`.
# Please instead update this file by running `bin/tapioca dsl MonolithTwirp::MailReplies::Replies::V1::EmailMessage`.

class MonolithTwirp::MailReplies::Replies::V1::EmailMessage
  sig do
    params(
      body: T.nilable(String),
      cc: T.nilable(T.any(Google::Protobuf::RepeatedField[MonolithTwirp::MailReplies::Replies::V1::Address], T::Array[MonolithTwirp::MailReplies::Replies::V1::Address])),
      from: T.nilable(T.any(Google::Protobuf::RepeatedField[MonolithTwirp::MailReplies::Replies::V1::Address], T::Array[MonolithTwirp::MailReplies::Replies::V1::Address])),
      headers: T.nilable(T.any(Google::Protobuf::Map[String, String], T::Hash[String, String])),
      html: T.nilable(String),
      reply_code: T.nilable(String),
      subject: T.nilable(String),
      to: T.nilable(T.any(Google::Protobuf::RepeatedField[MonolithTwirp::MailReplies::Replies::V1::Address], T::Array[MonolithTwirp::MailReplies::Replies::V1::Address]))
    ).void
  end
  def initialize(body: nil, cc: T.unsafe(nil), from: T.unsafe(nil), headers: T.unsafe(nil), html: nil, reply_code: nil, subject: nil, to: T.unsafe(nil)); end

  sig { returns(String) }
  def body; end

  sig { params(value: String).void }
  def body=(value); end

  sig { returns(Google::Protobuf::RepeatedField[MonolithTwirp::MailReplies::Replies::V1::Address]) }
  def cc; end

  sig { params(value: Google::Protobuf::RepeatedField[MonolithTwirp::MailReplies::Replies::V1::Address]).void }
  def cc=(value); end

  sig { void }
  def clear_body; end

  sig { void }
  def clear_cc; end

  sig { void }
  def clear_from; end

  sig { void }
  def clear_headers; end

  sig { void }
  def clear_html; end

  sig { void }
  def clear_reply_code; end

  sig { void }
  def clear_subject; end

  sig { void }
  def clear_to; end

  sig { returns(Google::Protobuf::RepeatedField[MonolithTwirp::MailReplies::Replies::V1::Address]) }
  def from; end

  sig { params(value: Google::Protobuf::RepeatedField[MonolithTwirp::MailReplies::Replies::V1::Address]).void }
  def from=(value); end

  sig { returns(Google::Protobuf::Map[String, String]) }
  def headers; end

  sig { params(value: Google::Protobuf::Map[String, String]).void }
  def headers=(value); end

  sig { returns(String) }
  def html; end

  sig { params(value: String).void }
  def html=(value); end

  sig { returns(String) }
  def reply_code; end

  sig { params(value: String).void }
  def reply_code=(value); end

  sig { returns(String) }
  def subject; end

  sig { params(value: String).void }
  def subject=(value); end

  sig { returns(Google::Protobuf::RepeatedField[MonolithTwirp::MailReplies::Replies::V1::Address]) }
  def to; end

  sig { params(value: Google::Protobuf::RepeatedField[MonolithTwirp::MailReplies::Replies::V1::Address]).void }
  def to=(value); end
end
