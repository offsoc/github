# typed: true

# DO NOT EDIT MANUALLY
# This is an autogenerated file for dynamic methods in `Hydro::Schemas::Github::V1::IgnoredUser`.
# Please instead update this file by running `bin/tapioca dsl Hydro::Schemas::Github::V1::IgnoredUser`.

class Hydro::Schemas::Github::V1::IgnoredUser
  sig do
    params(
      action: T.nilable(T.any(Symbol, Integer)),
      actor: T.nilable(Hydro::Schemas::Github::V1::Entities::User),
      blocked_from_content_id: T.nilable(Integer),
      blocked_from_content_type: T.nilable(String),
      expires_at: T.nilable(Google::Protobuf::Timestamp),
      ignored: T.nilable(Hydro::Schemas::Github::V1::Entities::User),
      ignored_by: T.nilable(Hydro::Schemas::Github::V1::Entities::User),
      ignored_by_org: T.nilable(Hydro::Schemas::Github::V1::Entities::Organization),
      minimize_reason: T.nilable(String),
      repository: T.nilable(Hydro::Schemas::Github::V1::Entities::Repository)
    ).void
  end
  def initialize(action: nil, actor: nil, blocked_from_content_id: nil, blocked_from_content_type: nil, expires_at: nil, ignored: nil, ignored_by: nil, ignored_by_org: nil, minimize_reason: nil, repository: nil); end

  sig { returns(T.any(Symbol, Integer)) }
  def action; end

  sig { params(value: T.any(Symbol, Integer)).void }
  def action=(value); end

  sig { returns(T.nilable(Hydro::Schemas::Github::V1::Entities::User)) }
  def actor; end

  sig { params(value: T.nilable(Hydro::Schemas::Github::V1::Entities::User)).void }
  def actor=(value); end

  sig { returns(Integer) }
  def blocked_from_content_id; end

  sig { params(value: Integer).void }
  def blocked_from_content_id=(value); end

  sig { returns(String) }
  def blocked_from_content_type; end

  sig { params(value: String).void }
  def blocked_from_content_type=(value); end

  sig { void }
  def clear_action; end

  sig { void }
  def clear_actor; end

  sig { void }
  def clear_blocked_from_content_id; end

  sig { void }
  def clear_blocked_from_content_type; end

  sig { void }
  def clear_expires_at; end

  sig { void }
  def clear_ignored; end

  sig { void }
  def clear_ignored_by; end

  sig { void }
  def clear_ignored_by_org; end

  sig { void }
  def clear_minimize_reason; end

  sig { void }
  def clear_repository; end

  sig { returns(T.nilable(Google::Protobuf::Timestamp)) }
  def expires_at; end

  sig { params(value: T.nilable(Google::Protobuf::Timestamp)).void }
  def expires_at=(value); end

  sig { returns(T.nilable(Hydro::Schemas::Github::V1::Entities::User)) }
  def ignored; end

  sig { params(value: T.nilable(Hydro::Schemas::Github::V1::Entities::User)).void }
  def ignored=(value); end

  sig { returns(T.nilable(Hydro::Schemas::Github::V1::Entities::User)) }
  def ignored_by; end

  sig { params(value: T.nilable(Hydro::Schemas::Github::V1::Entities::User)).void }
  def ignored_by=(value); end

  sig { returns(T.nilable(Hydro::Schemas::Github::V1::Entities::Organization)) }
  def ignored_by_org; end

  sig { params(value: T.nilable(Hydro::Schemas::Github::V1::Entities::Organization)).void }
  def ignored_by_org=(value); end

  sig { returns(String) }
  def minimize_reason; end

  sig { params(value: String).void }
  def minimize_reason=(value); end

  sig { returns(T.nilable(Hydro::Schemas::Github::V1::Entities::Repository)) }
  def repository; end

  sig { params(value: T.nilable(Hydro::Schemas::Github::V1::Entities::Repository)).void }
  def repository=(value); end
end
