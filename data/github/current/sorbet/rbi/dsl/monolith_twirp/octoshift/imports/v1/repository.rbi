# typed: true

# DO NOT EDIT MANUALLY
# This is an autogenerated file for dynamic methods in `MonolithTwirp::Octoshift::Imports::V1::Repository`.
# Please instead update this file by running `bin/tapioca dsl MonolithTwirp::Octoshift::Imports::V1::Repository`.

class MonolithTwirp::Octoshift::Imports::V1::Repository
  sig do
    params(
      default_branch: T.nilable(String),
      general_setting_errors: T.nilable(T.any(Google::Protobuf::RepeatedField[String], T::Array[String])),
      http_url: T.nilable(String),
      id: T.nilable(Integer),
      is_archived: T.nilable(T::Boolean),
      is_deleted: T.nilable(T::Boolean),
      name: T.nilable(String),
      owner_id: T.nilable(Integer),
      page_error_message: T.nilable(String),
      security_setting_errors: T.nilable(T.any(Google::Protobuf::RepeatedField[String], T::Array[String])),
      ssh_push_url: T.nilable(String),
      visibility: T.nilable(T.any(Symbol, Integer)),
      wiki_http_url: T.nilable(Google::Protobuf::StringValue),
      wiki_ssh_url: T.nilable(Google::Protobuf::StringValue)
    ).void
  end
  def initialize(default_branch: nil, general_setting_errors: T.unsafe(nil), http_url: nil, id: nil, is_archived: nil, is_deleted: nil, name: nil, owner_id: nil, page_error_message: nil, security_setting_errors: T.unsafe(nil), ssh_push_url: nil, visibility: nil, wiki_http_url: nil, wiki_ssh_url: nil); end

  sig { void }
  def clear_default_branch; end

  sig { void }
  def clear_general_setting_errors; end

  sig { void }
  def clear_http_url; end

  sig { void }
  def clear_id; end

  sig { void }
  def clear_is_archived; end

  sig { void }
  def clear_is_deleted; end

  sig { void }
  def clear_name; end

  sig { void }
  def clear_owner_id; end

  sig { void }
  def clear_page_error_message; end

  sig { void }
  def clear_security_setting_errors; end

  sig { void }
  def clear_ssh_push_url; end

  sig { void }
  def clear_visibility; end

  sig { void }
  def clear_wiki_http_url; end

  sig { void }
  def clear_wiki_ssh_url; end

  sig { returns(String) }
  def default_branch; end

  sig { params(value: String).void }
  def default_branch=(value); end

  sig { returns(Google::Protobuf::RepeatedField[String]) }
  def general_setting_errors; end

  sig { params(value: Google::Protobuf::RepeatedField[String]).void }
  def general_setting_errors=(value); end

  sig { returns(String) }
  def http_url; end

  sig { params(value: String).void }
  def http_url=(value); end

  sig { returns(Integer) }
  def id; end

  sig { params(value: Integer).void }
  def id=(value); end

  sig { returns(T::Boolean) }
  def is_archived; end

  sig { params(value: T::Boolean).void }
  def is_archived=(value); end

  sig { returns(T::Boolean) }
  def is_deleted; end

  sig { params(value: T::Boolean).void }
  def is_deleted=(value); end

  sig { returns(String) }
  def name; end

  sig { params(value: String).void }
  def name=(value); end

  sig { returns(Integer) }
  def owner_id; end

  sig { params(value: Integer).void }
  def owner_id=(value); end

  sig { returns(String) }
  def page_error_message; end

  sig { params(value: String).void }
  def page_error_message=(value); end

  sig { returns(Google::Protobuf::RepeatedField[String]) }
  def security_setting_errors; end

  sig { params(value: Google::Protobuf::RepeatedField[String]).void }
  def security_setting_errors=(value); end

  sig { returns(String) }
  def ssh_push_url; end

  sig { params(value: String).void }
  def ssh_push_url=(value); end

  sig { returns(T.any(Symbol, Integer)) }
  def visibility; end

  sig { params(value: T.any(Symbol, Integer)).void }
  def visibility=(value); end

  sig { returns(T.nilable(Google::Protobuf::StringValue)) }
  def wiki_http_url; end

  sig { params(value: T.nilable(Google::Protobuf::StringValue)).void }
  def wiki_http_url=(value); end

  sig { returns(T.nilable(Google::Protobuf::StringValue)) }
  def wiki_ssh_url; end

  sig { params(value: T.nilable(Google::Protobuf::StringValue)).void }
  def wiki_ssh_url=(value); end
end
