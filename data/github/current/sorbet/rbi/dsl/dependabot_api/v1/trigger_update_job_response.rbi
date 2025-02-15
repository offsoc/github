# typed: true

# DO NOT EDIT MANUALLY
# This is an autogenerated file for dynamic methods in `DependabotApi::V1::TriggerUpdateJobResponse`.
# Please instead update this file by running `bin/tapioca dsl DependabotApi::V1::TriggerUpdateJobResponse`.

class DependabotApi::V1::TriggerUpdateJobResponse
  sig { params(update_job: T.nilable(DependabotApi::V1::UpdateJobStatus)).void }
  def initialize(update_job: nil); end

  sig { void }
  def clear_update_job; end

  sig { returns(T.nilable(DependabotApi::V1::UpdateJobStatus)) }
  def update_job; end

  sig { params(value: T.nilable(DependabotApi::V1::UpdateJobStatus)).void }
  def update_job=(value); end
end
