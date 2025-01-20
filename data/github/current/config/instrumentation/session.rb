# frozen_string_literal: true

GitHub.subscribe "user_session.create" do |_event, _start, _ending, _transaction_id, _payload|
  GitHub.dogstats.increment "user_session", tags: ["action:create"]
end
