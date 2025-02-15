# typed: true

# DO NOT EDIT MANUALLY
# This is an autogenerated file for dynamic methods in `Api::App::PlatformTypes::CommittishFile`.
# Please instead update this file by running `bin/tapioca dsl Api::App::PlatformTypes::CommittishFile`.

class Api::App::PlatformTypes::CommittishFile < GraphQL::Client::Schema::ObjectClass
  sig { returns(T.nilable(String)) }
  def __typename; end

  sig { returns(Api::App::PlatformTypes::Blob) }
  def blob; end

  sig { returns(T::Boolean) }
  def blob?; end

  sig { returns(String) }
  def file_path; end

  sig { returns(T::Boolean) }
  def file_path?; end

  sig { returns(T.any(String, Integer)) }
  def id; end

  sig { returns(T::Boolean) }
  def id?; end

  sig { returns(GraphQL::Client::Schema::InterfaceType) }
  def object; end

  sig { returns(T::Boolean) }
  def object?; end

  sig { returns(T.nilable(String)) }
  def render_file_type; end

  sig { returns(T::Boolean) }
  def render_file_type?; end

  sig { returns(T.nilable(GraphQL::Client::Schema::ScalarType)) }
  def render_url; end

  sig { returns(T::Boolean) }
  def render_url?; end

  sig { returns(Api::App::PlatformTypes::Repository) }
  def repository; end

  sig { returns(T::Boolean) }
  def repository?; end

  sig { returns(GraphQL::Client::Schema::ScalarType) }
  def resource_path; end

  sig { returns(T::Boolean) }
  def resource_path?; end

  sig { returns(Api::App::PlatformTypes::CommitRevision) }
  def revision; end

  sig { returns(T::Boolean) }
  def revision?; end

  sig { returns(GraphQL::Client::Schema::ScalarType) }
  def url; end

  sig { returns(T::Boolean) }
  def url?; end
end
