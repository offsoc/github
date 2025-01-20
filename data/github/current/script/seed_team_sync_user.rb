# typed: true
# frozen_string_literal: true

require_relative "seeds/factory_bot_loader"

email = "team-sync@water9.onmicrosoft.com"
username = "team-sync-user"
if !User.where(login: username).first.nil?
  puts "team-sync-user already exists"
else
  user = FactoryBot::create(:user, :verified, email: email, login: username)
  team_sync_org = T.must(Organization.where(login: "team-sync").first)
  saml_user_data = Platform::Provisioning::SamlUserData.new([
  {
      "name": "http://schemas.microsoft.com/identity/claims/displayname",
      "value": "Team Sync",
      "metadata": {}
    },
    {
      "name": "http://schemas.microsoft.com/identity/claims/objectidentifier",
      "value": "b9628ffa-3d06-4e95-a7f5-ef9c2e2e2df3",
      "metadata": {}
    },
    {
      "name": "http://schemas.microsoft.com/identity/claims/tenantid",
      "value": "487cf9f2-7131-4129-82ad-ed13392bee83",
      "metadata": {}
    },
    {
      "name": "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name",
      "value": "team-sync@water9.onmicrosoft.com",
      "metadata": {}
    },
    {
      "name": "NameID",
      "value": "564f7yPJSySQ3GUjdPrhlDRys2jI_xOyFto69qK0rwo",
      "metadata": { "Format": "urn:oasis:names:tc:SAML:1.1:nameid-format:unspecified" }
    }
  ])
  provider = team_sync_org.saml_provider
  FactoryBot::create(:external_identity, provider: provider, user: user, saml_user_data: saml_user_data)
  team_sync_org.add_member user
end
