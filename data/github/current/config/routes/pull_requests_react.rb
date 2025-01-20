# typed: true
# frozen_string_literal: true

T.bind(self, ActionDispatch::Routing::Mapper)

get "/pull/:id/prx", to: "pull_requests_react#prx", id: /\d+/
post "/toggle_prx", to: "pull_requests_react#toggle_prx", as: :toggle_prx
post "/toggle_new_mergebox", to: "pull_requests_react#toggle_new_mergebox", as: :toggle_new_mergebox
post "/toggle_new_commits", to: "pull_requests_react#toggle_new_commits", as: :toggle_new_commits

get "/pull/:id/page_data/status_checks", to: "pull_requests/page_data/shared#status_checks", id: /\d+/, format: "json"
get "/pull/:id/page_data/commits", to: "pull_requests/page_data/shared#commits", id: /\d+/, format: "json"
get "pull/:id/page_data/merge_box", to: "pull_requests/page_data/shared#merge_box", id: /\d+/, format: "json"

# Header routes
get "/pull/:id/page_data/header", to: "pull_requests/page_data/shared#header", id: /\d+/, format: "json"
get "/pull/:id/page_data/code_button", to: "pull_requests/page_data/shared#code_button", id: /\d+/, format: "json"
get "/pull/:id/page_data/tab_counts", to: "pull_requests/page_data/shared#tab_counts", id: /\d+/, format: "json"

# Mutations
patch "/pull/:id/page_data/change_base", to: "pull_requests/page_data/shared#change_base", id: /\d+/, format: "json"
patch "/pull/:id/page_data/update_title", to: "pull_requests/page_data/shared#update_title", id: /\d+/, format: "json"
post "/pull/:id/page_data/enable_auto_merge", to: "pull_requests/page_data/mutations#enable_auto_merge", id: /\d+/, format: "json"
post "/pull/:id/page_data/disable_auto_merge", to: "pull_requests/page_data/mutations#disable_auto_merge", id: /\d+/, format: "json"
post "/pull/:id/page_data/restore_head_ref", to: "pull_requests/page_data/mutations#restore_head_ref", id: /\d+/, format: "json"
post "/pull/:id/page_data/delete_head_ref", to: "pull_requests/page_data/mutations#delete_head_ref", id: /\d+/, format: "json"
post "/pull/:id/page_data/mark_ready_for_review", to: "pull_requests/page_data/mutations#mark_ready_for_review", id: /\d+/, format: "json"
