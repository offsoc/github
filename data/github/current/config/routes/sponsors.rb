# typed: strict
# frozen_string_literal: true

T.bind(self, ActionDispatch::Routing::Mapper)

##
# Sponsors
if GitHub.sponsors_enabled?
  scope module: :site do
    resources :sponsors, only: [:index]
  end

  #
  # Repository routes
  #
  # Everything in this block is scoped under /:user_id/:repository. All repo
  # routes should be placed in here.
  #
  scope "/:user_id/:repository", constraints: { repository: REPO_REGEX, user_id: USERID_REGEX } do
    # Sponsor Funding Links
    resource :funding_links, only: [:show]
    get "sponsor_button", to: "repos/sponsor_buttons#show", as: :repository_sponsor_button
  end

  scope "/orgs/:org", constraints: { org: USERID_REGEX } do
    org = self

    org.resource :sponsoring, only: :show, as: :org_sponsoring, module: :orgs do
      resource :settings, only: [:show, :update], module: :sponsorings
      resources :invoices, only: [:index, :new, :create], module: :sponsorings, controller: "stripe_invoices"
      resource :metadata, only: :show, module: :sponsorings
      resources :invoiced_agreement_signatures, only: [:show], module: :sponsorings
      resources :agreement_pdfs, only: [:show], module: :sponsorings
      resources :invoiced_billing_accounts, only: [:new, :create], module: :sponsorings
      resource :billing_options, only: [:show], module: :sponsorings
      resource :bulk_sponsorships, only: [:show], module: :sponsorings
      resource :sponsorships_exports, only: [:create], module: :sponsorings
      resource :sponsorships_dependencies_exports, only: [:create], module: :sponsorings
      resource :dependencies, only: [:show, :index], module: :sponsorings
    end
  end

  get "/orgs/:org/dependencies/search", to: "orgs/sponsorings/dependencies#index",
    as: :dependencies_search
  get "/orgs/:org/sponsoring/insights", to: redirect("orgs/sponsorings")

  resources :profiles, module: :profiles, only: [], id: USERID_REGEX, path: "", as: :user do
    constraints ->(request) { request.query_parameters[:tab] == "sponsoring" } do
      resources :sponsorings, only: [:index], path: ""
    end
  end

  namespace :sponsors do
    resources :accounts, only: [:index] do
      collection do
        resource :patreon_users, only: [:show, :destroy], path: "patreon"
        resources :patreon_users, only: [:update], path: "patreon"
        get "/patreon/connect", to: "patreon_users#new", as: :patreon_connect
      end
    end
    get "/patreon/become-sponsor/:sponsorable_login", to: "patreon_users#new", as: :patreon_become_sponsor
    # Receive webhooks from Patreon. Underscore in the path ensures it won't collide with maintainer logins
    match "/patreon_webhook", via: [:post], to: GitHub::Patreon::WebhooksApp

    resources :explore, only: [:index]
    resources :featured, only: [:index]
    resource :bulk_sponsorship_checkout, only: [:create, :show], path: "bulk-sponsorships/checkout"
    resource :bulk_sponsorship_imports, only: [:new, :create, :edit, :show], path: "bulk-sponsorships/import"
    resource :bulk_sponsorship_frequencies, only: [:show], path: "bulk-sponsorships/frequencies"

    get "/community", to: redirect("/sponsors/explore")
    get "/_iso3166", to: "iso3166#index", as: :iso3166

    get :batch_deferred_buttons, to: "batch_deferred_buttons#batch"
    get :batch_deferred_sponsor_buttons, to: "batch_deferred_sponsor_buttons#index"

    post "/one-click-unsubscribe/:token", to: "one_click_unsubscribe#create", as: :one_click_unsubscribe
  end

  get "/sponsors/bulk-sponsorships/template", to: "sponsors/bulk_sponsorship_blank_templates#index",
    as: "sponsors_bulk_sponsorship_blank_template"
  get "/sponsors/:sponsorable_id/represented-dependencies", to: "sponsors/represented_dependencies#index",
    as: "represented_dependencies"
  get "/sponsors/explore/dependency-uses", to: "sponsors/dependency_uses#index",
    as: "sponsors_explore_dependency_uses"
  get "/sponsors/explore/funding-stats", to: "sponsors/explore_funding_stats#index",
    as: "sponsors_explore_funding_stats"
  get "/sponsors/explore/batch-deferred-ossf-scores", to: "sponsors/batch_deferred_ossf_scores#index",
    as: "sponsors_explore_batch_deferred_ossf_scores"
  post "/sponsors/explore/export", to: "sponsors/explore_exports#create",
    as: "sponsors_explore_export"

  resources :sponsorables, module: :sponsors, path: :sponsors,
                           constraints: { id: USERID_REGEX },
                           only: [:show], format: false do
    resource :dashboard, only: [:show] do
      resource :fiscal_host, only: :show do
        resources :payout_exports, only: [:index, :create], module: :fiscal_host
        resource :transaction_exports, only: :create, module: :fiscal_host
        resource :orgs_exports, only: :create, module: :fiscal_host
      end

      resource :profile, only: [:show, :update] do
        resources :meet_the_teams, only: [:index], module: :profile, path: :meet_the_team
        resources :featured_sponsorships, only: [:index], module: :profile, path: :featured_sponsorships
        resource :featured_work, only: [:show, :edit], module: :profile
        resource :pinnable_repos, only: [:show, :edit], module: :profile
      end

      resources :goals, only: [:index]
      resource :goal, only: [:new, :create, :edit, :update] do
        resource :retirement, only: [:create], module: :goals
      end

      # not named the more sensible `:tier_pricing_check` because some people
      # who write adblockers think that all URLs with `pricing` should be
      # blocked (which is very silly) and also a `check` means `money` in
      # en_US so that way lies sadness too.
      resource :tier_verify, only: :create

      resources :tiers, only: [:index, :new, :edit, :update, :create, :destroy],
                        constraints: { id: /.+/ } do
        resource :retirement, only: :create, module: :tiers
      end

      resource :tier_suggestions, only: [:show, :create]

      resource :custom_tier_settings, only: :update

      resources :your_sponsors, only: :index do
        collection do
          resource :export, only: :create, module: :your_sponsors, as: :your_sponsors_export
        end
      end

      resources :updates, only: [:index, :new, :edit, :update, :create],
                          constraints: { id: /.+/ }
      resources :activities, only: :index, path: :activity
      resources :webhooks, only: [:index, :new, :create, :edit, :update, :destroy],
                          constraints: { id: /\d+/ } do
        # Routes to non-sponsors controller so cannot be made resourceful.
        resources :deliveries, only: [:index], constraints: { id: WEBHOOK_REGEX }, to: "/hook_deliveries#index", context: "sponsors_listing"
        resources :deliveries, only: [:show], constraints: { id: WEBHOOK_REGEX }, to: "/hook_deliveries#show", context: "sponsors_listing"
      end

      resources :payouts, only: :index do
        collection do
          resource :latest_status, only: :show, module: :payouts, as: :payouts_latest_status
          resources :receipts, only: [:index, :create], module: :payouts, as: :payout_receipts
        end
      end

      resource :settings, only: :show
    end

    resources :represented_dependencies, only: :index
    resource :sponsorships, only: [:create, :update, :show, :destroy, :edit]
    resource :pending_sponsorship_changes, only: [:destroy]
    resource :publish_listing, only: [:create]
    resource :redraft, only: :create
    resource :disable, only: [:create]
    resource :reactivate, only: [:create]
    resource :legal_name, only: :update
    resource :contact_email, only: :update
    resource :email_settings, only: :update
    resource :signup, only: [:show, :create, :update]
    resource :signup_status, only: [:show]
    resource :country_of_residence, only: :update
    resource :billing_country, only: :update
    resource :sponsors_partial, only: :show
    resource :button, only: :show
    resource :card, only: :show
    resource :custom_tier_verify, only: :create
    resource :hovercard, only: :show, controller: "/hovercards/sponsors_listings"

    resources :stripe_accounts, only: [:show, :create, :edit, :destroy], constraints: {
      id: STRIPE_ACCOUNT_ID_REGEX,
    } do
      resource :activation, only: [:create], module: :stripe_accounts,
        constraints: { stripe_account_id: STRIPE_ACCOUNT_ID_REGEX }
    end
  end
