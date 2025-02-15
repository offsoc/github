# typed: true

# DO NOT EDIT MANUALLY
# This is an autogenerated file for dynamic methods in `Api::App::PlatformTypes::DependencyGraphManifest`.
# Please instead update this file by running `bin/tapioca dsl Api::App::PlatformTypes::DependencyGraphManifest`.

class Api::App::PlatformTypes::DependencyGraphManifest < GraphQL::Client::Schema::ObjectClass
  sig { returns(T.nilable(String)) }
  def __typename; end

  sig { returns(String) }
  def blob_path; end

  sig { returns(T::Boolean) }
  def blob_path?; end

  sig { returns(T.nilable(Api::App::PlatformTypes::DependencyGraphDependencyConnection)) }
  def dependencies; end

  sig { returns(T::Boolean) }
  def dependencies?; end

  sig { returns(T.nilable(Integer)) }
  def dependencies_count; end

  sig { returns(T::Boolean) }
  def dependencies_count?; end

  sig { returns(T::Boolean) }
  def exceeds_max_size; end

  sig { returns(T::Boolean) }
  def exceeds_max_size?; end

  sig { returns(String) }
  def filename; end

  sig { returns(T::Boolean) }
  def filename?; end

  sig { returns(T.any(String, Integer)) }
  def id; end

  sig { returns(T::Boolean) }
  def id?; end

  sig { returns(T::Boolean) }
  def parseable; end

  sig { returns(T::Boolean) }
  def parseable?; end

  sig { returns(Api::App::PlatformTypes::Repository) }
  def repository; end

  sig { returns(T::Boolean) }
  def repository?; end

  sig { returns(T::Boolean) }
  def viewer_can_view_alerts; end

  sig { returns(T::Boolean) }
  def viewer_can_view_alerts?; end
end
