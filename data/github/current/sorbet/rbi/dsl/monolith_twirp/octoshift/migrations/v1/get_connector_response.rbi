# typed: true

# DO NOT EDIT MANUALLY
# This is an autogenerated file for dynamic methods in `MonolithTwirp::Octoshift::Migrations::V1::GetConnectorResponse`.
# Please instead update this file by running `bin/tapioca dsl MonolithTwirp::Octoshift::Migrations::V1::GetConnectorResponse`.

class MonolithTwirp::Octoshift::Migrations::V1::GetConnectorResponse
  sig { params(connector: T.nilable(MonolithTwirp::Octoshift::Migrations::V1::Connector)).void }
  def initialize(connector: nil); end

  sig { void }
  def clear_connector; end

  sig { returns(T.nilable(MonolithTwirp::Octoshift::Migrations::V1::Connector)) }
  def connector; end

  sig { params(value: T.nilable(MonolithTwirp::Octoshift::Migrations::V1::Connector)).void }
  def connector=(value); end
end
