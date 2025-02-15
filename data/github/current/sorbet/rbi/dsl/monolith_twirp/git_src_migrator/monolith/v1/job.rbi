# typed: true

# DO NOT EDIT MANUALLY
# This is an autogenerated file for dynamic methods in `MonolithTwirp::GitSrcMigrator::Monolith::V1::Job`.
# Please instead update this file by running `bin/tapioca dsl MonolithTwirp::GitSrcMigrator::Monolith::V1::Job`.

class MonolithTwirp::GitSrcMigrator::Monolith::V1::Job
  sig do
    params(
      conclusion: T.nilable(T.any(Symbol, Integer)),
      job_completed_at: T.nilable(Google::Protobuf::Timestamp),
      job_id: T.nilable(Integer),
      job_name: T.nilable(String),
      job_started_at: T.nilable(Google::Protobuf::Timestamp),
      status: T.nilable(T.any(Symbol, Integer))
    ).void
  end
  def initialize(conclusion: nil, job_completed_at: nil, job_id: nil, job_name: nil, job_started_at: nil, status: nil); end

  sig { void }
  def clear_conclusion; end

  sig { void }
  def clear_job_completed_at; end

  sig { void }
  def clear_job_id; end

  sig { void }
  def clear_job_name; end

  sig { void }
  def clear_job_started_at; end

  sig { void }
  def clear_status; end

  sig { returns(T.any(Symbol, Integer)) }
  def conclusion; end

  sig { params(value: T.any(Symbol, Integer)).void }
  def conclusion=(value); end

  sig { returns(T.nilable(Google::Protobuf::Timestamp)) }
  def job_completed_at; end

  sig { params(value: T.nilable(Google::Protobuf::Timestamp)).void }
  def job_completed_at=(value); end

  sig { returns(Integer) }
  def job_id; end

  sig { params(value: Integer).void }
  def job_id=(value); end

  sig { returns(String) }
  def job_name; end

  sig { params(value: String).void }
  def job_name=(value); end

  sig { returns(T.nilable(Google::Protobuf::Timestamp)) }
  def job_started_at; end

  sig { params(value: T.nilable(Google::Protobuf::Timestamp)).void }
  def job_started_at=(value); end

  sig { returns(T.any(Symbol, Integer)) }
  def status; end

  sig { params(value: T.any(Symbol, Integer)).void }
  def status=(value); end
end