end

# Legacy routes
scope "/users/:user_id", constraints: { user_id: USERID_REGEX } do
  if GitHub.sponsors_enabled?
    ## GitHub Sponsors legacy redirects for users
    get "sponsors/signup", to: redirect("/sponsors/%{user_id}/signup")
    get "sponsors",        to: redirect("/sponsors/%{user_id}/dashboard")
    get "sponsorship",     to: redirect("/sponsors/%{user_id}")

    resources :potential_sponsorable_banners, only: :destroy, module: :sponsors
  end
end

if GitHub.sponsors_enabled?
  get  "/settings/sponsors-log",                                                              to: "settings/sponsors_log#index",                          as: :settings_user_sponsors_log
end

if GitHub.sponsors_enabled?
  get  "/organizations/:organization_id/settings/sponsors-log",                               to: "orgs/sponsors_log#index",                                    as: :settings_org_sponsors_log
  get  "/organizations/:organization_id/settings/sponsors-credit-balance",                    to: "orgs/sponsors_credit_balances#show",                         as: :settings_org_sponsors_credit_balance
end

scope "/:user_id/:repository", constraints: { repository: REPO_REGEX, user_id: USERID_REGEX } do
  if GitHub.sponsors_enabled?
    get    "sponsors-nudges", to: "repos/sponsors_nudges#show", as: :repo_sponsors_nudge
  end
end

scope "/:user_id/:repository", constraints: { repository: REPO_REGEX, user_id: USERID_REGEX } do
  match  "sponsors_list",       to: "repositories#sponsors_list",        as: :sponsors_list,          via: [:get, :post]
end
