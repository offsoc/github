# typed: true

# DO NOT EDIT MANUALLY
# This is an autogenerated file for dynamic methods in `Hydro::Schemas::Github::Permissions::V0::Created`.
# Please instead update this file by running `bin/tapioca dsl Hydro::Schemas::Github::Permissions::V0::Created`.

class Hydro::Schemas::Github::Permissions::V0::Created
  sig do
    params(
      actor_id: T.nilable(Integer),
      actor_type: T.nilable(T.any(Symbol, Integer)),
      digest: T.nilable(String),
      entry_point: T.nilable(String),
      operation_id: T.nilable(String),
      owner_id: T.nilable(Integer),
      owner_name: T.nilable(String),
      owner_type: T.nilable(T.any(Symbol, Integer)),
      parent_installation_id: T.nilable(Integer),
      request_context: T.nilable(Hydro::Schemas::Github::V1::Entities::RequestContext),
      scope_type: T.nilable(T.any(Symbol, Integer)),
      subject_type: T.nilable(T.any(Symbol, Integer)),
      subject_type_total: T.nilable(T.any(Google::Protobuf::Map[String, Integer], T::Hash[String, Integer])),
      target_id: T.nilable(Integer),
      target_type: T.nilable(T.any(Symbol, Integer)),
      total: T.nilable(Integer),
      write_type: T.nilable(T.any(Symbol, Integer))
    ).void
  end
  def initialize(actor_id: nil, actor_type: nil, digest: nil, entry_point: nil, operation_id: nil, owner_id: nil, owner_name: nil, owner_type: nil, parent_installation_id: nil, request_context: nil, scope_type: nil, subject_type: nil, subject_type_total: T.unsafe(nil), target_id: nil, target_type: nil, total: nil, write_type: nil); end

  sig { returns(Integer) }
  def actor_id; end

  sig { params(value: Integer).void }
  def actor_id=(value); end

  sig { returns(T.any(Symbol, Integer)) }
  def actor_type; end

  sig { params(value: T.any(Symbol, Integer)).void }
  def actor_type=(value); end

  sig { void }
  def clear_actor_id; end

  sig { void }
  def clear_actor_type; end

  sig { void }
  def clear_digest; end

  sig { void }
  def clear_entry_point; end

  sig { void }
  def clear_operation_id; end

  sig { void }
  def clear_owner_id; end

  sig { void }
  def clear_owner_name; end

  sig { void }
  def clear_owner_type; end

  sig { void }
  def clear_parent_installation_id; end

  sig { void }
  def clear_request_context; end

  sig { void }
  def clear_scope_type; end

  sig { void }
  def clear_subject_type; end

  sig { void }
  def clear_subject_type_total; end

  sig { void }
  def clear_target_id; end

  sig { void }
  def clear_target_type; end

  sig { void }
  def clear_total; end

  sig { void }
  def clear_write_type; end

  sig { returns(String) }
  def digest; end

  sig { params(value: String).void }
  def digest=(value); end

  sig { returns(String) }
  def entry_point; end

  sig { params(value: String).void }
  def entry_point=(value); end

  sig { returns(String) }
  def operation_id; end

  sig { params(value: String).void }
  def operation_id=(value); end

  sig { returns(Integer) }
  def owner_id; end

  sig { params(value: Integer).void }
  def owner_id=(value); end

  sig { returns(String) }
  def owner_name; end

  sig { params(value: String).void }
  def owner_name=(value); end

  sig { returns(T.any(Symbol, Integer)) }
  def owner_type; end

  sig { params(value: T.any(Symbol, Integer)).void }
  def owner_type=(value); end

  sig { returns(Integer) }
  def parent_installation_id; end

  sig { params(value: Integer).void }
  def parent_installation_id=(value); end

  sig { returns(T.nilable(Hydro::Schemas::Github::V1::Entities::RequestContext)) }
  def request_context; end

  sig { params(value: T.nilable(Hydro::Schemas::Github::V1::Entities::RequestContext)).void }
  def request_context=(value); end

  sig { returns(T.any(Symbol, Integer)) }
  def scope_type; end

  sig { params(value: T.any(Symbol, Integer)).void }
  def scope_type=(value); end

  sig { returns(T.any(Symbol, Integer)) }
  def subject_type; end

  sig { params(value: T.any(Symbol, Integer)).void }
  def subject_type=(value); end

  sig { returns(Google::Protobuf::Map[String, Integer]) }
  def subject_type_total; end

  sig { params(value: Google::Protobuf::Map[String, Integer]).void }
  def subject_type_total=(value); end

  sig { returns(Integer) }
  def target_id; end

  sig { params(value: Integer).void }
  def target_id=(value); end

  sig { returns(T.any(Symbol, Integer)) }
  def target_type; end

  sig { params(value: T.any(Symbol, Integer)).void }
  def target_type=(value); end

  sig { returns(Integer) }
  def total; end

  sig { params(value: Integer).void }
  def total=(value); end

  sig { returns(T.any(Symbol, Integer)) }
  def write_type; end

  sig { params(value: T.any(Symbol, Integer)).void }
  def write_type=(value); end
end
