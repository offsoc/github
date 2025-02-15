# typed: true

# DO NOT EDIT MANUALLY
# This is an autogenerated file for dynamic methods in `Api::App::PlatformTypes::App`.
# Please instead update this file by running `bin/tapioca dsl Api::App::PlatformTypes::App`.

class Api::App::PlatformTypes::App < GraphQL::Client::Schema::ObjectClass
  sig { returns(T.nilable(String)) }
  def __typename; end

  sig { returns(T.nilable(String)) }
  def client_id; end

  sig { returns(T::Boolean) }
  def client_id?; end

  sig { returns(GraphQL::Client::Schema::ScalarType) }
  def created_at; end

  sig { returns(T::Boolean) }
  def created_at?; end

  sig { returns(T.nilable(Integer)) }
  def database_id; end

  sig { returns(T::Boolean) }
  def database_id?; end

  sig { returns(T::Array[String]) }
  def default_events; end

  sig { returns(T::Boolean) }
  def default_events?; end

  sig { returns(T::Array[Api::App::PlatformTypes::AppPermission]) }
  def default_permissions; end

  sig { returns(T::Boolean) }
  def default_permissions?; end

  sig { returns(T.nilable(String)) }
  def description; end

  sig { returns(T::Boolean) }
  def description?; end

  sig { returns(T.nilable(GraphQL::Client::Schema::ScalarType)) }
  def description_html; end

  sig { returns(T::Boolean) }
  def description_html?; end

  sig { returns(GraphQL::Client::Schema::ScalarType) }
  def html_resource_path; end

  sig { returns(T::Boolean) }
  def html_resource_path?; end

  sig { returns(GraphQL::Client::Schema::ScalarType) }
  def html_url; end

  sig { returns(T::Boolean) }
  def html_url?; end

  sig { returns(T.any(String, Integer)) }
  def id; end

  sig { returns(T::Boolean) }
  def id?; end

  sig { returns(Api::App::PlatformTypes::RepositoryConnection) }
  def installed_repositories; end

  sig { returns(T::Boolean) }
  def installed_repositories?; end

  sig { returns(Api::App::PlatformTypes::IpAllowListEntryConnection) }
  def ip_allow_list_entries; end

  sig { returns(T::Boolean) }
  def ip_allow_list_entries?; end

  sig { returns(T::Boolean) }
  def is_beta_feature_enabled; end

  sig { returns(T::Boolean) }
  def is_beta_feature_enabled?; end

  sig { returns(T::Boolean) }
  def is_feature_enabled; end

  sig { returns(T::Boolean) }
  def is_feature_enabled?; end

  sig { returns(String) }
  def logo_background_color; end

  sig { returns(T::Boolean) }
  def logo_background_color?; end

  sig { returns(GraphQL::Client::Schema::ScalarType) }
  def logo_url; end

  sig { returns(T::Boolean) }
  def logo_url?; end

  sig { returns(T.nilable(Api::App::PlatformTypes::MarketplaceListing)) }
  def marketplace_listing; end

  sig { returns(T::Boolean) }
  def marketplace_listing?; end

  sig { returns(String) }
  def name; end

  sig { returns(T::Boolean) }
  def name?; end

  sig do
    returns(T.any(Api::App::PlatformTypes::Enterprise, Api::App::PlatformTypes::Organization, Api::App::PlatformTypes::User, Api::App::PlatformTypes::DotcomAppOwnerMetadata))
  end
  def owner; end

  sig { returns(T::Boolean) }
  def owner?; end

  sig { returns(String) }
  def preferred_background_color; end

  sig { returns(T::Boolean) }
  def preferred_background_color?; end

  sig { returns(T.nilable(GraphQL::Client::Schema::ScalarType)) }
  def short_description_html; end

  sig { returns(T::Boolean) }
  def short_description_html?; end

  sig { returns(String) }
  def slug; end

  sig { returns(T::Boolean) }
  def slug?; end

  sig { returns(GraphQL::Client::Schema::ScalarType) }
  def updated_at; end

  sig { returns(T::Boolean) }
  def updated_at?; end

  sig { returns(GraphQL::Client::Schema::ScalarType) }
  def url; end

  sig { returns(T::Boolean) }
  def url?; end
end
