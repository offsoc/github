# frozen_string_literal: true

require "spec_helper"
require "turboscan_vcr"

RSpec.describe Turboscan::SuggestedFixesClient do
  let(:client) { described_class.new("http://localhost:8888/twirp", {content_type: "application/json"}) }

  it "can get suggested fix" do
    VCR.use_cassette("code-scanning/get-suggested-fix") do
      res = client.get_suggested_fix(repository_id: 123)
      expect(res.error).to be_nil
      expect(res.data.suggested_fix_alerts).not_to be_nil
    end
  end
end
