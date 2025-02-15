# typed: true

# DO NOT EDIT MANUALLY
# This is an autogenerated file for dynamic methods in `MonolithTwirp::Copilot::Users::V1::GetCopilotUserRequest`.
# Please instead update this file by running `bin/tapioca dsl MonolithTwirp::Copilot::Users::V1::GetCopilotUserRequest`.

class MonolithTwirp::Copilot::Users::V1::GetCopilotUserRequest
  sig { params(analytics_tracking_id: T.nilable(String), id: T.nilable(Integer)).void }
  def initialize(analytics_tracking_id: nil, id: nil); end

  sig { returns(String) }
  def analytics_tracking_id; end

  sig { params(value: String).void }
  def analytics_tracking_id=(value); end

  sig { void }
  def clear_analytics_tracking_id; end

  sig { void }
  def clear_id; end

  sig { returns(Integer) }
  def id; end

  sig { params(value: Integer).void }
  def id=(value); end
end
