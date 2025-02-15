# typed: true

# DO NOT EDIT MANUALLY
# This is an autogenerated file for dynamic methods in `Hydro::Schemas::Github::V1::IssueLinkCreate`.
# Please instead update this file by running `bin/tapioca dsl Hydro::Schemas::Github::V1::IssueLinkCreate`.

class Hydro::Schemas::Github::V1::IssueLinkCreate
  sig do
    params(
      actor: T.nilable(Hydro::Schemas::Github::V1::Entities::User),
      link_type: T.nilable(T.any(Symbol, Integer)),
      new_target_issue: T.nilable(T::Boolean),
      source_issue: T.nilable(Hydro::Schemas::Github::V1::Entities::Issue),
      source_repository: T.nilable(Hydro::Schemas::Github::V1::Entities::Repository),
      target_issue: T.nilable(Hydro::Schemas::Github::V1::Entities::Issue),
      target_repository: T.nilable(Hydro::Schemas::Github::V1::Entities::Repository)
    ).void
  end
  def initialize(actor: nil, link_type: nil, new_target_issue: nil, source_issue: nil, source_repository: nil, target_issue: nil, target_repository: nil); end

  sig { returns(T.nilable(Hydro::Schemas::Github::V1::Entities::User)) }
  def actor; end

  sig { params(value: T.nilable(Hydro::Schemas::Github::V1::Entities::User)).void }
  def actor=(value); end

  sig { void }
  def clear_actor; end

  sig { void }
  def clear_link_type; end

  sig { void }
  def clear_new_target_issue; end

  sig { void }
  def clear_source_issue; end

  sig { void }
  def clear_source_repository; end

  sig { void }
  def clear_target_issue; end

  sig { void }
  def clear_target_repository; end

  sig { returns(T.any(Symbol, Integer)) }
  def link_type; end

  sig { params(value: T.any(Symbol, Integer)).void }
  def link_type=(value); end

  sig { returns(T::Boolean) }
  def new_target_issue; end

  sig { params(value: T::Boolean).void }
  def new_target_issue=(value); end

  sig { returns(T.nilable(Hydro::Schemas::Github::V1::Entities::Issue)) }
  def source_issue; end

  sig { params(value: T.nilable(Hydro::Schemas::Github::V1::Entities::Issue)).void }
  def source_issue=(value); end

  sig { returns(T.nilable(Hydro::Schemas::Github::V1::Entities::Repository)) }
  def source_repository; end

  sig { params(value: T.nilable(Hydro::Schemas::Github::V1::Entities::Repository)).void }
  def source_repository=(value); end

  sig { returns(T.nilable(Hydro::Schemas::Github::V1::Entities::Issue)) }
  def target_issue; end

  sig { params(value: T.nilable(Hydro::Schemas::Github::V1::Entities::Issue)).void }
  def target_issue=(value); end

  sig { returns(T.nilable(Hydro::Schemas::Github::V1::Entities::Repository)) }
  def target_repository; end

  sig { params(value: T.nilable(Hydro::Schemas::Github::V1::Entities::Repository)).void }
  def target_repository=(value); end
end
