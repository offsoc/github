# frozen_string_literal: true

get     "/",                  to: "gists/gists#new", as: :new_gist
get     "/new",               to: "gists/gists#new"
post    "/",                  to: "gists/gists#create", as: :gists
get     "/detect_language",   to: "gists/gists#detect_language", as: :detect_gist_language

namespace :gists do
  resources :previews, only: [:create]
end

# Public listing urls
get     "/discover",          to: "gists/listings#discover", as: :discover_gists
get     "/gists",             to: redirect("/discover")

get     "/forked",            to: "gists/listings#forked", as: :forked_gists
get     "/starred",           to: "gists/listings#starred", as: :starred_gists

get     "/search",            to: "gists/searches#show", as: :gist_search
get     "/search/quick",      to: "gists/searches#quick", as: :gist_quicksearch

get     "/mine",              to: "gists/listings#mine", as: :my_gist_listings
get     "/mine/forked",       to: "gists/listings#my_forked"
get     "/mine/starred",      to: "gists/listings#my_starred"

get     "/notifications",      to: redirect("#{GitHub.url}/notifications"), as: :gist_notifications

get "/join",    to: "gists/users#new", as: :gist_signup
post "/users/diffview", to: "diff_view#update_view_preference", as: :gist_diffview

# Notification routes for gists
post "/notifications/beta/mark",        to: "notifications_v2#mark_as_read"
post "/notifications/beta/unmark",      to: "notifications_v2#mark_as_unread"
post "/notifications/beta/archive",     to: "notifications_v2#mark_as_archived"
post "/notifications/beta/unarchive",   to: "notifications_v2#mark_as_unarchived"
post "/notifications/beta/subscribe",   to: "notifications_v2#mark_as_subscribed"
post "/notifications/beta/unsubscribe", to: "notifications_v2#mark_as_unsubscribed"
post "/notifications/beta/star",        to: "notifications_v2#mark_as_starred"
post "/notifications/beta/unstar",      to: "notifications_v2#mark_as_unstarred"
get  "/notifications/indicator",        to: "notifications_indicator#show", as: :gist_notifications_indicator

# Assets
get "/user-attachments/assets/:guid", to: "gists/assets#show"
get "/assets/:user_id/:guid", to: "gists/assets#legacy_show"

