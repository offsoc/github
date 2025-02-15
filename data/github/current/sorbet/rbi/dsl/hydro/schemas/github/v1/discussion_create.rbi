# typed: true

# DO NOT EDIT MANUALLY
# This is an autogenerated file for dynamic methods in `Hydro::Schemas::Github::V1::DiscussionCreate`.
# Please instead update this file by running `bin/tapioca dsl Hydro::Schemas::Github::V1::DiscussionCreate`.

class Hydro::Schemas::Github::V1::DiscussionCreate
  sig do
    params(
      discussion: T.nilable(Hydro::Schemas::Github::V1::Entities::Discussion),
      request_context: T.nilable(Hydro::Schemas::Github::V1::Entities::RequestContext),
      spamurai_form_signals: T.nilable(Hydro::Schemas::Github::V1::Entities::SpamuraiFormSignals),
      specimen_body: T.nilable(Hydro::Schemas::Github::V1::Entities::SpecimenData),
      specimen_title: T.nilable(Hydro::Schemas::Github::V1::Entities::SpecimenData)
    ).void
  end
  def initialize(discussion: nil, request_context: nil, spamurai_form_signals: nil, specimen_body: nil, specimen_title: nil); end

  sig { void }
  def clear_discussion; end

  sig { void }
  def clear_request_context; end

  sig { void }
  def clear_spamurai_form_signals; end

  sig { void }
  def clear_specimen_body; end

  sig { void }
  def clear_specimen_title; end

  sig { returns(T.nilable(Hydro::Schemas::Github::V1::Entities::Discussion)) }
  def discussion; end

  sig { params(value: T.nilable(Hydro::Schemas::Github::V1::Entities::Discussion)).void }
  def discussion=(value); end

  sig { returns(T.nilable(Hydro::Schemas::Github::V1::Entities::RequestContext)) }
  def request_context; end

  sig { params(value: T.nilable(Hydro::Schemas::Github::V1::Entities::RequestContext)).void }
  def request_context=(value); end

  sig { returns(T.nilable(Hydro::Schemas::Github::V1::Entities::SpamuraiFormSignals)) }
  def spamurai_form_signals; end

  sig { params(value: T.nilable(Hydro::Schemas::Github::V1::Entities::SpamuraiFormSignals)).void }
  def spamurai_form_signals=(value); end

  sig { returns(T.nilable(Hydro::Schemas::Github::V1::Entities::SpecimenData)) }
  def specimen_body; end

  sig { params(value: T.nilable(Hydro::Schemas::Github::V1::Entities::SpecimenData)).void }
  def specimen_body=(value); end

  sig { returns(T.nilable(Hydro::Schemas::Github::V1::Entities::SpecimenData)) }
  def specimen_title; end

  sig { params(value: T.nilable(Hydro::Schemas::Github::V1::Entities::SpecimenData)).void }
  def specimen_title=(value); end
end
