# typed: true
# frozen_string_literal: true

ActiveSupport::Notifications.subscribe "unpermitted_parameters.action_controller" do |_name, _started, _ended, _id, payload|
  if unpermitted_keys = payload[:keys]
    ex = ActionController::UnpermittedParameters.new(unpermitted_keys)
    Failbot.report(ex, app: "github-unpermitted-params")
  end
end
