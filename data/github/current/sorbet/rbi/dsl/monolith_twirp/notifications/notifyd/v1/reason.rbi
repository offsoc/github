# typed: true

# DO NOT EDIT MANUALLY
# This is an autogenerated file for dynamic methods in `MonolithTwirp::Notifications::Notifyd::V1::Reason`.
# Please instead update this file by running `bin/tapioca dsl MonolithTwirp::Notifications::Notifyd::V1::Reason`.

class MonolithTwirp::Notifications::Notifyd::V1::Reason
  sig { params(name: T.nilable(String)).void }
  def initialize(name: nil); end

  sig { void }
  def clear_name; end

  sig { returns(String) }
  def name; end

  sig { params(value: String).void }
  def name=(value); end
end
