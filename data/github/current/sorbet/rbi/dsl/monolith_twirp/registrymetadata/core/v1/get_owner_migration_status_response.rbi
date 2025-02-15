# typed: true

# DO NOT EDIT MANUALLY
# This is an autogenerated file for dynamic methods in `MonolithTwirp::Registrymetadata::Core::V1::GetOwnerMigrationStatusResponse`.
# Please instead update this file by running `bin/tapioca dsl MonolithTwirp::Registrymetadata::Core::V1::GetOwnerMigrationStatusResponse`.

class MonolithTwirp::Registrymetadata::Core::V1::GetOwnerMigrationStatusResponse
  sig { params(owner_id: T.nilable(Integer), status: T.nilable(T.any(Symbol, Integer))).void }
  def initialize(owner_id: nil, status: nil); end

  sig { void }
  def clear_owner_id; end

  sig { void }
  def clear_status; end

  sig { returns(Integer) }
  def owner_id; end

  sig { params(value: Integer).void }
  def owner_id=(value); end

  sig { returns(T.any(Symbol, Integer)) }
  def status; end

  sig { params(value: T.any(Symbol, Integer)).void }
  def status=(value); end
end
