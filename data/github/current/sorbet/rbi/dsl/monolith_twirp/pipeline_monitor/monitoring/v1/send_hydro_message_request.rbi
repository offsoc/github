# typed: true

# DO NOT EDIT MANUALLY
# This is an autogenerated file for dynamic methods in `MonolithTwirp::PipelineMonitor::Monitoring::V1::SendHydroMessageRequest`.
# Please instead update this file by running `bin/tapioca dsl MonolithTwirp::PipelineMonitor::Monitoring::V1::SendHydroMessageRequest`.

class MonolithTwirp::PipelineMonitor::Monitoring::V1::SendHydroMessageRequest
  sig { params(message: T.nilable(String), schema: T.nilable(String), topic: T.nilable(String)).void }
  def initialize(message: nil, schema: nil, topic: nil); end

  sig { void }
  def clear_message; end

  sig { void }
  def clear_schema; end

  sig { void }
  def clear_topic; end

  sig { returns(String) }
  def message; end

  sig { params(value: String).void }
  def message=(value); end

  sig { returns(String) }
  def schema; end

  sig { params(value: String).void }
  def schema=(value); end

  sig { returns(String) }
  def topic; end

  sig { params(value: String).void }
  def topic=(value); end
end
