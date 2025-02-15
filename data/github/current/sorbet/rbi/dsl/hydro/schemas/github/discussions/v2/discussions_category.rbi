# typed: true

# DO NOT EDIT MANUALLY
# This is an autogenerated file for dynamic methods in `Hydro::Schemas::Github::Discussions::V2::DiscussionsCategory`.
# Please instead update this file by running `bin/tapioca dsl Hydro::Schemas::Github::Discussions::V2::DiscussionsCategory`.

class Hydro::Schemas::Github::Discussions::V2::DiscussionsCategory
  sig do
    params(
      action: T.nilable(T.any(Symbol, Integer)),
      action_timestamp: T.nilable(Google::Protobuf::Timestamp),
      actor: T.nilable(Hydro::Schemas::Github::V1::Entities::User),
      actor_id: T.nilable(Integer),
      category_id: T.nilable(Integer),
      category_name: T.nilable(String),
      discussion_format: T.nilable(T.any(Symbol, Integer)),
      discussion_section_id: T.nilable(Integer),
      repository: T.nilable(Hydro::Schemas::Github::V1::Entities::Repository),
      repository_id: T.nilable(Integer),
      repository_owner: T.nilable(Hydro::Schemas::Github::V1::Entities::User),
      request_context: T.nilable(Hydro::Schemas::Github::V1::Entities::RequestContext)
    ).void
  end
  def initialize(action: nil, action_timestamp: nil, actor: nil, actor_id: nil, category_id: nil, category_name: nil, discussion_format: nil, discussion_section_id: nil, repository: nil, repository_id: nil, repository_owner: nil, request_context: nil); end

  sig { returns(T.any(Symbol, Integer)) }
  def action; end

  sig { params(value: T.any(Symbol, Integer)).void }
  def action=(value); end

  sig { returns(T.nilable(Google::Protobuf::Timestamp)) }
  def action_timestamp; end

  sig { params(value: T.nilable(Google::Protobuf::Timestamp)).void }
  def action_timestamp=(value); end

  sig { returns(T.nilable(Hydro::Schemas::Github::V1::Entities::User)) }
  def actor; end

  sig { params(value: T.nilable(Hydro::Schemas::Github::V1::Entities::User)).void }
  def actor=(value); end

  sig { returns(Integer) }
  def actor_id; end

  sig { params(value: Integer).void }
  def actor_id=(value); end

  sig { returns(Integer) }
  def category_id; end

  sig { params(value: Integer).void }
  def category_id=(value); end

  sig { returns(String) }
  def category_name; end

  sig { params(value: String).void }
  def category_name=(value); end

  sig { void }
  def clear_action; end

  sig { void }
  def clear_action_timestamp; end

  sig { void }
  def clear_actor; end

  sig { void }
  def clear_actor_id; end

  sig { void }
  def clear_category_id; end

  sig { void }
  def clear_category_name; end

  sig { void }
  def clear_discussion_format; end

  sig { void }
  def clear_discussion_section_id; end

  sig { void }
  def clear_repository; end

  sig { void }
  def clear_repository_id; end

  sig { void }
  def clear_repository_owner; end

  sig { void }
  def clear_request_context; end

  sig { returns(T.any(Symbol, Integer)) }
  def discussion_format; end

  sig { params(value: T.any(Symbol, Integer)).void }
  def discussion_format=(value); end

  sig { returns(Integer) }
  def discussion_section_id; end

  sig { params(value: Integer).void }
  def discussion_section_id=(value); end

  sig { returns(T.nilable(Hydro::Schemas::Github::V1::Entities::Repository)) }
  def repository; end

  sig { params(value: T.nilable(Hydro::Schemas::Github::V1::Entities::Repository)).void }
  def repository=(value); end

  sig { returns(Integer) }
  def repository_id; end

  sig { params(value: Integer).void }
  def repository_id=(value); end

  sig { returns(T.nilable(Hydro::Schemas::Github::V1::Entities::User)) }
  def repository_owner; end

  sig { params(value: T.nilable(Hydro::Schemas::Github::V1::Entities::User)).void }
  def repository_owner=(value); end

  sig { returns(T.nilable(Hydro::Schemas::Github::V1::Entities::RequestContext)) }
  def request_context; end

  sig { params(value: T.nilable(Hydro::Schemas::Github::V1::Entities::RequestContext)).void }
  def request_context=(value); end
end
