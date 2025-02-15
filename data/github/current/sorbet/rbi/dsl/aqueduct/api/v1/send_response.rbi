# typed: true

# DO NOT EDIT MANUALLY
# This is an autogenerated file for dynamic methods in `Aqueduct::Api::V1::SendResponse`.
# Please instead update this file by running `bin/tapioca dsl Aqueduct::Api::V1::SendResponse`.

class Aqueduct::Api::V1::SendResponse
  sig { params(backend_name: T.nilable(String), job_id: T.nilable(String)).void }
  def initialize(backend_name: nil, job_id: nil); end

  sig { returns(String) }
  def backend_name; end

  sig { params(value: String).void }
  def backend_name=(value); end

  sig { void }
  def clear_backend_name; end

  sig { void }
  def clear_job_id; end

  sig { returns(String) }
  def job_id; end

  sig { params(value: String).void }
  def job_id=(value); end
end
