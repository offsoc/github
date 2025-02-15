# typed: true

# DO NOT EDIT MANUALLY
# This is an autogenerated file for dynamic methods in `Hydro::Schemas::Github::V1::LabelCreate`.
# Please instead update this file by running `bin/tapioca dsl Hydro::Schemas::Github::V1::LabelCreate`.

class Hydro::Schemas::Github::V1::LabelCreate
  sig do
    params(
      actor: T.nilable(Hydro::Schemas::Github::V1::Entities::User),
      issue_id: T.nilable(Integer),
      label: T.nilable(Hydro::Schemas::Github::V1::Entities::Label)
    ).void
  end
  def initialize(actor: nil, issue_id: nil, label: nil); end

  sig { returns(T.nilable(Hydro::Schemas::Github::V1::Entities::User)) }
  def actor; end

  sig { params(value: T.nilable(Hydro::Schemas::Github::V1::Entities::User)).void }
  def actor=(value); end

  sig { void }
  def clear_actor; end

  sig { void }
  def clear_issue_id; end

  sig { void }
  def clear_label; end

  sig { returns(Integer) }
  def issue_id; end

  sig { params(value: Integer).void }
  def issue_id=(value); end

  sig { returns(T.nilable(Hydro::Schemas::Github::V1::Entities::Label)) }
  def label; end

  sig { params(value: T.nilable(Hydro::Schemas::Github::V1::Entities::Label)).void }
  def label=(value); end
end
