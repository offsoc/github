# typed: strict
# frozen_string_literal: true
#
T.bind(self, ActionDispatch::Routing::Mapper)

scope module: :customers do
  resource :billing, controller: "billing", only: [:show] do
    scope module: :billing do
      resource :usage, controller: "usage", only: [:show] do
        get "/repo", to: "repo_usage#show", as: :org
        get "/total", to: "usage_totals#show"
      end
      resources :budgets
      resources :cost_centers
      resources :products, only: [:index]
      resources :skus, only: [:index]
      resources :discounts, only: [:index]
    end
  end
end
