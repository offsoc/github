# typed: true

# DO NOT EDIT MANUALLY
# This is an autogenerated file for dynamic methods in `Hydro::Schemas::Github::Actions::V0::CacheUsage`.
# Please instead update this file by running `bin/tapioca dsl Hydro::Schemas::Github::Actions::V0::CacheUsage`.

class Hydro::Schemas::Github::Actions::V0::CacheUsage
  sig do
    params(
      active_caches_count: T.nilable(Integer),
      active_caches_size_in_bytes: T.nilable(Integer),
      created_at: T.nilable(Google::Protobuf::Timestamp),
      global_id: T.nilable(String)
    ).void
  end
  def initialize(active_caches_count: nil, active_caches_size_in_bytes: nil, created_at: nil, global_id: nil); end

  sig { returns(Integer) }
  def active_caches_count; end

  sig { params(value: Integer).void }
  def active_caches_count=(value); end

  sig { returns(Integer) }
  def active_caches_size_in_bytes; end

  sig { params(value: Integer).void }
  def active_caches_size_in_bytes=(value); end

  sig { void }
  def clear_active_caches_count; end

  sig { void }
  def clear_active_caches_size_in_bytes; end

  sig { void }
  def clear_created_at; end

  sig { void }
  def clear_global_id; end

  sig { returns(T.nilable(Google::Protobuf::Timestamp)) }
  def created_at; end

  sig { params(value: T.nilable(Google::Protobuf::Timestamp)).void }
  def created_at=(value); end

  sig { returns(String) }
  def global_id; end

  sig { params(value: String).void }
  def global_id=(value); end
end
