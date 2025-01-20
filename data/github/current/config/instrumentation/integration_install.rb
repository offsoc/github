# frozen_string_literal: true

GlobalInstrumenter.subscribe("integration_install") do |_, _, _, _, payload|
  type = payload[:trigger_type]
  originator = payload[:originator]
  actor = payload[:actor]

  if type && AutomaticAppInstallation::TRIGGER_HANDLERS.keys.include?(type) && originator && actor
    AutomaticAppInstallation.attempt_installation(trigger: type, originator: originator, actor: actor)
  end
end
