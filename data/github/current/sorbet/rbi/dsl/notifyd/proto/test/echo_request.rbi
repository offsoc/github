# typed: true

# DO NOT EDIT MANUALLY
# This is an autogenerated file for dynamic methods in `Notifyd::Proto::Test::EchoRequest`.
# Please instead update this file by running `bin/tapioca dsl Notifyd::Proto::Test::EchoRequest`.

class Notifyd::Proto::Test::EchoRequest
  sig { params(msg: T.nilable(String)).void }
  def initialize(msg: nil); end

  sig { void }
  def clear_msg; end

  sig { returns(String) }
  def msg; end

  sig { params(value: String).void }
  def msg=(value); end
end
