# typed: true
# frozen_string_literal: true

GitHub.subscribe /^science\./ do |_name, _start, _ending, _transaction_id, payload|
  threshold       = Experiment.sample_threshold(payload[:name])
  save_sample     = T.let(false, T::Boolean)
  experiment_name = payload[:name]
  stats_prefix    = "science.#{experiment_name}"

  payload[:execution_order].each do |candidate_name|
    key = candidate_name.to_sym
    if payload[key] && (duration = payload[key][:duration])
      GitHub.dogstats.distribution "science.dist.time", duration,
        tags: ["experiment:#{experiment_name}", "behavior:#{candidate_name}"]
      if threshold && duration >= threshold
        save_sample = true
      end
    end
  end

  if save_sample
    context         = GitHub.context.to_hash.dup
    context[:actor] = context[:actor].login if context[:actor].present? && context[:actor].respond_to?(:login)
    context[:sample_threshold] = threshold
    payload = context.merge(payload).to_json

    ScienceEvent.push_sample(experiment_name, payload)
  end
end

GitHub.subscribe "science.match" do |_name, _start, _ending, _transaction_id, payload|
  experiment_name = payload[:name]
  GitHub.dogstats.increment "science", tags: ["experiment:#{experiment_name}", "result:match"]
end

GitHub.subscribe "science.ignore" do |_name, _start, _ending, _transaction_id, payload|
  experiment_name = payload[:name]
  stats_prefix    = "science.#{experiment_name}"

  GitHub.dogstats.increment "science", tags: ["experiment:#{experiment_name}", "result:ignored"]
end

GitHub.subscribe "science.mismatch" do |_name, _start, _ending, _transaction_id, payload|
  context         = GitHub.context.to_hash.dup
  context[:actor] = context[:actor].login if context[:actor].present? && context[:actor].respond_to?(:login)
  experiment_name = payload[:name]
  stats_prefix    = "science.#{experiment_name}"

  begin
    payload = context.merge(payload).to_json
  rescue ApplicationRecord::Base::UnsafeSerializationError => e
    message = "\n" + ScienceEvent::ERROR_MESSAGE + "\n" + e.message + "\n"
    raise ApplicationRecord::Base::UnsafeSerializationError, message
  end
  ScienceEvent.push_mismatch(experiment_name, payload)

  GitHub.dogstats.increment "science", tags: ["experiment:#{experiment_name}", "result:mismatch"]
end
