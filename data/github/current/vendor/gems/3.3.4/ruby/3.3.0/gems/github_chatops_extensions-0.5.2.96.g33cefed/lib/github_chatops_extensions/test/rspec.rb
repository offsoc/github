# frozen_string_literal: true

require_relative "../../github_chatops_extensions"

# Method to inject the stubs to simulate successful Duo 2FA
RSpec.shared_context "successful Duo 2FA" do
  before do
    m = instance_double(GitHubChatopsExtensions::Checks::Duo)
    expect(GitHubChatopsExtensions::Checks::Duo).to receive(:new).and_return(m)
    expect(m).to receive(:check_2fa).and_return(true)
  end
end

RSpec.shared_context "no Duo 2FA check" do
  before do
    expect(GitHubChatopsExtensions::Checks::Duo).not_to receive(:new)
  end
end

# Method to inject the stubs to simulate successful FIDO 2FA
RSpec.shared_context "successful FIDO 2FA" do
  before do
    m = instance_double(GitHubChatopsExtensions::Checks::Fido)
    expect(GitHubChatopsExtensions::Checks::Fido).to receive(:new).and_return(m)
    expect(m).to receive(:check_2fa).and_return(true)
  end
end

RSpec.shared_context "no FIDO 2FA check" do
  before do
    expect(GitHubChatopsExtensions::Checks::Fido).not_to receive(:new)
  end
end

# Method to inject the stubs to simulate successful LDAP lookup for entitlements
RSpec.shared_context "member of entitlement" do
  before do
    # "entitlement" must be defined with `let(:entitlement) { "foo/bar/baz" }` when the shared context is called.
    # See the spec for the vpn controller for example usage.
    m = instance_double(GitHubChatopsExtensions::Checks::Entitlements)
    expect(GitHubChatopsExtensions::Checks::Entitlements).to receive(:new).and_return(m)
    expect(m).to receive(:require_ldap_entitlement).with(entitlement, username: nil).and_return(true)
  end
end

RSpec.shared_context "no member of entitlement check" do
  before do
    expect(GitHubChatopsExtensions::Checks::Entitlements).not_to receive(:new)
  end
end

# Method to inject the stubs to simulate successful room check
RSpec.shared_context "successful room check" do
  before do
    m = instance_double(GitHubChatopsExtensions::Checks::Room)
    expect(GitHubChatopsExtensions::Checks::Room).to receive(:new).and_return(m)
    expect(m).to receive(:require_in_room).with(room).and_return(true)
  end
end

RSpec.shared_context "no room check" do
  before do
    expect(GitHubChatopsExtensions::Checks::Room).not_to receive(:new)
  end
end
