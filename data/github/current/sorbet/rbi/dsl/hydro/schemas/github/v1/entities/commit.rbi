# typed: true

# DO NOT EDIT MANUALLY
# This is an autogenerated file for dynamic methods in `Hydro::Schemas::Github::V1::Entities::Commit`.
# Please instead update this file by running `bin/tapioca dsl Hydro::Schemas::Github::V1::Entities::Commit`.

class Hydro::Schemas::Github::V1::Entities::Commit
  sig { params(global_relay_id: T.nilable(String), oid: T.nilable(String), repository_id: T.nilable(Integer)).void }
  def initialize(global_relay_id: nil, oid: nil, repository_id: nil); end

  sig { void }
  def clear_global_relay_id; end

  sig { void }
  def clear_oid; end

  sig { void }
  def clear_repository_id; end

  sig { returns(String) }
  def global_relay_id; end

  sig { params(value: String).void }
  def global_relay_id=(value); end

  sig { returns(String) }
  def oid; end

  sig { params(value: String).void }
  def oid=(value); end

  sig { returns(Integer) }
  def repository_id; end

  sig { params(value: Integer).void }
  def repository_id=(value); end
end
