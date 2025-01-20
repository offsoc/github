# typed: true
# frozen_string_literal: true

# Record stats for reported exceptions.
#
# data                   - a Hash of reported exception data
# data["app"]            - the bucket that the exception was reported to (.e.g. "github",
#                         "github-user", etc)
# data["report_status"]  - whether or not the report succeeded (`success` or `error`)
# data["elapsed_ms"]     - Time to send report in milliseconds
# data["exception_type"] - If the status is `failure`, then the exception that was
#                          thrown when the report failed.
# data["action"]         - If the status is `failure`, then the step in the reporting
#                          process at which the report failed
# data["exception"]      - If the status if `failure`, then the exception that failbot encountered
GitHub.subscribe "report.failbot" do |_name, _start, _ending, _transaction_id, data|
  if GitHub.enterprise?
    GitHub.stats.increment "exception.#{data["app"]}.count"
  else
    tags = [
      "application:#{data["app"]}",
      "status:#{data["report_status"]}"
    ]
    tags << "exception:#{data["exception_type"]}" if data.key?("exception_type")
    tags << "action:#{data["action"]}" if data.key?("action")

    GitHub.dogstats.distribution("failbot.report", data.fetch("elapsed_ms", 0), tags: tags)
  end
end
