# typed: true

# DO NOT EDIT MANUALLY
# This is an autogenerated file for dynamic methods in `Notifyd::Proto::RoutingSettings::DeleteRequest`.
# Please instead update this file by running `bin/tapioca dsl Notifyd::Proto::RoutingSettings::DeleteRequest`.

class Notifyd::Proto::RoutingSettings::DeleteRequest
  sig { params(id: T.nilable(Integer)).void }
  def initialize(id: nil); end

  sig { void }
  def clear_id; end

  sig { returns(Integer) }
  def id; end

  sig { params(value: Integer).void }
  def id=(value); end
end
