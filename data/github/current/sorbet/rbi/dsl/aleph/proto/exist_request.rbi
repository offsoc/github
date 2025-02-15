# typed: true

# DO NOT EDIT MANUALLY
# This is an autogenerated file for dynamic methods in `Aleph::Proto::ExistRequest`.
# Please instead update this file by running `bin/tapioca dsl Aleph::Proto::ExistRequest`.

class Aleph::Proto::ExistRequest
  sig do
    params(
      actor: T.nilable(Aleph::Proto::Actor),
      backend: T.nilable(T.any(Symbol, Integer)),
      backends: T.nilable(T.any(Google::Protobuf::RepeatedField[T.any(Symbol, Integer)], T::Array[T.any(Symbol, Integer)])),
      commit_oid: T.nilable(String),
      network_id: T.nilable(Integer),
      repository_id: T.nilable(Integer),
      repository_name: T.nilable(String),
      repository_owner: T.nilable(String),
      root_id: T.nilable(Integer)
    ).void
  end
  def initialize(actor: nil, backend: nil, backends: T.unsafe(nil), commit_oid: nil, network_id: nil, repository_id: nil, repository_name: nil, repository_owner: nil, root_id: nil); end

  sig { returns(T.nilable(Aleph::Proto::Actor)) }
  def actor; end

  sig { params(value: T.nilable(Aleph::Proto::Actor)).void }
  def actor=(value); end

  sig { returns(T.any(Symbol, Integer)) }
  def backend; end

  sig { params(value: T.any(Symbol, Integer)).void }
  def backend=(value); end

  sig { returns(Google::Protobuf::RepeatedField[T.any(Symbol, Integer)]) }
  def backends; end

  sig { params(value: Google::Protobuf::RepeatedField[T.any(Symbol, Integer)]).void }
  def backends=(value); end

  sig { void }
  def clear_actor; end

  sig { void }
  def clear_backend; end

  sig { void }
  def clear_backends; end

  sig { void }
  def clear_commit_oid; end

  sig { void }
  def clear_network_id; end

  sig { void }
  def clear_repository_id; end

  sig { void }
  def clear_repository_name; end

  sig { void }
  def clear_repository_owner; end

  sig { void }
  def clear_root_id; end

  sig { returns(String) }
  def commit_oid; end

  sig { params(value: String).void }
  def commit_oid=(value); end

  sig { returns(Integer) }
  def network_id; end

  sig { params(value: Integer).void }
  def network_id=(value); end

  sig { returns(Integer) }
  def repository_id; end

  sig { params(value: Integer).void }
  def repository_id=(value); end

  sig { returns(String) }
  def repository_name; end

  sig { params(value: String).void }
  def repository_name=(value); end

  sig { returns(String) }
  def repository_owner; end

  sig { params(value: String).void }
  def repository_owner=(value); end

  sig { returns(Integer) }
  def root_id; end

  sig { params(value: Integer).void }
  def root_id=(value); end
end
