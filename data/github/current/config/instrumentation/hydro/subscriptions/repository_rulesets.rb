# typed: true
# frozen_string_literal: true

Hydro::EventForwarder.configure(source: GlobalInstrumenter) do
  subscribe("rule_suite.evaluate") do |payload|

    result = if RuleEngine::RuleSuite::RESULTS.include?(payload[:result])
      payload[:result].upcase.to_sym
    else
      :RESULT_UNKNOWN
    end

    message = {
      rule_suite_id: payload[:id],
      user: payload[:actor].is_a?(PublicKey) ? nil : serializer.user(payload[:actor]),
      public_key: payload[:actor].is_a?(PublicKey) ? serializer.public_key(payload[:actor]) : nil,
      repository: serializer.repository(payload[:repository]),
      before_oid: payload[:before_oid],
      after_oid: payload[:after_oid],
      policy_oid: payload[:policy_oid],
      ref_name: payload[:ref_name].force_encoding("UTF-8").scrub,
      result: result,
      rule_runs: payload[:rule_runs].map { |rule_run| serializer.rule_run(rule_run) }
    }

    publish(message, schema: "github.repositories.v1.RuleSuiteEvaluation")
  end
end
