# frozen_string_literal: true

constraints(host: /\Achatops\.github\.(?:localhost|com)\Z/) do
  scope controller: "chatops/search" do
    get  "/_chatops/search",         action: "list"
    post "/_chatops/search/:chatop", action: "execute_chatop"
  end

  scope controller: "chatops/geyser" do
    get  "/_chatops/geyser",         action: "list"
    post "/_chatops/geyser/:chatop", action: "execute_chatop"
  end

  scope controller: "chatops/spokes" do
    get  "/_chatops/spokes",         action: "list"
    post "/_chatops/spokes/:chatop", action: "execute_chatop"
  end

  scope controller: "chatops/backup" do
    get  "/_chatops/backup",         action: "list"
    post "/_chatops/backup/:chatop", action: "execute_chatop"
  end

  scope controller: "chatops/features" do
    get  "/_chatops/features",         action: "list"
    post "/_chatops/features/:chatop", action: "execute_chatop"
  end

  scope controller: "chatops/dependency_graph" do
    get  "/_chatops/dependency_graph",         action: "list"
    post "/_chatops/dependency_graph/:chatop", action: "execute_chatop"
  end

  scope controller: "chatops/secret_scanning" do
    get  "/_chatops/secret_scanning",         action: "list"
    post "/_chatops/secret_scanning/:chatop", action: "execute_chatop"
  end

  scope controller: "chatops/code_scanning" do
    get  "/_chatops/code_scanning",         action: "list"
    post "/_chatops/code_scanning/:chatop", action: "execute_chatop"
  end

  scope controller: "chatops/codespaces" do
    get  "/_chatops/codespaces",         action: "list"
    post "/_chatops/codespaces/:chatop", action: "execute_chatop"
  end

  scope controller: "chatops/gitcoin" do
    get  "/_chatops/gitcoin",         action: "list"
    post "/_chatops/gitcoin/:chatop", action: "execute_chatop"
  end

  scope controller: "chatops/memex" do
    get  "/_chatops/memex",         action: "list"
    post "/_chatops/memex/:chatop", action: "execute_chatop"
  end

  scope controller: "chatops/advanced_security" do
    get  "/_chatops/ghas",         action: "list"
    post "/_chatops/ghas/:chatop", action: "execute_chatop"
  end

  scope controller: "chatops/repos" do
    get  "/_chatops/repos",         action: "list"
    post "/_chatops/repos/:chatop", action: "execute_chatop"
  end

  scope controller: "chatops/orgs" do
    get  "/_chatops/orgs",         action: "list"
    post "/_chatops/orgs/:chatop", action: "execute_chatop"
  end

  scope controller: "chatops/emu_enterprises" do
    get  "/_chatops/emus",         action: "list"
    post "/_chatops/emus/:chatop", action: "execute_chatop"
  end

  scope controller: "chatops/migrator" do
    get  "/_chatops/migrator",         action: "list"
    post "/_chatops/migrator/:chatop", action: "execute_chatop"
  end

  scope controller: "chatops/fastly" do
    get  "/_chatops/fastly",         action: "list"
    post "/_chatops/fastly/:chatop", action: "execute_chatop"
  end

  scope controller: "chatops/resqued" do
    get  "/_chatops/resqued",         action: "list"
    post "/_chatops/resqued/:chatop", action: "execute_chatop"
  end

  scope controller: "chatops/dependabot_alerts" do
    get  "/_chatops/dependabot_alerts",         action: "list"
    post "/_chatops/dependabot_alerts/:chatop", action: "execute_chatop"
  end

  scope controller: "chatops/queue_configs" do
    get  "/_chatops/queue_configs",         action: "list"
    post "/_chatops/queue_configs/:chatop", action: "execute_chatop"
  end

  scope controller: "chatops/reachability" do
    get "/_chatops/reachability",         action: "list"
    post "/_chatops/reachability/:chatop", action: "execute_chatop"
  end
end
