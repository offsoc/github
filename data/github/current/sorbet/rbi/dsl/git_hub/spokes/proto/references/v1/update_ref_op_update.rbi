# typed: true

# DO NOT EDIT MANUALLY
# This is an autogenerated file for dynamic methods in `GitHub::Spokes::Proto::References::V1::UpdateRefOpUpdate`.
# Please instead update this file by running `bin/tapioca dsl GitHub::Spokes::Proto::References::V1::UpdateRefOpUpdate`.

class GitHub::Spokes::Proto::References::V1::UpdateRefOpUpdate
  sig { params(oid: T.nilable(GitHub::Spokes::Proto::Types::V1::ObjectID)).void }
  def initialize(oid: nil); end

  sig { void }
  def clear_oid; end

  sig { returns(T.nilable(GitHub::Spokes::Proto::Types::V1::ObjectID)) }
  def oid; end

  sig { params(value: T.nilable(GitHub::Spokes::Proto::Types::V1::ObjectID)).void }
  def oid=(value); end
end
