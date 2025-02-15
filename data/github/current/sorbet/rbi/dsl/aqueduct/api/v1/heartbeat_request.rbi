# typed: true

# DO NOT EDIT MANUALLY
# This is an autogenerated file for dynamic methods in `Aqueduct::Api::V1::HeartbeatRequest`.
# Please instead update this file by running `bin/tapioca dsl Aqueduct::Api::V1::HeartbeatRequest`.

class Aqueduct::Api::V1::HeartbeatRequest
  sig do
    params(
      app: T.nilable(String),
      client_id: T.nilable(String),
      job_id: T.nilable(String),
      queue: T.nilable(String)
    ).void
  end
  def initialize(app: nil, client_id: nil, job_id: nil, queue: nil); end

  sig { returns(String) }
  def app; end

  sig { params(value: String).void }
  def app=(value); end

  sig { void }
  def clear_app; end

  sig { void }
  def clear_client_id; end

  sig { void }
  def clear_job_id; end

  sig { void }
  def clear_queue; end

  sig { returns(String) }
  def client_id; end

  sig { params(value: String).void }
  def client_id=(value); end

  sig { returns(String) }
  def job_id; end

  sig { params(value: String).void }
  def job_id=(value); end

  sig { returns(String) }
  def queue; end

  sig { params(value: String).void }
  def queue=(value); end
end
