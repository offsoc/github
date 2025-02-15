# typed: true

# DO NOT EDIT MANUALLY
# This is an autogenerated file for dynamic methods in `Hydro::Schemas::Github::V1::ExploreClick`.
# Please instead update this file by running `bin/tapioca dsl Hydro::Schemas::Github::V1::ExploreClick`.

class Hydro::Schemas::Github::V1::ExploreClick
  sig do
    params(
      actor: T.nilable(Hydro::Schemas::Github::V1::Entities::User),
      click_context: T.nilable(T.any(Symbol, Integer)),
      click_target: T.nilable(T.any(Symbol, Integer)),
      click_visual_representation: T.nilable(T.any(Symbol, Integer)),
      ga_id: T.nilable(String),
      record_id: T.nilable(Integer),
      request_context: T.nilable(Hydro::Schemas::Github::V1::Entities::RequestContext),
      visitor_id: T.nilable(String)
    ).void
  end
  def initialize(actor: nil, click_context: nil, click_target: nil, click_visual_representation: nil, ga_id: nil, record_id: nil, request_context: nil, visitor_id: nil); end

  sig { returns(T.nilable(Hydro::Schemas::Github::V1::Entities::User)) }
  def actor; end

  sig { params(value: T.nilable(Hydro::Schemas::Github::V1::Entities::User)).void }
  def actor=(value); end

  sig { void }
  def clear_actor; end

  sig { void }
  def clear_click_context; end

  sig { void }
  def clear_click_target; end

  sig { void }
  def clear_click_visual_representation; end

  sig { void }
  def clear_ga_id; end

  sig { void }
  def clear_record_id; end

  sig { void }
  def clear_request_context; end

  sig { void }
  def clear_visitor_id; end

  sig { returns(T.any(Symbol, Integer)) }
  def click_context; end

  sig { params(value: T.any(Symbol, Integer)).void }
  def click_context=(value); end

  sig { returns(T.any(Symbol, Integer)) }
  def click_target; end

  sig { params(value: T.any(Symbol, Integer)).void }
  def click_target=(value); end

  sig { returns(T.any(Symbol, Integer)) }
  def click_visual_representation; end

  sig { params(value: T.any(Symbol, Integer)).void }
  def click_visual_representation=(value); end

  sig { returns(String) }
  def ga_id; end

  sig { params(value: String).void }
  def ga_id=(value); end

  sig { returns(Integer) }
  def record_id; end

  sig { params(value: Integer).void }
  def record_id=(value); end

  sig { returns(T.nilable(Hydro::Schemas::Github::V1::Entities::RequestContext)) }
  def request_context; end

  sig { params(value: T.nilable(Hydro::Schemas::Github::V1::Entities::RequestContext)).void }
  def request_context=(value); end

  sig { returns(String) }
  def visitor_id; end

  sig { params(value: String).void }
  def visitor_id=(value); end
end
