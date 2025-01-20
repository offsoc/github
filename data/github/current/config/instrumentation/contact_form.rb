# frozen_string_literal: true

GitHub.subscribe "contact_form.blacklisted" do |_name, _start, _ending, _transaction_id, _payload|
  GitHub.dogstats.increment("contact_form.blacklisted")
end

GitHub.subscribe "contact_form.honeypot" do |_name, _start, _ending, _transaction_id, _payload|
  GitHub.dogstats.increment("contact_form.honeypot")
end

GitHub.subscribe "contact_form.spam" do |_name, _start, _ending, _transaction_id, _payload|
  GitHub.dogstats.increment("contact_form.spam")
end

GitHub.subscribe "contact_form.success" do |_name, _start, _ending, _transaction_id, payload|
  tags = payload.map { |k, v| "#{k}:#{v}" }
  GitHub.dogstats.increment("contact_form.success", tags: tags)
end

GitHub.subscribe "contact_form.ratelimited" do |_name, _start, _ending, _transaction_id, _payload|
  GitHub.dogstats.increment("contact_form.ratelimited")
end
