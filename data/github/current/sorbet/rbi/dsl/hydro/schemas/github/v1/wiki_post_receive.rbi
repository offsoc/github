# typed: true

# DO NOT EDIT MANUALLY
# This is an autogenerated file for dynamic methods in `Hydro::Schemas::Github::V1::WikiPostReceive`.
# Please instead update this file by running `bin/tapioca dsl Hydro::Schemas::Github::V1::WikiPostReceive`.

class Hydro::Schemas::Github::V1::WikiPostReceive
  sig do
    params(
      business_id: T.nilable(Google::Protobuf::Int32Value),
      feature_flags: T.nilable(T.any(Google::Protobuf::RepeatedField[String], T::Array[String])),
      owner: T.nilable(Hydro::Schemas::Github::V1::Entities::User),
      pushed_at: T.nilable(Google::Protobuf::Timestamp),
      pusher: T.nilable(Hydro::Schemas::Github::V1::Entities::User),
      ref_updates: T.nilable(T.any(Google::Protobuf::RepeatedField[Hydro::Schemas::Github::V1::WikiPostReceive::RefUpdate], T::Array[Hydro::Schemas::Github::V1::WikiPostReceive::RefUpdate])),
      repository: T.nilable(Hydro::Schemas::Github::V1::Entities::Repository),
      request_context: T.nilable(Hydro::Schemas::Github::V1::Entities::RequestContext),
      wiki_world_writable: T.nilable(T::Boolean)
    ).void
  end
  def initialize(business_id: nil, feature_flags: T.unsafe(nil), owner: nil, pushed_at: nil, pusher: nil, ref_updates: T.unsafe(nil), repository: nil, request_context: nil, wiki_world_writable: nil); end

  sig { returns(T.nilable(Google::Protobuf::Int32Value)) }
  def business_id; end

  sig { params(value: T.nilable(Google::Protobuf::Int32Value)).void }
  def business_id=(value); end

  sig { void }
  def clear_business_id; end

  sig { void }
  def clear_feature_flags; end

  sig { void }
  def clear_owner; end

  sig { void }
  def clear_pushed_at; end

  sig { void }
  def clear_pusher; end

  sig { void }
  def clear_ref_updates; end

  sig { void }
  def clear_repository; end

  sig { void }
  def clear_request_context; end

  sig { void }
  def clear_wiki_world_writable; end

  sig { returns(Google::Protobuf::RepeatedField[String]) }
  def feature_flags; end

  sig { params(value: Google::Protobuf::RepeatedField[String]).void }
  def feature_flags=(value); end

  sig { returns(T.nilable(Hydro::Schemas::Github::V1::Entities::User)) }
  def owner; end

  sig { params(value: T.nilable(Hydro::Schemas::Github::V1::Entities::User)).void }
  def owner=(value); end

  sig { returns(T.nilable(Google::Protobuf::Timestamp)) }
  def pushed_at; end

  sig { params(value: T.nilable(Google::Protobuf::Timestamp)).void }
  def pushed_at=(value); end

  sig { returns(T.nilable(Hydro::Schemas::Github::V1::Entities::User)) }
  def pusher; end

  sig { params(value: T.nilable(Hydro::Schemas::Github::V1::Entities::User)).void }
  def pusher=(value); end

  sig { returns(Google::Protobuf::RepeatedField[Hydro::Schemas::Github::V1::WikiPostReceive::RefUpdate]) }
  def ref_updates; end

  sig { params(value: Google::Protobuf::RepeatedField[Hydro::Schemas::Github::V1::WikiPostReceive::RefUpdate]).void }
  def ref_updates=(value); end

  sig { returns(T.nilable(Hydro::Schemas::Github::V1::Entities::Repository)) }
  def repository; end

  sig { params(value: T.nilable(Hydro::Schemas::Github::V1::Entities::Repository)).void }
  def repository=(value); end

  sig { returns(T.nilable(Hydro::Schemas::Github::V1::Entities::RequestContext)) }
  def request_context; end

  sig { params(value: T.nilable(Hydro::Schemas::Github::V1::Entities::RequestContext)).void }
  def request_context=(value); end

  sig { returns(T::Boolean) }
  def wiki_world_writable; end

  sig { params(value: T::Boolean).void }
  def wiki_world_writable=(value); end
end
