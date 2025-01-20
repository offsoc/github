# frozen_string_literal: true
require "sinatra"
require "faker"
require_relative "./reminder_message"

module SlackMock
  module SinatraClassMethodFix
    # Sinatra::Base and Kernel define two different versions of
    # caller_locations. Sinatra accepts zero arguments, Kernel accepts 2
    # Rails expects Kernel.caller_locations when including UrlHelpers
    # This module redefines caller_locations on App so that if one or more args
    # are passed then we use Kernel, otherwise we use the Sinatra::Base version
    def caller_locations(*args)
      if args.empty?
        super()
      else
        Kernel.instance_method(:caller_locations).bind(self).call(*args)
      end
    end
  end

  class App < Sinatra::Base
    extend SinatraClassMethodFix
    include UrlHelpers
    include GitHub::RouteHelpers

    configure :development do
      enable :logging
    end

    Encoding.default_external = "UTF-8"

    service_base = "/_slack" if GitHub.enterprise?

    # Kick off the Slack integration installation flow.
    # If Slack integration is already installed for the organization,
    # render form to choose Slack workspace to connect.
    get "#{service_base}/slack/v2/oauth/login/both" do
      if slack_installed?
        options = ReminderSlackWorkspace.all.pluck(:slack_id, :name).to_h
        template = <<~HTML
          <html>
            <style>
              form * { font-size: 20px; }
            </style>
            <h1>Pick a Slack workspace</h1>
            <form method="post">
              <input type="hidden" name="redirect_uri" value="<%= params[:redirect_uri] %>">
              <input type="hidden" name="state" value="<%= params[:state] %>">
              <select name="workspace_id">
                <option value="">Generate new workspace</option>
                <% options.each do |slack_id, name| %>
                  <option value="<%= slack_id %>"><%= name %></option>
                <% end %>
              </select>
              <input type="submit">
            </form>
          </html>
        HTML

        erb template, locals: { options: options }
      else
        redirect gh_app_installation_permissions_url(
          Apps::Internal.integration(:slack),
          nil, # There is no "user" to pass in this context, which means this will only work if the :owner_scoped_github_apps feature flag is fully enabled
          target_id: organization_id
        )
      end
    end

    # Redirect to Slack workspace authorization URL.
    #
    # This endpoint is hit after the Slack integration is installed and redirecting
    # to the authorize endpoint kicks the user back to `/slack/oauth/login/both`.
    get "/github/setup" do
      organization = IntegrationInstallation.find(params[:installation_id]).target
      redirect authorize_reminder_slack_workspace_url(organization)
    end

    # Set workspace name and ID and redirect back to dotcom.
    post "#{service_base}/slack/v2/oauth/login/both" do
      slack_workspace = ReminderSlackWorkspace.find_by(slack_id: params[:workspace_id])
      slack_id, name = if slack_workspace
        [slack_workspace.slack_id, slack_workspace.name]
      else
        generate_id_and_name
      end

      payload = {
        "workspace_name" => name,
        "workspace_id" => slack_id,
        "state" => params["state"]
      }

      jwt = JWT.encode(payload, GitHub.slack_integration_secret, "HS256")
      url = URI(params["redirect_uri"])
      url.query = { workspace: jwt }.to_query

      redirect(url.to_s)
    end

    post "/github/events" do
      body = request.body.read
      data = JSON.parse(body)
      event = request.get_header("HTTP_X_GITHUB_EVENT")
      action = data["action"]

      logger.info("Received #{event}.#{action}")
      logger.info(body)

      if event == "reminder"
        ReminderMessage.deliver(data)
      end

      200
    end

    def slack_installed?
      organization = Organization.find(organization_id)
      scope = organization.integration_installations.where(integration: Apps::Internal.integration(:slack))
      scope.exists?
    end

    def organization_id
      ReminderSlackWorkspaceConnector.decrypt(params["state"])["organization_id"]
    end

    def default_url_options
      { host: "github.localhost" }
    end

    def generate_id_and_name
      slack_id = "T#{rand(100_000_000)}".ljust(9, "0")
      [slack_id, Faker::Food.dish]
    end
  end
end
