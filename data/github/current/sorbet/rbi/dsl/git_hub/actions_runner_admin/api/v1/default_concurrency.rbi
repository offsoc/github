# typed: true

# DO NOT EDIT MANUALLY
# This is an autogenerated file for dynamic methods in `GitHub::ActionsRunnerAdmin::Api::V1::DefaultConcurrency`.
# Please instead update this file by running `bin/tapioca dsl GitHub::ActionsRunnerAdmin::Api::V1::DefaultConcurrency`.

class GitHub::ActionsRunnerAdmin::Api::V1::DefaultConcurrency
  sig do
    params(
      concurrency_value: T.nilable(Integer),
      plan: T.nilable(String),
      platform: T.nilable(String),
      tier: T.nilable(String)
    ).void
  end
  def initialize(concurrency_value: nil, plan: nil, platform: nil, tier: nil); end

  sig { void }
  def clear_concurrency_value; end

  sig { void }
  def clear_plan; end

  sig { void }
  def clear_platform; end

  sig { void }
  def clear_tier; end

  sig { returns(Integer) }
  def concurrency_value; end

  sig { params(value: Integer).void }
  def concurrency_value=(value); end

  sig { returns(String) }
  def plan; end

  sig { params(value: String).void }
  def plan=(value); end

  sig { returns(String) }
  def platform; end

  sig { params(value: String).void }
  def platform=(value); end

  sig { returns(String) }
  def tier; end

  sig { params(value: String).void }
  def tier=(value); end
end
