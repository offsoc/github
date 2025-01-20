# frozen_string_literal: true
require "json"

require "spec_helper"
require "turboscan_vcr"

RSpec.describe Turboscan::ResultsClient do
  let(:client) { described_class.new("http://localhost:8888/twirp") }
  let(:client_json) { described_class.new("http://localhost:8888/twirp", {content_type: "application/json"}) }

  it "retrieves lists of results for a repository" do
    VCR.use_cassette("code-scanning/get-alerts-results") do
      res = client_json.get_alerts(repository_id: 351)
      expect(res.error).to be_nil
      expect(res.data.results).not_to be_empty
      expect(res.data.results[0].most_recent_instance).not_to be_nil
      expect(res.data.open_count).to be_an_instance_of Integer
      expect(res.data.resolved_count).to be_an_instance_of Integer
      expect(res.data.analysis_exists).to be true
    end
  end

  it "handles repo with no results" do
    VCR.use_cassette("results-no-results") do
      res = client_json.get_alerts(repository_id: 24)
      expect(res.error).to be_nil
      expect(res.data.results).to be_empty
    end
  end

  it "retrieves detail of a single result" do
    VCR.use_cassette("result") do
      res = client_json.get_alert(repository_id: 23, number: 1)
      expect(res.error).to be_nil
      expect(res.data.result).not_to be_nil
      expect(res.data.result.number).to eq 1
      expect(res.data.related_locations).not_to be_nil
      expect(res.data.rule_tags).not_to be_nil
      expect(res.data.query_uri).not_to be_nil
    end
  end

  it "retrieves code paths" do
    VCR.use_cassette("code_paths") do
      res = client_json.get_code_paths(repository_id: 23, number: 5)
      expect(res.error).to be_nil
      expect(res.data.code_paths).not_to be_nil
      expect(res.data.code_paths[0].steps[0].location.file_path).not_to be_nil
    end
  end

  it "allows rule tags to be retrieved" do
    VCR.use_cassette("rule_tags", match_requests_on: [:turbomatch], persist_with: :turboscan) do
      res = client_json.get_rule_tags(repository_id: 23)
      expect(res.error).to be_nil
      expect(res.data.rule_tags).not_to be_empty
    end
  end

  it "allows rules to be retrieved" do
    VCR.use_cassette("rules") do
      res = client_json.get_rules(repository_id: 23)
      expect(res.error).to be_nil
      expect(res.data.rules).not_to be_empty
    end
  end

  it "returns counts" do
    VCR.use_cassette("counts") do
      res = client_json.get_alerts(repository_id: 23)
      expect(res.error).to be_nil
      expect(res.data.open_count).to be_an_instance_of Integer
    end
  end

  it "return the pr alerts" do
    VCR.use_cassette("pr_alerts") do
      res = client_json.pull_request_alerts(repository_id: 24, base_ref_bytes: "main", head_commit_oid: "7b5ec67dbdeb1e469aaaaaa67d0835f69d79c91b")
      expect(res.error).to be_nil
      expect(res.data.new_alerts).not_to be_empty
    end
  end

  it "returns results for annotations" do
    VCR.use_cassette("annotations") do
      res = client_json.annotations(repository_id: 22, numbers: [7, 9])
      expect(res.error).to be_nil
      expect(res.data.results.length).to eq 2
      expect(res.data.results[0].result.number).to eq 7
      expect(res.data.results[1].result.number).to eq 9
    end
  end

  it "provides tool names used in analyses" do
    VCR.use_cassette("tool_names") do
      res = client_json.tool_names(repository_id: 4)
      expect(res.error).to be_nil
      expect(res.data.tools.length).to eq 3
      expect(res.data.tools[0].name).to eq "Security audit for python by bandit"
      expect(res.data.tools[1].name).to eq "CodeQL command-line toolchain"
      expect(res.data.tools[2].name).to eq "Golang security checks by gosec"
    end
  end

  it "updates alerts status" do
    VCR.use_cassette("set_alerts_status") do
      res = client_json.set_alerts_status(repository_id: 23, numbers: [1, 2], resolver_id: 2, resolution: :USED_IN_TESTS)
      expect(res.error).to be_nil
      expect(res.data.results.length).to eq 2
      expect(res.data.results[0].resolver_id).to eq 2
      expect(res.data.results[0].resolution).to eq :USED_IN_TESTS
    end
  end

  it "retrieves analyses" do
    VCR.use_cassette("analyses") do
      res = client_json.get_analyses(repository_id: 23, tool: "codeQL", ref_names_bytes: ["a", "b"])
      expect(res.error).to be_nil
      expect(res.data.analyses).not_to be_nil
      expect(res.data.analyses.length).to eq 1
      expect(res.data.analyses[0].errors).not_to be_nil
    end
  end

  it "retrieves analysis" do
    VCR.use_cassette("analysis") do
      res = client_json.get_analysis(repository_id: 2, analysis_id: 1)
      expect(res.error).to be_nil
      expect(res.data.analysis).not_to be_nil
      expect(res.data.analysis.id).to eq 1
    end
  end

  it "retrieves analysis sarif" do
    VCR.use_cassette("code-scanning/analysis-sarif") do
      res = client_json.get_analysis_sarif(repository_id: 2, analysis_id: 1)
      expect(res.error).to be_nil
      expect(res.data.sarif).not_to be_nil
      expect(res.data.sarif).to start_with '{"runs":[{"artifacts":[{"location":{"index":0,"uri":"generated.c"}},{"location":'
    end
  end

  it "retrieves tool status" do
    VCR.use_cassette("code-scanning/get-tool-status") do
      res = client_json.get_tool_status(repository_id: 2, ref: "main")
      expect(res.error).to be_nil
      expect(res.data.tools).not_to be_nil
    end
  end

  it "retrieves tool status rules" do
    VCR.use_cassette("code-scanning/get-tool-status-rules") do
      res = client_json.get_tool_status_rules(repository_id: 2, ref: "main", tool: "CodeQL")
      expect(res.error).to be_nil
      expect(res.data.categories).not_to be_nil
    end
  end

  it "retrieves extracted files" do
    VCR.use_cassette("code-scanning/get-extracted-files-with-baseline-fully-extracted") do
      res = client_json.get_files_extracted(repository_id: 351, ref: "main", tool: "CodeQL")
      expect(res.error).to be_nil
      expect(res.data.categories).not_to be_blank
    end
  end

  it "return timeline events" do
    VCR.use_cassette("code-scanning/get-timeline-events") do
      res = client_json.get_timeline_events(repository_id: 11, number: 1)
      expect(res.data.events.length).to eq 6
      expect(res.data.events[0].type).to eq :TIMELINE_EVENT_TYPE_ALERT_CREATED
      expect(res.data.events[1].type).to eq :TIMELINE_EVENT_TYPE_ALERT_CLOSED_BECAME_FIXED
      expect(res.data.events[2].type).to eq :TIMELINE_EVENT_TYPE_ALERT_REAPPEARED
      expect(res.data.events[3].type).to eq :TIMELINE_EVENT_TYPE_ALERT_APPEARED_IN_BRANCH
      expect(res.data.events[4].type).to eq :TIMELINE_EVENT_TYPE_ALERT_CLOSED_BY_USER
      expect(res.data.events[4].resolution).to eq :USED_IN_TESTS
      expect(res.data.events[5].type).to eq :TIMELINE_EVENT_TYPE_ALERT_REOPENED_BY_USER
    end
  end

  it "retrieves alert titles" do
    VCR.use_cassette("code-scanning/alert-titles") do
      res = client_json.get_alert_titles(repository_ids: [10, 15, 15], alert_numbers: [1, 1, 2])
      expect(res.error).to be_nil
      expect(res.data.repository_ids).not_to be_nil
      expect(res.data.repository_ids).to start_with 15
      expect(res.data.alert_numbers).not_to be_nil
      expect(res.data.alert_numbers).to start_with 1
      expect(res.data.titles).not_to be_nil
      expect(res.data.titles.length).to eq 1
      expect(res.data.titles.first).to start_with "Something short"
    end
  end

  it "provides delivery status, including errors even if there are also analyses" do
    VCR.use_cassette("code-scanning/delivery-error") do
      res = client_json.get_delivery(repository_id: 352, sarif_id: "e4e4bbcd-9f4e-4ddd-8e83-66eb9127a6df")
      expect(res.error).to be_nil
      expect(res.data.analysis_count).to eq 1
      expect(res.data.errors).not_to be_empty
      expect(res.data.errors[0].error_type).to eq "Unrecoverable delivery"
    end
  end

  it "provides delivery status for successful analyses" do
    VCR.use_cassette("code-scanning/delivery-no-error") do
      res = client_json.get_delivery(repository_id: 353, sarif_id: "ecf5f4e0-5c8a-4284-8aad-d61b38b1145e")
      expect(res.error).to be_nil
      expect(res.data.errors).to be_empty
      expect(res.data.analysis_count).to eq 1
    end
  end

  it "provides delivery status, handling the 404 case" do
    VCR.use_cassette("code-scanning/delivery-not-found") do
      res = client_json.get_delivery(repository_id: 353, sarif_id: "0360fa62-cfc8-43e7-a8d9-22a77911eb8b")
      expect(res.error).not_to be_nil
      expect(res.error.code).to eq :not_found
      expect(res.data).to be_nil
    end
  end

  context "with organization scope" do
    it "allows rules to be retrieved" do
      VCR.use_cassette("code-scanning/org-rules") do
        res = client_json.get_rules_for_org(owner_ids: [71])
        expect(res.error).to be_nil
        expect(res.data.rules).not_to be_empty
      end
    end

    it "allows tools to be retrieved" do
      VCR.use_cassette("code-scanning/org-tools") do
        res = client_json.get_tool_names_for_org(owner_ids: [71])
        expect(res.error).to be_nil
        expect(res.data.tools).not_to be_empty
      end
    end

    it "allows repositories to be retrieved" do
      VCR.use_cassette("code-scanning/org-repositories") do
        res = client_json.get_repository_i_ds_for_org(owner_ids: [71])
        expect(res.error).to be_nil
        expect(res.data.repositories).not_to be_empty
      end
    end

    it "allows severities to be retrieved" do
      VCR.use_cassette("code-scanning/org-severities") do
        res = client_json.get_severities_for_org(owner_ids: [71])
        expect(res.error).to be_nil
        expect(res.data.severities).not_to be_empty
      end
    end
  end

  context "with campaigns scope" do
    it "allows counts to be retrieved by repo number" do
      VCR.use_cassette("code-scanning/counts-by-repo-numbers") do
        res = client_json.get_counts_by_repo_numbers(owner_ids: [71], repo_numbers: [{repository_id: 350, number: 1}, {repository_id: 351, number: 3}])
        expect(res.error).to be_nil
        expect(res.data.open_count).to eq 2
        expect(res.data.closed_count).to eq 0
      end
    end

  end
end
