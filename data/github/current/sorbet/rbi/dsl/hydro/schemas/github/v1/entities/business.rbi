# typed: true

# DO NOT EDIT MANUALLY
# This is an autogenerated file for dynamic methods in `Hydro::Schemas::Github::V1::Entities::Business`.
# Please instead update this file by running `bin/tapioca dsl Hydro::Schemas::Github::V1::Entities::Business`.

class Hydro::Schemas::Github::V1::Entities::Business
  sig do
    params(
      created_at: T.nilable(Google::Protobuf::Timestamp),
      customer_id: T.nilable(Integer),
      global_relay_id: T.nilable(String),
      id: T.nilable(Integer),
      shortcode: T.nilable(String),
      slug: T.nilable(String)
    ).void
  end
  def initialize(created_at: nil, customer_id: nil, global_relay_id: nil, id: nil, shortcode: nil, slug: nil); end

  sig { void }
  def clear_created_at; end

  sig { void }
  def clear_customer_id; end

  sig { void }
  def clear_global_relay_id; end

  sig { void }
  def clear_id; end

  sig { void }
  def clear_shortcode; end

  sig { void }
  def clear_slug; end

  sig { returns(T.nilable(Google::Protobuf::Timestamp)) }
  def created_at; end

  sig { params(value: T.nilable(Google::Protobuf::Timestamp)).void }
  def created_at=(value); end

  sig { returns(Integer) }
  def customer_id; end

  sig { params(value: Integer).void }
  def customer_id=(value); end

  sig { returns(String) }
  def global_relay_id; end

  sig { params(value: String).void }
  def global_relay_id=(value); end

  sig { returns(Integer) }
  def id; end

  sig { params(value: Integer).void }
  def id=(value); end

  sig { returns(String) }
  def shortcode; end

  sig { params(value: String).void }
  def shortcode=(value); end

  sig { returns(String) }
  def slug; end

  sig { params(value: String).void }
  def slug=(value); end
end
