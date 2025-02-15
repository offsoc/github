# typed: true

# DO NOT EDIT MANUALLY
# This is an autogenerated file for dynamic methods in `Hydro::Schemas::Github::Feeds::V0::Entities::UserPostReference`.
# Please instead update this file by running `bin/tapioca dsl Hydro::Schemas::Github::Feeds::V0::Entities::UserPostReference`.

class Hydro::Schemas::Github::Feeds::V0::Entities::UserPostReference
  sig do
    params(
      created_at: T.nilable(Google::Protobuf::Timestamp),
      reference_action: T.nilable(T.any(Symbol, Integer)),
      reference_object_id: T.nilable(Integer),
      reference_object_type: T.nilable(T.any(Symbol, Integer)),
      updated_at: T.nilable(Google::Protobuf::Timestamp),
      user_post_id: T.nilable(Integer)
    ).void
  end
  def initialize(created_at: nil, reference_action: nil, reference_object_id: nil, reference_object_type: nil, updated_at: nil, user_post_id: nil); end

  sig { void }
  def clear_created_at; end

  sig { void }
  def clear_reference_action; end

  sig { void }
  def clear_reference_object_id; end

  sig { void }
  def clear_reference_object_type; end

  sig { void }
  def clear_updated_at; end

  sig { void }
  def clear_user_post_id; end

  sig { returns(T.nilable(Google::Protobuf::Timestamp)) }
  def created_at; end

  sig { params(value: T.nilable(Google::Protobuf::Timestamp)).void }
  def created_at=(value); end

  sig { returns(T.any(Symbol, Integer)) }
  def reference_action; end

  sig { params(value: T.any(Symbol, Integer)).void }
  def reference_action=(value); end

  sig { returns(Integer) }
  def reference_object_id; end

  sig { params(value: Integer).void }
  def reference_object_id=(value); end

  sig { returns(T.any(Symbol, Integer)) }
  def reference_object_type; end

  sig { params(value: T.any(Symbol, Integer)).void }
  def reference_object_type=(value); end

  sig { returns(T.nilable(Google::Protobuf::Timestamp)) }
  def updated_at; end

  sig { params(value: T.nilable(Google::Protobuf::Timestamp)).void }
  def updated_at=(value); end

  sig { returns(Integer) }
  def user_post_id; end

  sig { params(value: Integer).void }
  def user_post_id=(value); end
end
