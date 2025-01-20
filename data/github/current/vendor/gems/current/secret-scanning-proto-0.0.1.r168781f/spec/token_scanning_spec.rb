# frozen_string_literal: true

require "secret_scanning_proto"
require "vcr"

VCR.configure do |c|
  c.cassette_library_dir = File.join(File.expand_path(__dir__), "fixtures/vcr_cassettes")
  c.hook_into :webmock
end

RSpec.describe GitHub::SecretScanning::Client do
  before(:example) do
    @client = GitHub::SecretScanning::Client.new("http://localhost:5000/twirp")
  end

  it "retrieves lists of tokens in a repository" do
    VCR.use_cassette("get_tokens") do
      response = @client.get_tokens(repository_id: 3)

      expect(response.error).to be_nil
      expect(response.data.tokens).not_to be_empty
      expect(response.data.tokens[0].repository_id).to eq(3)
      expect(response.data.resolved_count).to eq(0)
      expect(response.data.unresolved_count).to eq(1)
    end
  end

  it "retrieves a token in a repository" do
    VCR.use_cassette("get_token") do
      response = @client.get_token(repository_id: 3, token_id: 2)

      expect(response.error).to be_nil
      expect(response.data.token).not_to be_nil
      expect(response.data.token.repository_id).to eq(3)
      expect(response.data.token.id).to eq(2)
    end
  end

  it "resolves a token in a repository" do
    VCR.use_cassette("resolve_token") do
      response = @client.resolve_token(repository_id: 3, token_id: 2, resolution: :REVOKED)

      expect(response.error).to be_nil
      expect(response.data).not_to be_nil
    end
  end

  it "gets token counts in a repository" do
    VCR.use_cassette("get_token_counts") do
      response = @client.get_token_counts(repository_id: 1)

      expect(response.error).to be_nil
      expect(response.data.unresolved_count).to eq(1)
    end
  end
end
