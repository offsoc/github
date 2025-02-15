# typed: true

# DO NOT EDIT MANUALLY
# This is an autogenerated file for dynamic methods in `Licensify::Services::V1::SyncOrganizationMembershipsRequest`.
# Please instead update this file by running `bin/tapioca dsl Licensify::Services::V1::SyncOrganizationMembershipsRequest`.

class Licensify::Services::V1::SyncOrganizationMembershipsRequest
  sig { params(entityId: T.nilable(Integer), entityType: T.nilable(T.any(Symbol, Integer))).void }
  def initialize(entityId: nil, entityType: nil); end

  sig { void }
  def clear_entityId; end

  sig { void }
  def clear_entityType; end

  sig { returns(Integer) }
  def entityId; end

  sig { params(value: Integer).void }
  def entityId=(value); end

  sig { returns(T.any(Symbol, Integer)) }
  def entityType; end

  sig { params(value: T.any(Symbol, Integer)).void }
  def entityType=(value); end
end
