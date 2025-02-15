# typed: true

# DO NOT EDIT MANUALLY
# This is an autogenerated file for dynamic methods in `Hydro::Schemas::Github::V1::DiscussionRemoveUpvote`.
# Please instead update this file by running `bin/tapioca dsl Hydro::Schemas::Github::V1::DiscussionRemoveUpvote`.

class Hydro::Schemas::Github::V1::DiscussionRemoveUpvote
  sig do
    params(
      actor: T.nilable(Hydro::Schemas::Github::V1::Entities::User),
      discussion: T.nilable(Hydro::Schemas::Github::V1::Entities::Discussion),
      discussion_comment: T.nilable(Hydro::Schemas::Github::V1::Entities::DiscussionComment),
      request_context: T.nilable(Hydro::Schemas::Github::V1::Entities::RequestContext),
      spamurai_form_signals: T.nilable(Hydro::Schemas::Github::V1::Entities::SpamuraiFormSignals)
    ).void
  end
  def initialize(actor: nil, discussion: nil, discussion_comment: nil, request_context: nil, spamurai_form_signals: nil); end

  sig { returns(T.nilable(Hydro::Schemas::Github::V1::Entities::User)) }
  def actor; end

  sig { params(value: T.nilable(Hydro::Schemas::Github::V1::Entities::User)).void }
  def actor=(value); end

  sig { void }
  def clear_actor; end

  sig { void }
  def clear_discussion; end

  sig { void }
  def clear_discussion_comment; end

  sig { void }
  def clear_request_context; end

  sig { void }
  def clear_spamurai_form_signals; end

  sig { returns(T.nilable(Hydro::Schemas::Github::V1::Entities::Discussion)) }
  def discussion; end

  sig { params(value: T.nilable(Hydro::Schemas::Github::V1::Entities::Discussion)).void }
  def discussion=(value); end

  sig { returns(T.nilable(Hydro::Schemas::Github::V1::Entities::DiscussionComment)) }
  def discussion_comment; end

  sig { params(value: T.nilable(Hydro::Schemas::Github::V1::Entities::DiscussionComment)).void }
  def discussion_comment=(value); end

  sig { returns(T.nilable(Hydro::Schemas::Github::V1::Entities::RequestContext)) }
  def request_context; end

  sig { params(value: T.nilable(Hydro::Schemas::Github::V1::Entities::RequestContext)).void }
  def request_context=(value); end

  sig { returns(T.nilable(Hydro::Schemas::Github::V1::Entities::SpamuraiFormSignals)) }
  def spamurai_form_signals; end

  sig { params(value: T.nilable(Hydro::Schemas::Github::V1::Entities::SpamuraiFormSignals)).void }
  def spamurai_form_signals=(value); end
end
