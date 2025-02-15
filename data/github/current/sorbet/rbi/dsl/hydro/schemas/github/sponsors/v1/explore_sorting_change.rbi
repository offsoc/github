# typed: true

# DO NOT EDIT MANUALLY
# This is an autogenerated file for dynamic methods in `Hydro::Schemas::Github::Sponsors::V1::ExploreSortingChange`.
# Please instead update this file by running `bin/tapioca dsl Hydro::Schemas::Github::Sponsors::V1::ExploreSortingChange`.

class Hydro::Schemas::Github::Sponsors::V1::ExploreSortingChange
  sig do
    params(
      request_context: T.nilable(Hydro::Schemas::Github::V1::Entities::RequestContext),
      sort_option: T.nilable(T.any(Symbol, Integer)),
      viewer: T.nilable(Hydro::Schemas::Github::V1::Entities::User)
    ).void
  end
  def initialize(request_context: nil, sort_option: nil, viewer: nil); end

  sig { void }
  def clear_request_context; end

  sig { void }
  def clear_sort_option; end

  sig { void }
  def clear_viewer; end

  sig { returns(T.nilable(Hydro::Schemas::Github::V1::Entities::RequestContext)) }
  def request_context; end

  sig { params(value: T.nilable(Hydro::Schemas::Github::V1::Entities::RequestContext)).void }
  def request_context=(value); end

  sig { returns(T.any(Symbol, Integer)) }
  def sort_option; end

  sig { params(value: T.any(Symbol, Integer)).void }
  def sort_option=(value); end

  sig { returns(T.nilable(Hydro::Schemas::Github::V1::Entities::User)) }
  def viewer; end

  sig { params(value: T.nilable(Hydro::Schemas::Github::V1::Entities::User)).void }
  def viewer=(value); end
end
