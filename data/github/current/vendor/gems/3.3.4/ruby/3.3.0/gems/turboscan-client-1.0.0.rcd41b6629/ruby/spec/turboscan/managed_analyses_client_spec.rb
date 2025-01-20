# frozen_string_literal: true

require "spec_helper"
require "turboscan_vcr"

RSpec.describe Turboscan::ManagedAnalysesClient do
  let(:client) { described_class.new("http://localhost:8888/twirp", {content_type: "application/json"}) }

  it "can get managed analysis for a repo" do
    VCR.use_cassette("code-scanning/get-managed-analysis-info") do
      res = client.get_managed_analysis_info(repository_id: 351)
      expect(res.error).to be_nil
      expect(res.data.status_v2).to eq(:STABLE)
    end
  end

  it "can try to update the configuration" do
    VCR.use_cassette("code-scanning/managed-analyses-update") do
      res = client.update(repository_id: 123)
      expect(res.error).to be_nil
      expect(res.data.workflow_run_id).to eq(5)
    end
  end

  it "can try to update the languages in the configuration" do
    VCR.use_cassette("code-scanning/managed-analyses-update-languages") do
      res = client.update_languages(repository_id: 351)
      expect(res.error).to be_nil
      expect(res.data.workflow_run_id).to eq(5)
    end
  end
end
