# typed: true

# DO NOT EDIT MANUALLY
# This is an autogenerated file for dynamic methods in `Notifyd::Proto::RoutingSettings::Page`.
# Please instead update this file by running `bin/tapioca dsl Notifyd::Proto::RoutingSettings::Page`.

class Notifyd::Proto::RoutingSettings::Page
  sig { params(cursor: T.nilable(String), limit: T.nilable(Integer)).void }
  def initialize(cursor: nil, limit: nil); end

  sig { void }
  def clear_cursor; end

  sig { void }
  def clear_limit; end

  sig { returns(String) }
  def cursor; end

  sig { params(value: String).void }
  def cursor=(value); end

  sig { returns(Integer) }
  def limit; end

  sig { params(value: Integer).void }
  def limit=(value); end
end
