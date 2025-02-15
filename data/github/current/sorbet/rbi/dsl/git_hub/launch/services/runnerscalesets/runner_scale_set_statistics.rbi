# typed: true

# DO NOT EDIT MANUALLY
# This is an autogenerated file for dynamic methods in `GitHub::Launch::Services::Runnerscalesets::RunnerScaleSetStatistics`.
# Please instead update this file by running `bin/tapioca dsl GitHub::Launch::Services::Runnerscalesets::RunnerScaleSetStatistics`.

class GitHub::Launch::Services::Runnerscalesets::RunnerScaleSetStatistics
  sig do
    params(
      total_acquired_jobs: T.nilable(Integer),
      total_assigned_jobs: T.nilable(Integer),
      total_available_jobs: T.nilable(Integer),
      total_busy_runners: T.nilable(Integer),
      total_idle_runners: T.nilable(Integer),
      total_registered_runners: T.nilable(Integer),
      total_running_jobs: T.nilable(Integer)
    ).void
  end
  def initialize(total_acquired_jobs: nil, total_assigned_jobs: nil, total_available_jobs: nil, total_busy_runners: nil, total_idle_runners: nil, total_registered_runners: nil, total_running_jobs: nil); end

  sig { void }
  def clear_total_acquired_jobs; end

  sig { void }
  def clear_total_assigned_jobs; end

  sig { void }
  def clear_total_available_jobs; end

  sig { void }
  def clear_total_busy_runners; end

  sig { void }
  def clear_total_idle_runners; end

  sig { void }
  def clear_total_registered_runners; end

  sig { void }
  def clear_total_running_jobs; end

  sig { returns(Integer) }
  def total_acquired_jobs; end

  sig { params(value: Integer).void }
  def total_acquired_jobs=(value); end

  sig { returns(Integer) }
  def total_assigned_jobs; end

  sig { params(value: Integer).void }
  def total_assigned_jobs=(value); end

  sig { returns(Integer) }
  def total_available_jobs; end

  sig { params(value: Integer).void }
  def total_available_jobs=(value); end

  sig { returns(Integer) }
  def total_busy_runners; end

  sig { params(value: Integer).void }
  def total_busy_runners=(value); end

  sig { returns(Integer) }
  def total_idle_runners; end

  sig { params(value: Integer).void }
  def total_idle_runners=(value); end

  sig { returns(Integer) }
  def total_registered_runners; end

  sig { params(value: Integer).void }
  def total_registered_runners=(value); end

  sig { returns(Integer) }
  def total_running_jobs; end

  sig { params(value: Integer).void }
  def total_running_jobs=(value); end
end
