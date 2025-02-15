# typed: true

# DO NOT EDIT MANUALLY
# This is an autogenerated file for dynamic methods in `Hydro::Schemas::Github::V1::Entities::App`.
# Please instead update this file by running `bin/tapioca dsl Hydro::Schemas::Github::V1::Entities::App`.

class Hydro::Schemas::Github::V1::Entities::App
  sig do
    params(
      app_type: T.nilable(T.any(Symbol, Integer)),
      callback_url: T.nilable(String),
      callback_urls: T.nilable(T.any(Google::Protobuf::RepeatedField[String], T::Array[String])),
      created_at: T.nilable(Google::Protobuf::Timestamp),
      description: T.nilable(String),
      domain: T.nilable(String),
      global_relay_id: T.nilable(String),
      id: T.nilable(Integer),
      integration_bot_id: T.nilable(Integer),
      integration_is_public: T.nilable(T::Boolean),
      name: T.nilable(String),
      owner_id: T.nilable(Integer),
      slug: T.nilable(String),
      url: T.nilable(String)
    ).void
  end
  def initialize(app_type: nil, callback_url: nil, callback_urls: T.unsafe(nil), created_at: nil, description: nil, domain: nil, global_relay_id: nil, id: nil, integration_bot_id: nil, integration_is_public: nil, name: nil, owner_id: nil, slug: nil, url: nil); end

  sig { returns(T.any(Symbol, Integer)) }
  def app_type; end

  sig { params(value: T.any(Symbol, Integer)).void }
  def app_type=(value); end

  sig { returns(String) }
  def callback_url; end

  sig { params(value: String).void }
  def callback_url=(value); end

  sig { returns(Google::Protobuf::RepeatedField[String]) }
  def callback_urls; end

  sig { params(value: Google::Protobuf::RepeatedField[String]).void }
  def callback_urls=(value); end

  sig { void }
  def clear_app_type; end

  sig { void }
  def clear_callback_url; end

  sig { void }
  def clear_callback_urls; end

  sig { void }
  def clear_created_at; end

  sig { void }
  def clear_description; end

  sig { void }
  def clear_domain; end

  sig { void }
  def clear_global_relay_id; end

  sig { void }
  def clear_id; end

  sig { void }
  def clear_integration_bot_id; end

  sig { void }
  def clear_integration_is_public; end

  sig { void }
  def clear_name; end

  sig { void }
  def clear_owner_id; end

  sig { void }
  def clear_slug; end

  sig { void }
  def clear_url; end

  sig { returns(T.nilable(Google::Protobuf::Timestamp)) }
  def created_at; end

  sig { params(value: T.nilable(Google::Protobuf::Timestamp)).void }
  def created_at=(value); end

  sig { returns(String) }
  def description; end

  sig { params(value: String).void }
  def description=(value); end

  sig { returns(String) }
  def domain; end

  sig { params(value: String).void }
  def domain=(value); end

  sig { returns(String) }
  def global_relay_id; end

  sig { params(value: String).void }
  def global_relay_id=(value); end

  sig { returns(Integer) }
  def id; end

  sig { params(value: Integer).void }
  def id=(value); end

  sig { returns(Integer) }
  def integration_bot_id; end

  sig { params(value: Integer).void }
  def integration_bot_id=(value); end

  sig { returns(T::Boolean) }
  def integration_is_public; end

  sig { params(value: T::Boolean).void }
  def integration_is_public=(value); end

  sig { returns(String) }
  def name; end

  sig { params(value: String).void }
  def name=(value); end

  sig { returns(Integer) }
  def owner_id; end

  sig { params(value: Integer).void }
  def owner_id=(value); end

  sig { returns(String) }
  def slug; end

  sig { params(value: String).void }
  def slug=(value); end

  sig { returns(String) }
  def url; end

  sig { params(value: String).void }
  def url=(value); end
end
