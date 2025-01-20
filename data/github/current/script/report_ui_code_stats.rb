# typed: true
# frozen_string_literal: true

require_relative "../config/environment"
require "datadog_api_client"
require "octokit"
require "serviceowners"

class ReportUICodeStats
  DATADOG_API = DatadogAPIClient::V1::MetricsAPI.new

  require_relative "../test/test_helpers/linting_helpers"

  include LintingHelpers

  def a11y_meu
    denominator = meu_data_hash.sum { _1["count"] } # sum all counts to get denominator

    grade_percentages = Hash.new(0.0)

    meu_data_hash.each do |row|
      service = row["result"].split("#").last
      services_csv_entry = services_csv.find { _1["name"] == service }

      grade = if services_csv_entry && services_csv_entry["grade"].present?
        services_csv_entry["grade"].gsub("*", "_star").gsub("+", "_plus")
      else
        "unknown"
      end

      grade_percentages[grade] += (row["count"].to_f / denominator * 100)
    end

    t = Time.now
    timestamp = (t - t.sec - ((t.min % 60) * 60)).to_i
    series = []

    grade_percentages.each do |grade, percentage|
      series << DatadogAPIClient::V1::Series.new({
        metric: "ui_practices.a11y_grades.percent_of_meu",
        points: [[timestamp, percentage.to_s]], # Datadog needs floats to be sent as strings
        type: "gauge",
        tags: ["property:dotcom", "grade:#{grade}"]
      })
    end

    report_series(series)
  end

  def react_migration_by_controller_action
    denominator = meu_data_hash.sum { _1["count"] } # sum all counts to get denominator
    strategic_denominator = meu_data_hash.select { strategic_services.include?(_1["result"].split("#").last) }.sum { _1["count"] }

    react_actions = []
    strategic_routes_count = 0
    strategic_meu_percent = 0.0
    react_meu_percent = 0.0
    strategic_react_meu_percent = 0.0
    errors = []

    meu_data_hash.each do |item|
      controller, action, catalog_service = item["result"].split("#")

      # Catch underfined controllers/actions that may have moved since the MEU data snapshot
      begin
        action_source = controller.constantize.instance_method(action.to_sym).source
      rescue
        errors << item["result"]
      end

      next unless action_source.present? # Skip if we can't load the action source

      if strategic_services.include?(catalog_service)
        strategic_routes_count += 1
        strategic_meu_percent += (item["count"].to_f / denominator) * 100
      end

      # If the controller method mentions react in any way, we count it as using React in some capacity
      if action_source.downcase.include?("react")
        react_actions << item["result"]
        react_meu_percent += (item["count"].to_f / denominator) * 100
        strategic_react_meu_percent += (item["count"].to_f / strategic_denominator) * 100 if strategic_services.include?(catalog_service)
      end
    end

    percent_of_actions_using_react = react_actions.length.to_f / meu_data_hash.length * 100

    t = Time.now
    timestamp = (t - t.sec - ((t.min % 60) * 60)).to_i
    series = []

    series << DatadogAPIClient::V1::Series.new({
      metric: "ui_practices.strategic_services.percent_of_meu",
      points: [[timestamp, strategic_meu_percent.to_s]], # Datadog needs floats to be sent as strings
      type: "gauge",
      tags: ["property:dotcom"]
    })

    series << DatadogAPIClient::V1::Series.new({
      metric: "ui_practices.controller_actions_with_traffic.count",
      points: [[timestamp, meu_data_hash.length]],
      type: "gauge",
      tags: ["property:dotcom"]
    })

    series << DatadogAPIClient::V1::Series.new({
      metric: "ui_practices.strategic_controller_actions.count",
      points: [[timestamp, strategic_routes_count]],
      type: "gauge",
      tags: ["property:dotcom"]
    })

    series << DatadogAPIClient::V1::Series.new({
      metric: "ui_practices.react_controller_actions.count",
      points: [[timestamp, react_actions.length]],
      type: "gauge",
      tags: ["property:dotcom"]
    })

    series << DatadogAPIClient::V1::Series.new({
      metric: "ui_practices.react_controller_actions.percent_of_total",
      points: [[timestamp, percent_of_actions_using_react.to_s]], # Datadog needs floats to be sent as strings
      type: "gauge",
      tags: ["property:dotcom"]
    })

    series << DatadogAPIClient::V1::Series.new({
      metric: "ui_practices.react_controller_actions.percent_of_meu",
      points: [[timestamp, react_meu_percent.to_s]], # Datadog needs floats to be sent as strings
      type: "gauge",
      tags: ["property:dotcom"]
    })

    series << DatadogAPIClient::V1::Series.new({
      metric: "ui_practices.react_controller_actions.percent_of_strategic_meu",
      points: [[timestamp, strategic_react_meu_percent.to_s]], # Datadog needs floats to be sent as strings
      type: "gauge",
      tags: ["property:dotcom"]
    })

    series << DatadogAPIClient::V1::Series.new({
      metric: "ui_practices.react_controller_actions.skipped",
      points: [[timestamp, errors.length]],
      type: "gauge",
      tags: ["property:dotcom"]
    })

    report_series(series)
  end

  def react_migration_stats
    controllers =
      grep(
        /render/,
        options: %w[-in], paths: %w[app packages]
      ).lines.
      map { _1.split(":").first }.
      uniq.
      select { _1.include?("controller.rb") }

    react_controllers =
      grep(
        /(react_bundle_name|render_react_app|layout \"memex\")/,
        options: %w[-in], paths: %w[app packages]
      ).lines
      .map { _1.split(":").first }.
      uniq.
      select { _1.include?("controller.rb") } << "app/controllers/blackbird_controller_methods.rb" # hardcoded due to dynamic nature of the controller

    strategic_controllers = controllers.select do |controller|
      spec = serviceowners.spec_for_path(controller)
      if spec.nil?
        false
      else
        strategic_services.include?("github/#{spec.service.name}")
      end
    end

    strategic_react_controllers = react_controllers.select do |controller|
      spec = serviceowners.spec_for_path(controller)
      if spec.nil?
        false
      else
        strategic_services.include?("github/#{spec.service.name}")
      end
    end

    t = Time.now
    timestamp = (t - t.sec - ((t.min % 60) * 60)).to_i
    series = []

    series << DatadogAPIClient::V1::Series.new({
      metric: "ui_practices.controllers.count",
      points: [[timestamp, react_controllers.length]],
      type: "gauge",
      tags: ["property:dotcom", "uses_react:true"]
    })

    series << DatadogAPIClient::V1::Series.new({
      metric: "ui_practices.controllers.count",
      points: [[timestamp, controllers.length - react_controllers.length]],
      type: "gauge",
      tags: ["property:dotcom", "uses_react:false"]
    })

    series << DatadogAPIClient::V1::Series.new({
      metric: "ui_practices.strategic_controllers.count",
      points: [[timestamp, strategic_react_controllers.length]],
      type: "gauge",
      tags: ["property:dotcom", "uses_react:true"]
    })

    series << DatadogAPIClient::V1::Series.new({
      metric: "ui_practices.strategic_controllers.count",
      points: [[timestamp, strategic_controllers.length - strategic_react_controllers.length]],
      type: "gauge",
      tags: ["property:dotcom", "uses_react:false"]
    })

    report_series(series)
  end

  private

  def serviceowners
    @serviceowners ||= Serviceowners::Main.new
  end

  def meu_data_hash
    @_meu_data_hash ||=
      begin
        # JSON output from https://data.githubapp.com/sql/26ea0e79-197f-45ff-b072-b4c111b97b44,
        # converted to JSON array as the JSON output by default is not valid JSON, just lines of hashes
        file = File.read(File.join(__dir__, "report_ui_code_stats/meu.json"))
        data = JSON.parse(file)

        # Paths to ignore from stats
        ignore_paths = [
          "Voltron::IssuesFragmentsController#issue_conversation_sidebar#github/issues", # ignore Voltron fragment so we don't overcount
          "Voltron::IssuesFragmentsController#issue_conversation_content#github/issues", # ignore Voltron fragment so we don't overcount
          "Voltron::PullRequestsFragmentsController#conversation_sidebar#github/pull_requests", # ignore Voltron fragment so we don't overcount
          "Voltron::PullRequestsFragmentsController#conversation_content#github/pull_requests", # ignore Voltron fragment so we don't overcount
          "Voltron::CommitFragmentsController#commit_show_header#github/repos", # ignore Voltron fragment so we don't overcount
          "Voltron::CommitFragmentsController#commit_show_contents#github/repos", # ignore Voltron fragment so we don't overcount
          "BlobController#raw#github/repos" # Ignore raw path as it does not serve UI
        ]

        data = data.select do |item|
          !ignore_paths.include?(item["result"])
        end

        data
      end
  end

  def services_csv
    @_services_csv ||=
      begin
        client = Octokit::Client.new(access_token: ENV["GH_TOKEN"])
        governance_csv = client.contents("github/accessibility-governance", path: "data/services.csv")

        CSV.new(
          Base64.decode64(governance_csv[:content]).force_encoding("UTF-8"), headers: true
        ).map { |row| T.unsafe(row).to_h }
      end
  end

  def strategic_services
    @_strategic_services ||=
      begin
        client = Octokit::Client.new(access_token: ENV["GH_TOKEN"])
        governance_csv = client.contents("github/accessibility-governance", path: "data/services.csv")

        services_csv.filter { |row| T.unsafe(row)["isStrategic"] == "TRUE" }
        .map { |h| T.unsafe(h)["name"] }
      end
  end

  def report_series(series)
    series.each do |count|
      tag_string = count.tags.empty? ? "" : "[#{count.tags.join(', ')}]"

      puts "DOGSTATS: #{count.metric} #{tag_string} #{count.points.first[1]}|g"
    end
    puts "\n\n"

    # Only send series if the event name is schedule. This allows us to test a change
    # with the push: action event or local cli without polluting the datadog metrics.
    if ENV["GITHUB_EVENT_NAME"] == "schedule"
      begin
        DATADOG_API.submit_metrics(DatadogAPIClient::V1::MetricsPayload.new({ series: series }))
      rescue DatadogAPIClient::APIError => e
        puts "Error when calling MetricsAPI->submit_metrics: #{e}"
      end
    end
  end
end

report = ReportUICodeStats.new
report.react_migration_by_controller_action
report.react_migration_stats
report.a11y_meu
