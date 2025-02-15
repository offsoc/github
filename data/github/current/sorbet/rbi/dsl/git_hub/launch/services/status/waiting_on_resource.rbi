# typed: true

# DO NOT EDIT MANUALLY
# This is an autogenerated file for dynamic methods in `GitHub::Launch::Services::Status::WaitingOnResource`.
# Please instead update this file by running `bin/tapioca dsl GitHub::Launch::Services::Status::WaitingOnResource`.

class GitHub::Launch::Services::Status::WaitingOnResource
  sig do
    params(
      identifier: T.nilable(String),
      job_external_id: T.nilable(String),
      run_external_id: T.nilable(String)
    ).void
  end
  def initialize(identifier: nil, job_external_id: nil, run_external_id: nil); end

  sig { void }
  def clear_identifier; end

  sig { void }
  def clear_job_external_id; end

  sig { void }
  def clear_run_external_id; end

  sig { returns(String) }
  def identifier; end

  sig { params(value: String).void }
  def identifier=(value); end

  sig { returns(String) }
  def job_external_id; end

  sig { params(value: String).void }
  def job_external_id=(value); end

  sig { returns(String) }
  def run_external_id; end

  sig { params(value: String).void }
  def run_external_id=(value); end
end
