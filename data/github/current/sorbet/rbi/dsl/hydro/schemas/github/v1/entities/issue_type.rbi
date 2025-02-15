# typed: true

# DO NOT EDIT MANUALLY
# This is an autogenerated file for dynamic methods in `Hydro::Schemas::Github::V1::Entities::IssueType`.
# Please instead update this file by running `bin/tapioca dsl Hydro::Schemas::Github::V1::Entities::IssueType`.

class Hydro::Schemas::Github::V1::Entities::IssueType
  sig do
    params(
      color: T.nilable(T.any(Symbol, Integer)),
      created_at: T.nilable(Google::Protobuf::Timestamp),
      description: T.nilable(String),
      enabled: T.nilable(T::Boolean),
      global_relay_id: T.nilable(String),
      id: T.nilable(Integer),
      issue_type: T.nilable(T.any(Symbol, Integer)),
      name: T.nilable(String),
      owner_id: T.nilable(Integer),
      private: T.nilable(T::Boolean),
      updated_at: T.nilable(Google::Protobuf::Timestamp)
    ).void
  end
  def initialize(color: nil, created_at: nil, description: nil, enabled: nil, global_relay_id: nil, id: nil, issue_type: nil, name: nil, owner_id: nil, private: nil, updated_at: nil); end

  sig { void }
  def clear_color; end

  sig { void }
  def clear_created_at; end

  sig { void }
  def clear_description; end

  sig { void }
  def clear_enabled; end

  sig { void }
  def clear_global_relay_id; end

  sig { void }
  def clear_id; end

  sig { void }
  def clear_issue_type; end

  sig { void }
  def clear_name; end

  sig { void }
  def clear_owner_id; end

  sig { void }
  def clear_private; end

  sig { void }
  def clear_updated_at; end

  sig { returns(T.any(Symbol, Integer)) }
  def color; end

  sig { params(value: T.any(Symbol, Integer)).void }
  def color=(value); end

  sig { returns(T.nilable(Google::Protobuf::Timestamp)) }
  def created_at; end

  sig { params(value: T.nilable(Google::Protobuf::Timestamp)).void }
  def created_at=(value); end

  sig { returns(String) }
  def description; end

  sig { params(value: String).void }
  def description=(value); end

  sig { returns(T::Boolean) }
  def enabled; end

  sig { params(value: T::Boolean).void }
  def enabled=(value); end

  sig { returns(String) }
  def global_relay_id; end

  sig { params(value: String).void }
  def global_relay_id=(value); end

  sig { returns(Integer) }
  def id; end

  sig { params(value: Integer).void }
  def id=(value); end

  sig { returns(T.any(Symbol, Integer)) }
  def issue_type; end

  sig { params(value: T.any(Symbol, Integer)).void }
  def issue_type=(value); end

  sig { returns(String) }
  def name; end

  sig { params(value: String).void }
  def name=(value); end

  sig { returns(Integer) }
  def owner_id; end

  sig { params(value: Integer).void }
  def owner_id=(value); end

  sig { returns(T::Boolean) }
  def private; end

  sig { params(value: T::Boolean).void }
  def private=(value); end

  sig { returns(T.nilable(Google::Protobuf::Timestamp)) }
  def updated_at; end

  sig { params(value: T.nilable(Google::Protobuf::Timestamp)).void }
  def updated_at=(value); end
end
