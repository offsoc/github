# typed: true

# DO NOT EDIT MANUALLY
# This is an autogenerated file for dynamic methods in `Hydro::Schemas::Github::TechProjectStacks::V0::RepositoryTechProjectStacks`.
# Please instead update this file by running `bin/tapioca dsl Hydro::Schemas::Github::TechProjectStacks::V0::RepositoryTechProjectStacks`.

class Hydro::Schemas::Github::TechProjectStacks::V0::RepositoryTechProjectStacks
  sig do
    params(
      commit_oid: T.nilable(String),
      repository: T.nilable(Hydro::Schemas::Github::V2::Entities::Repository),
      tech_project_stacks: T.nilable(T.any(Google::Protobuf::RepeatedField[Hydro::Schemas::Github::TechProjectStacks::V0::RepositoryTechProjectStacks::TechProjectStacks], T::Array[Hydro::Schemas::Github::TechProjectStacks::V0::RepositoryTechProjectStacks::TechProjectStacks]))
    ).void
  end
  def initialize(commit_oid: nil, repository: nil, tech_project_stacks: T.unsafe(nil)); end

  sig { void }
  def clear_commit_oid; end

  sig { void }
  def clear_repository; end

  sig { void }
  def clear_tech_project_stacks; end

  sig { returns(String) }
  def commit_oid; end

  sig { params(value: String).void }
  def commit_oid=(value); end

  sig { returns(T.nilable(Hydro::Schemas::Github::V2::Entities::Repository)) }
  def repository; end

  sig { params(value: T.nilable(Hydro::Schemas::Github::V2::Entities::Repository)).void }
  def repository=(value); end

  sig do
    returns(Google::Protobuf::RepeatedField[Hydro::Schemas::Github::TechProjectStacks::V0::RepositoryTechProjectStacks::TechProjectStacks])
  end
  def tech_project_stacks; end

  sig do
    params(
      value: Google::Protobuf::RepeatedField[Hydro::Schemas::Github::TechProjectStacks::V0::RepositoryTechProjectStacks::TechProjectStacks]
    ).void
  end
  def tech_project_stacks=(value); end
end
