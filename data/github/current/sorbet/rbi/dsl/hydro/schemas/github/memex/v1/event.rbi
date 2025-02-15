# typed: true

# DO NOT EDIT MANUALLY
# This is an autogenerated file for dynamic methods in `Hydro::Schemas::Github::Memex::V1::Event`.
# Please instead update this file by running `bin/tapioca dsl Hydro::Schemas::Github::Memex::V1::Event`.

class Hydro::Schemas::Github::Memex::V1::Event
  sig do
    params(
      actor: T.nilable(Hydro::Schemas::Github::V1::Entities::User),
      context: T.nilable(String),
      memex_project: T.nilable(Hydro::Schemas::Github::V2::Entities::MemexProject),
      memex_project_column: T.nilable(Hydro::Schemas::Github::V2::Entities::MemexProjectColumn),
      memex_project_item: T.nilable(Hydro::Schemas::Github::V2::Entities::MemexProjectItem),
      memex_project_view: T.nilable(Hydro::Schemas::Github::V2::Entities::MemexProjectView),
      name: T.nilable(String),
      performed_at: T.nilable(Google::Protobuf::Timestamp),
      repository: T.nilable(Hydro::Schemas::Github::V2::Entities::Repository),
      ui: T.nilable(String)
    ).void
  end
  def initialize(actor: nil, context: nil, memex_project: nil, memex_project_column: nil, memex_project_item: nil, memex_project_view: nil, name: nil, performed_at: nil, repository: nil, ui: nil); end

  sig { returns(T.nilable(Hydro::Schemas::Github::V1::Entities::User)) }
  def actor; end

  sig { params(value: T.nilable(Hydro::Schemas::Github::V1::Entities::User)).void }
  def actor=(value); end

  sig { void }
  def clear_actor; end

  sig { void }
  def clear_context; end

  sig { void }
  def clear_memex_project; end

  sig { void }
  def clear_memex_project_column; end

  sig { void }
  def clear_memex_project_item; end

  sig { void }
  def clear_memex_project_view; end

  sig { void }
  def clear_name; end

  sig { void }
  def clear_performed_at; end

  sig { void }
  def clear_repository; end

  sig { void }
  def clear_ui; end

  sig { returns(String) }
  def context; end

  sig { params(value: String).void }
  def context=(value); end

  sig { returns(T.nilable(Hydro::Schemas::Github::V2::Entities::MemexProject)) }
  def memex_project; end

  sig { params(value: T.nilable(Hydro::Schemas::Github::V2::Entities::MemexProject)).void }
  def memex_project=(value); end

  sig { returns(T.nilable(Hydro::Schemas::Github::V2::Entities::MemexProjectColumn)) }
  def memex_project_column; end

  sig { params(value: T.nilable(Hydro::Schemas::Github::V2::Entities::MemexProjectColumn)).void }
  def memex_project_column=(value); end

  sig { returns(T.nilable(Hydro::Schemas::Github::V2::Entities::MemexProjectItem)) }
  def memex_project_item; end

  sig { params(value: T.nilable(Hydro::Schemas::Github::V2::Entities::MemexProjectItem)).void }
  def memex_project_item=(value); end

  sig { returns(T.nilable(Hydro::Schemas::Github::V2::Entities::MemexProjectView)) }
  def memex_project_view; end

  sig { params(value: T.nilable(Hydro::Schemas::Github::V2::Entities::MemexProjectView)).void }
  def memex_project_view=(value); end

  sig { returns(String) }
  def name; end

  sig { params(value: String).void }
  def name=(value); end

  sig { returns(T.nilable(Google::Protobuf::Timestamp)) }
  def performed_at; end

  sig { params(value: T.nilable(Google::Protobuf::Timestamp)).void }
  def performed_at=(value); end

  sig { returns(T.nilable(Hydro::Schemas::Github::V2::Entities::Repository)) }
  def repository; end

  sig { params(value: T.nilable(Hydro::Schemas::Github::V2::Entities::Repository)).void }
  def repository=(value); end

  sig { returns(String) }
  def ui; end

  sig { params(value: String).void }
  def ui=(value); end
end