constraints user_id: USERID_REGEX, gist_id: GISTID_REGEX, sha: GIT_OID_REGEX do
  # Return the default file in a gist via raw
  get "/:user_id/:gist_id/raw", to: "gists/gists#raw",
    format: false, as: :raw_user_gist

  get "/:user_id/:gist_id/raw/:sha", to: "gists/gists#raw", format: false

  # Default raw route for a gist file at a specific revision
  get "/:user_id/:gist_id/raw/:sha/:file", to: "gists/gists#raw",
    format: false, constraints: { file: /.+/ },
    as: :raw_user_gist_sha_file

  get "/:user_id/:gist_id/raw/:file", to: "gists/gists#raw",
    format: false, constraints: { file: /.+/ }

  if GitHub.gist3_domain?
    get "/auth/github", to: "gists/sessions#new", as: :gist_oauth_login
    get "/auth/github/callback", to: "gists/sessions#create", as: :gist_oauth_callback
    post "/auth/github/logout", to: "gists/sessions#destroy", as: :gist_oauth_logout

    # Redirect support/contact links per #44072
    get "/support", to: redirect("/support", host: GitHub.host_name)
    get "/contact", to: redirect("/contact", host: GitHub.host_name), as: false
    get "/contact/:flavor", to: redirect("/contact/%{flavor}", host: GitHub.host_name), as: false
    get "/login",   to: redirect("/login",   host: GitHub.host_name), as: false

    post "/preview", to: "comment_preview#show", as: false

    # For comment image uploads
    post "/upload/policies/:model", to: "upload_policies#create"
    put  "/upload/:model(/:id)",    to: "uploads#update"
    post "/upload/:model(/:id)",    to: "uploads#create"

    # Allow switching between desktop and mobile experience
    post  "/site/mobile_preference", to: "site#mobile_preference"
    patch "/site/site_admin_and_employee_status", to: "stafftools/site_admin_and_employee_status#update"
    patch "/site/site_admin_performance_stats",   to: "stafftools/site_admin_performance_stats#update"

    # Allow toggling on canary-only traffic for site admins
    unless GitHub.enterprise?
      patch "/site/canary", to: "stafftools/canary#update"
    end

    # Allow setting user protocol for cloning
    post   "/users/set_protocol",  to: "users#set_protocol"

    # Shortcuts cheatsheet
    get "/site/keyboard_shortcuts", to: "keyboard_shortcuts#index"

    # Redirect any stafftools request to GitHub host
    get "/stafftools/graphs/flamegraph", to: "stafftools/graphs#flamegraph"
    get "/stafftools(/:path)", to: redirect("/stafftools/%{path}", host: GitHub.host_name),
      constraints: { path: /.*/ }

    # Add routes for user statuses so they can be viewed and changed
    get "/users/status",           to: "user_statuses#show"
    put "/users/status",           to: "user_statuses#update"
    get "/users/status/members",   to: "user_statuses#member_statuses"
    get "/users/status/emoji",     to: "user_statuses#emoji_picker"
    get "/users/status/organizations", to: "user_statuses#org_picker"

    # Duplicate the notice dismissal path so notices can be dismissed on gist pages
    post "/settings/dismiss-notice/:notice", to: "settings/dismissals#create"
  end

  # This route also handles the legacy routes of:
  # - /:gist_id
  # - /:gist_id.{txt,js,pibb}
  get     "/:user_id",          to: "gists/users#show", as: :user_gists
  get     "/:user_id/public",   to: "gists/users#show",
    as: :user_public_gists, visibility: "public"
  get     "/:user_id/secret",   to: "gists/users#show",
    as: :user_secret_gists, visibility: "secret"

  # - Handle: /:gist_id/:sha legacy route
  get     "/:user_id/:sha",     to: "gists/users#show"
  # - Handle: /:gist_id/:sha legacy route
  get     "/:user_id/:sha.txt", to: "gists/users#show"

  # - Handles /:gist_id/{forks,stars,revisions}
  get     "/:user_id/forks",   to: "gists/users#show", legacy_redirect: "forks"
  get     "/:user_id/stars",   to: "gists/users#show", legacy_redirect: "stars"
  get     "/:user_id/revisions",   to: "gists/users#show", legacy_redirect: "revisions"
  get     "/:user_id/download",   to: "gists/users#show", legacy_redirect: "download"

  get     "/:user_id/forked",   to: "gists/users#forked", as: :user_forked_gists
  get     "/:user_id/forked/public",   to: "gists/users#forked", visibility: "public"
  get     "/:user_id/forked/secret",   to: "gists/users#forked", visibility: "secret"

  get     "/:user_id/starred",  to: "gists/users#starred", as: :user_starred_gists
  get     "/:user_id/starred/public",  to: "gists/users#starred", visibility: "public"
  get     "/:user_id/starred/secret",  to: "gists/users#starred", visibility: "secret"

  get     "/:user_id/:gist_id.json",               to: "gists/stateless#show", format: "json"
  get     "/:user_id/:gist_id/:revision.:format",  to: "gists/stateless#show", format: "json"

  get     "/:user_id/:gist_id", to: "gists/gists#show", as: :user_gist
  get     "/:user_id/:gist_id/load_comments", to: "gists/gists#load_comments"

  get     "/:user_id/:gist_id/:revision",      to: "gists/gists#show",
    as: :user_gist_at_revision, constraints: { revision: GIT_OID_REGEX }

  get     "/:user_id/:gist_id/forks",             to: "gists/gists#forks", as: :forks_user_gist
  get     "/:user_id/:gist_id/edit",              to: "gists/gists#edit", as: :edit_user_gist
  get     "/:user_id/:gist_id/revisions",         to: "gists/gists#revisions", as: :revisions_user_gist
  get     "/:user_id/:gist_id/download",          to: "gists/gists#archive", as: :download_user_gist, format: "zip"
  get     "/:user_id/:gist_id/suggestions",       to: "gists/gists#suggestions", as: :suggestions_user_gist
  put     "/:user_id/:gist_id",                   to: "gists/gists#update", as: :update_user_gist
  put     "/:user_id/:gist_id/make_public",       to: "gists/gists#make_public", as: :make_public_user_gist
  put     "/:user_id/:gist_id/file/:oid",         to: "gists/gists#update_file", as: :update_user_gist_file
  delete  "/:user_id/:gist_id",                   to: "gists/gists#destroy", as: :delete_user_gist
  post    "/:user_id/:gist_id/star",              to: "gists/gists#star", as: :star_gist
  post    "/:user_id/:gist_id/fork",              to: "gists/gists#fork", as: :fork_user_gist
  get     "/:user_id/:gist_id/stargazers",        to: "gists/gists#stargazers", as: :stargazers_gist
  post    "/:user_id/:gist_id/unstar",            to: "gists/gists#unstar", as: :unstar_gist

  get     "/:user_id/:gist_id/subscription",      to: "gists/gists#subscription", as: :subscription_gist
  post    "/:user_id/:gist_id/subscribe",         to: "gists/gists#subscribe", as: :subscribe_gist

  post    "/:user_id/:gist_id/comments",             to: "gists/comments#create",
    as: :user_gist_comments
  delete  "/:user_id/:gist_id/comments/:comment_id", to: "gists/comments#destroy",
    as: :delete_user_gist_comment
  put     "/:user_id/:gist_id/comments/:comment_id", to: "gists/comments#update",
    as: :update_user_gist_comment
  get    "/:user_id/:gist_id/comments/:comment_id",  to: "gists/comments#show",
    as: :show_user_gist_comment

  get    "/:user_id/:gist_id/comments/:comment_id/comment_actions_menu", to: "gists/comments#comment_actions_menu"
  get    "/:user_id/:gist_id/comments/:comment_id/edit_form", to: "gists/comments#edit_form"

  get "/:user_id/:gist_id/archive/:commitish.zip",   to: "gists/gists#archive",
    action: "archive", format: "zip", as: :zipball_user_gist
  get "/:user_id/:gist_id/archive/:commitish.tar.gz", to: "gists/gists#archive",
    action: "archive", format: "tar.gz", as: :tarball_user_gist

  # Allow user hovercards under the same path as github.com to prevent cross domain issues
  get "/users/:user_id/hovercard", to: "hovercards/users#show"
end

# NOTE: Due to the way Rails routing works this has to the be the last route in the
#       Gist routing block.  This route makes sure all routes that are on GitHub.com
#       that are not Gist routes do not work on gist.github.com.
match "/:path", to: "gists/application#not_found", constraints: { path: /.*/ }, via: [:get, :post, :put, :delete, :patch]
