# typed: true

# DO NOT EDIT MANUALLY
# This is an autogenerated file for dynamic methods in `MonolithTwirp::Pages::Pagesdeployerapi::V1::UpdateReplicaRequest`.
# Please instead update this file by running `bin/tapioca dsl MonolithTwirp::Pages::Pagesdeployerapi::V1::UpdateReplicaRequest`.

class MonolithTwirp::Pages::Pagesdeployerapi::V1::UpdateReplicaRequest
  sig do
    params(
      deployment_id: T.nilable(String),
      page_id: T.nilable(String),
      path: T.nilable(String),
      replica_to_add: T.nilable(T.any(Google::Protobuf::RepeatedField[String], T::Array[String])),
      replica_to_remove: T.nilable(T.any(Google::Protobuf::RepeatedField[String], T::Array[String]))
    ).void
  end
  def initialize(deployment_id: nil, page_id: nil, path: nil, replica_to_add: T.unsafe(nil), replica_to_remove: T.unsafe(nil)); end

  sig { void }
  def clear_deployment_id; end

  sig { void }
  def clear_page_id; end

  sig { void }
  def clear_path; end

  sig { void }
  def clear_replica_to_add; end

  sig { void }
  def clear_replica_to_remove; end

  sig { returns(String) }
  def deployment_id; end

  sig { params(value: String).void }
  def deployment_id=(value); end

  sig { returns(String) }
  def page_id; end

  sig { params(value: String).void }
  def page_id=(value); end

  sig { returns(String) }
  def path; end

  sig { params(value: String).void }
  def path=(value); end

  sig { returns(Google::Protobuf::RepeatedField[String]) }
  def replica_to_add; end

  sig { params(value: Google::Protobuf::RepeatedField[String]).void }
  def replica_to_add=(value); end

  sig { returns(Google::Protobuf::RepeatedField[String]) }
  def replica_to_remove; end

  sig { params(value: Google::Protobuf::RepeatedField[String]).void }
  def replica_to_remove=(value); end
end
