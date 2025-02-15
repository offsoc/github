# typed: true

# DO NOT EDIT MANUALLY
# This is an autogenerated file for dynamic methods in `Hydro::Schemas::Github::V1::Entities::RepositoryPage`.
# Please instead update this file by running `bin/tapioca dsl Hydro::Schemas::Github::V1::Entities::RepositoryPage`.

class Hydro::Schemas::Github::V1::Entities::RepositoryPage
  sig do
    params(
      built_revision: T.nilable(Google::Protobuf::StringValue),
      cname: T.nilable(Google::Protobuf::StringValue),
      has_custom_404: T.nilable(Google::Protobuf::BoolValue),
      hsts_include_sub_domains: T.nilable(Google::Protobuf::BoolValue),
      hsts_max_age: T.nilable(Integer),
      hsts_preload: T.nilable(Google::Protobuf::BoolValue),
      https_redirect: T.nilable(Google::Protobuf::BoolValue),
      id: T.nilable(Integer),
      public: T.nilable(Google::Protobuf::BoolValue),
      repository: T.nilable(Hydro::Schemas::Github::V1::Entities::Repository),
      source_ref_name: T.nilable(Google::Protobuf::StringValue),
      source_subdir: T.nilable(Google::Protobuf::StringValue),
      status: T.nilable(T.any(Symbol, Integer)),
      tree_oid: T.nilable(Google::Protobuf::StringValue)
    ).void
  end
  def initialize(built_revision: nil, cname: nil, has_custom_404: nil, hsts_include_sub_domains: nil, hsts_max_age: nil, hsts_preload: nil, https_redirect: nil, id: nil, public: nil, repository: nil, source_ref_name: nil, source_subdir: nil, status: nil, tree_oid: nil); end

  sig { returns(T.nilable(Google::Protobuf::StringValue)) }
  def built_revision; end

  sig { params(value: T.nilable(Google::Protobuf::StringValue)).void }
  def built_revision=(value); end

  sig { void }
  def clear_built_revision; end

  sig { void }
  def clear_cname; end

  sig { void }
  def clear_has_custom_404; end

  sig { void }
  def clear_hsts_include_sub_domains; end

  sig { void }
  def clear_hsts_max_age; end

  sig { void }
  def clear_hsts_preload; end

  sig { void }
  def clear_https_redirect; end

  sig { void }
  def clear_id; end

  sig { void }
  def clear_public; end

  sig { void }
  def clear_repository; end

  sig { void }
  def clear_source_ref_name; end

  sig { void }
  def clear_source_subdir; end

  sig { void }
  def clear_status; end

  sig { void }
  def clear_tree_oid; end

  sig { returns(T.nilable(Google::Protobuf::StringValue)) }
  def cname; end

  sig { params(value: T.nilable(Google::Protobuf::StringValue)).void }
  def cname=(value); end

  sig { returns(T.nilable(Google::Protobuf::BoolValue)) }
  def has_custom_404; end

  sig { params(value: T.nilable(Google::Protobuf::BoolValue)).void }
  def has_custom_404=(value); end

  sig { returns(T.nilable(Google::Protobuf::BoolValue)) }
  def hsts_include_sub_domains; end

  sig { params(value: T.nilable(Google::Protobuf::BoolValue)).void }
  def hsts_include_sub_domains=(value); end

  sig { returns(Integer) }
  def hsts_max_age; end

  sig { params(value: Integer).void }
  def hsts_max_age=(value); end

  sig { returns(T.nilable(Google::Protobuf::BoolValue)) }
  def hsts_preload; end

  sig { params(value: T.nilable(Google::Protobuf::BoolValue)).void }
  def hsts_preload=(value); end

  sig { returns(T.nilable(Google::Protobuf::BoolValue)) }
  def https_redirect; end

  sig { params(value: T.nilable(Google::Protobuf::BoolValue)).void }
  def https_redirect=(value); end

  sig { returns(Integer) }
  def id; end

  sig { params(value: Integer).void }
  def id=(value); end

  sig { returns(T.nilable(Google::Protobuf::BoolValue)) }
  def public; end

  sig { params(value: T.nilable(Google::Protobuf::BoolValue)).void }
  def public=(value); end

  sig { returns(T.nilable(Hydro::Schemas::Github::V1::Entities::Repository)) }
  def repository; end

  sig { params(value: T.nilable(Hydro::Schemas::Github::V1::Entities::Repository)).void }
  def repository=(value); end

  sig { returns(T.nilable(Google::Protobuf::StringValue)) }
  def source_ref_name; end

  sig { params(value: T.nilable(Google::Protobuf::StringValue)).void }
  def source_ref_name=(value); end

  sig { returns(T.nilable(Google::Protobuf::StringValue)) }
  def source_subdir; end

  sig { params(value: T.nilable(Google::Protobuf::StringValue)).void }
  def source_subdir=(value); end

  sig { returns(T.any(Symbol, Integer)) }
  def status; end

  sig { params(value: T.any(Symbol, Integer)).void }
  def status=(value); end

  sig { returns(T.nilable(Google::Protobuf::StringValue)) }
  def tree_oid; end

  sig { params(value: T.nilable(Google::Protobuf::StringValue)).void }
  def tree_oid=(value); end
end
