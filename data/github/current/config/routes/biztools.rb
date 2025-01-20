# typed: strict
# frozen_string_literal: true

T.bind(self, ActionDispatch::Routing::Mapper)

get :biztools, to: redirect("/biztools/coupons")
namespace :biztools do
  resources :showcase_collections, path: "showcases" do
    post :perform_healthcheck, to: "showcase_items#perform_healthcheck", as: :healthcheck
    member do
      put :featured, to: "showcase_collections#set_featured"
      delete :featured, to: "showcase_collections#remove_featured"
    end

    resources :showcase_items, path: "items",
                               only: [:create, :edit, :update, :destroy]
  end

  # RepositoryActionsController
  resources :repository_actions, only: [:index, :update, :show, :edit, :destroy] do
    scope module: "repository_actions" do
      resource :listing, only: [:destroy]
    end
    collection do
      get :creators, to: "repository_actions#creators"
      post "/creators/:creator_id",
        to: "repository_actions#verify_creator",
        as: "toggle_creator"
      post "/creators/:creator_id/reindex",
        to: "repository_actions#reindex_creator",
        as: "reindex_creator"
    end
  end

  resources :topics, only: [:index] do
    collection do
      post :import
    end
  end
  resources :collections, only: :index do
    collection do
      post :import
    end
  end
  put "/topics/:topic", to: "topics#update", as: :update_topic
  put "/collections/:collection", to: "collections#update", as: :update_collection

  if GitHub.billing_enabled?
    get "/:user_id/billing/redemptions", to: "users/billing/redemptions#index", as: :user_redemptions

    get "/:user_id/opensource", to: "coupons#opensource", as: :coupons_opensource

    coupon_name_regex = /[a-z0-9\._\-+:*!&<>()%^]+/i
    get "/coupons/groups/:group", to: "coupons#groups", as: :coupon_groups
    resources :coupons, id: coupon_name_regex, format: false do
      post :search, on: :collection
      post :apply, on: :collection
      get :report, on: :member
    end

    resources :users, only: [:index] do
      collection do
        put "/:user_id/enable_tos_prompt", to: "users#enable_tos_prompt", as: :enable_tos_prompt
      end
      resource :coupon, only: [] do
        delete :destroy, to: "coupons#revoke"
      end

      resources :education_terms, only: :create, controller: "users/education_terms"
    end

    # this should really be removed one day and instead be part of
    # `resources :users` itself.
    get "/users/:user_id", to: "users#show", as: :user

    get "/businesses/:slug/billing/redemptions", to: "businesses/billing/redemptions#index", as: :business_redemptions
    delete "/businesses/:slug/coupon", to: "coupons#revoke", controller: "biztools/coupons", as: :business_revoke_coupon
  end

  get "/works-with", to: redirect("/marketplace")
  get "/works-with/:id", to: redirect("/marketplace")

  get "/marketplace",                           to: "marketplace_listings#index",       as: :marketplace
  get "/marketplace/creators_verification",      to: "marketplace_creator_verification#index",       as: :marketplace_creator_verification
  get "/marketplace/creators_verification/:id",      to: "marketplace_creator_verification#show",       as: :marketplace_creator_verification_show
  post "/marketplace/creators_verification/verify",      to: "marketplace_creator_verification#verify",       as: :marketplace_creator_verification_verify
  get "/marketplace/categories",                to: "marketplace_categories#index",     as: :marketplace_categories
  get "/marketplace/categories/new",            to: "marketplace_categories#new",       as: :new_marketplace_category
  get "/marketplace/categories/:category_slug/edit", to: "marketplace_categories#edit", as: :edit_marketplace_category
  put "/marketplace/categories/:category_slug", to: "marketplace_categories#update",    as: :marketplace_category
  post "/marketplace/categories",               to: "marketplace_categories#create"
  get "/marketplace/agreements",                to: "marketplace_agreements#index",     as: :marketplace_agreements
  get "/marketplace/agreements/new",            to: "marketplace_agreements#new",       as: :new_marketplace_agreement
  post "/marketplace/agreements",               to: "marketplace_agreements#create"
  get "/marketplace/agreements/:id",            to: "marketplace_agreements#show",      as: :marketplace_agreement
  get "/marketplace/recommendations",           to: "marketplace_recommendations#index", as: :marketplace_recommendations
  put "/marketplace/recommendations",           to: "marketplace_recommendations#update", as: :update_marketplace_recommendations
  delete "/marketplace/recommendations/:listing_slug", to: "marketplace_recommendations#destroy", as:  :destroy_marketplace_recommendations
  put "/marketplace/featured_customers/:id",    to: "marketplace_featured_customers#update", as: :marketplace_featured_customers
  get "/marketplace/stories",                   to: "marketplace/stories#index",        as: :marketplace_stories
  post "/marketplace/featured_stories/:id",     to: "marketplace/featured_stories#create", as: :feature_marketplace_story
  delete "/marketplace/featured_stories/:id",   to: "marketplace/featured_stories#destroy", as: :unfeature_marketplace_story
  get "/marketplace/:listing_slug",             to: "marketplace_listings#show",        as: :marketplace_listing
  get "/marketplace/:listing_slug/edit",        to: "marketplace_listings#edit",        as: :edit_marketplace_listing
  put "/marketplace/:listing_slug",             to: "marketplace_listings#update"
  put "/marketplace/:listing_slug/feature",     to: "marketplace_listings#feature",     as: :feature_marketplace_listing
  put "/marketplace/:listing_slug/unfeature",   to: "marketplace_listings#unfeature",   as: :unfeature_marketplace_listing
  post "/marketplace/:listing_id/approve",      to: "marketplace_listings#approve",     as: :approve_marketplace_listing
  post "/marketplace/:listing_id/approve_creator",      to: "marketplace_listings#approve_creator",     as: :approve_creator_marketplace_listing
  post "/marketplace/:listing_id/move_to_verified",     to: "marketplace_listings#move_to_verified",    as: :move_to_verified_marketplace_listing
  post "/marketplace/:listing_id/reject",       to: "marketplace_listings#reject",      as: :reject_marketplace_listing
  post "/marketplace/:listing_id/delist",       to: "marketplace_listings#delist",      as: :delist_marketplace_listing
  post "/marketplace/:listing_id/cancel_subscriptions",       to: "marketplace_listings#cancel_subscriptions",      as: :cancel_subscriptions_marketplace_listing
  post "/marketplace/:listing_id/reindex",      to: "marketplace_listings#reindex", as: :reindex_marketplace_listing
  get "/marketplace/:listing_id/hook",          to: "marketplace_listings#hook",        as: :marketplace_listing_hook
  get "/marketplace/:listing_id/finance",          to: "marketplace_listings#finance",        as: :marketplace_listing_finance
  get "/marketplace/:listing_id/subscriptions/index", to: "marketplace_listing_subscriptions#index", as: :marketplace_listing_subscriptions_index
end
