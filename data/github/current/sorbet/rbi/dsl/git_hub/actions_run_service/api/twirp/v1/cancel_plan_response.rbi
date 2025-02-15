# typed: true

# DO NOT EDIT MANUALLY
# This is an autogenerated file for dynamic methods in `GitHub::ActionsRunService::Api::Twirp::V1::CancelPlanResponse`.
# Please instead update this file by running `bin/tapioca dsl GitHub::ActionsRunService::Api::Twirp::V1::CancelPlanResponse`.

class GitHub::ActionsRunService::Api::Twirp::V1::CancelPlanResponse
  sig { params(plan_id: T.nilable(String)).void }
  def initialize(plan_id: nil); end

  sig { void }
  def clear_plan_id; end

  sig { returns(String) }
  def plan_id; end

  sig { params(value: String).void }
  def plan_id=(value); end
end
