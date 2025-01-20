# typed: strict
# frozen_string_literal: true

T.bind(self, ActionDispatch::Routing::Mapper)

##
# Discussions

# For populating an initial discussion with template
namespace "discussions" do
  resources :welcome_templates, only: [:create]
  get :votes, to: "batch_votes#index"
  get :badges, to: "badges#batch"

  resource :landing, to: "welcome_templates#landing", only: [:show]
  resource :activity_indicator, only: [:show]
end

##
# Discussion Categories & Sections
scope "discussions", module: :discussions do
  resources :categories, only: [:index, :new, :edit, :create, :update, :destroy] do
    collection do
      get :emoji_picker
    end
  end
  get "new/choose", to: "choose#show", as: "choose_category_discussion"
  resources :sections, only: [:new, :create, :edit, :update, :destroy], param: :slug
end

resources :discussions, param: :number do
  collection do
    get "categories/:category_slug", to: "discussions#index", as: :category
    delete :announcement, to: "discussions/announcements#destroy"
    get :category_choices, to: redirect("/%{user_id}/%{repository}/discussions/new")

    namespace :discussions, path: "/" do
      resources :label_suggestions, only: :index
      resource :leaderboard, only: :show
      resource :spotlight_positions, only: [:update]
      resources :author_suggestions, only: :index
      resource :labels, only: [:show, :update] do
        collection do
          post :sidebar_item
          get :search_menu
        end
      end
      resource :poll, only: [], module: :polls do
        resource :preview, only: :create
      end
    end
  end

  scope module: :discussions do
    resource :events, only: :show
  end

  resources :comments, only: [] do
    scope module: :discussions do
      resource :actions_menu, only: :show, target: "discussion_comment", path: "comment_actions_menu"

      scope module: :comments do
        resource :permissions, only: :show
        resource :threads, only: :show
      end
    end
  end

  scope module: :discussions do
    resource :actions_menu, only: :show, target: "discussion"
    resource :body, only: :show
    resource :permissions, only: :show
    resource :language_detections, only: :create
    resource :category_pin, only: [:create, :destroy]
    resources :spotlights, only: [:new, :edit, :create, :update, :destroy] do
      collection do
        resource :spotlight_preview, only: [:show], path: "preview"
      end
    end
    resource :title, only: :show
    resource :form_actions, only: :show
    resource :sidebar, only: :show
    resource :category_menu, only: :show
    resource :repository_transfer, only: [:show, :update] do
      resources :repositories, module: :repository_transfers, only: [:index]
    end
    resource :header_reaction_button, only: :show
    resource :timeline, only: :show
    resource :poll, only: [:show, :edit] do
      resources :votes, module: :polls, only: :create
    end
    resource :block_from_comment_modal, only: :show
    resource :unblock_from_comment_modal, only: :show
    resource :pages, only: :show
    resource :comment_count, only: :show
    resource :issue_modal, only: :show
    resource :report_content_modal, only: :show
  end

  member do
    get :reactions, to: "discussions/reactions#batch"

    get :votes, to: "discussions/batch_votes#index"
    post :votes, to: "discussions/batch_votes#index"

    get :timeline_anchor, to: "discussions/permalinks#show"
    get :hovercard, to: "hovercards/discussions#show"
    get :edits_menu, to: "discussions/edits#edit_history"
    get :edits_log, to: "discussions/edits#edit_history_log"
    post :lock, to: "discussion_locks#create"
    delete :unlock, to: "discussion_locks#destroy"

    resources :copilot_summaries, only: [:create], path: "copilot-summaries", module: :discussions,
      as: :copilot_discussion_summaries

    resource :copilot_summaries_feedback, only: [:create], path: "copilot-summary/feedback", module: :discussions,
      as: :copilot_discussion_summary_feedback, controller: "copilot_summaries_feedback"

    resource :copilot_summary_banners, only: [:show], path: "copilot-summaries-banner", module: :discussions,
      as: :copilot_discussion_summary_banner
  end

  resources :votes, only: [:index], controller: "discussions/votes" do
    collection do
      delete :destroy
      put :update
    end
  end

  resources :comments, only: [:create, :update, :destroy, :show], controller: "discussions/comments" do
    member do
      post :mark_as_answer, to: "discussions/chosen_comments#create"
      delete :unmark_as_answer, to: "discussions/chosen_comments#destroy"
      get :edits_menu, to: "discussions/edits#edit_history"
      get :edits_log, to: "discussions/edits#edit_history_log"
      get :minimize_form, to: "discussions/comment_minimizations#show"
      post :minimize, to: "discussions/comment_minimizations#create"
      delete :unminimize, to: "discussions/comment_minimizations#destroy"
      get :open_new_issue_modal, to: "discussions/comment_issue_modals#show"
      get :comment_header_reaction_button, to: "discussions/comment_header_reaction_buttons#show"
    end

    resource :delete_content_modal, controller: "discussions/comments/delete_content_modals", only: :show
    resource :language_detections, controller: "discussions/comments/language_detections", only: :create
    resource :unminimize_content_modal, controller: "discussions/comments/unminimize_content_modals", only: :show
    resources :votes, controller: "discussions/comments/votes" do
      collection do
        delete :destroy
        put :update
      end
    end
  end
end
