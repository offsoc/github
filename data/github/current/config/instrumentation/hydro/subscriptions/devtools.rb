# typed: true
# frozen_string_literal: true
Hydro::EventForwarder.configure(source: GitHub) do
  subscribe("feature.enable") do |payload|
    publish_event(payload)
  end

  subscribe("feature.disable") do |payload|
    publish_event(payload)
  end

  def publish_event(payload)
    T.bind(self, Hydro::EventForwarder)

    message = {
      feature_name: payload[:feature_name],
      operation: get_operation(payload[:operation]),
      gate_name: get_gate_name(payload[:gate_name]),
      result: payload[:result],
      subject: payload[:subject],
      subject_class: payload[:subject_class],
      subject_id: payload[:subject_id].to_s
    }

    publish(message, schema: "devtools.v0.FeatureFlagToggle")
  end

  def get_operation(instrumenter_operation)
    case instrumenter_operation
    when :enable then :ENABLE
    when :disable then :DISABLE
    else :OPERATION_UNKNOWN
    end
  end

  def get_gate_name(instrumenter_gate_name)
    case instrumenter_gate_name
    when :actor then :ACTOR
    when :group then :GROUP
    when :percentage_of_actors then :PERCENTAGE_OF_ACTORS
    when :percentage_of_time then :PERCENTAGE_OF_TIME
    when :boolean then :BOOLEAN
    else :GATE_NAME_UNKNOWN
    end
  end
end
