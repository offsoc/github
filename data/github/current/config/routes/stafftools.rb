# typed: true
# frozen_string_literal: true

T.bind(self, ActionDispatch::Routing::Mapper)

##
# Stafftools: The Next Generation
get "stafftools/okta_team_sync_beta_signup", to: "stafftools/okta_team_sync_beta_signup#index", as: :stafftools_okta_team_sync_beta_signup
post "stafftools/okta_team_sync_beta_signup/:membership_id", to: "stafftools/okta_team_sync_beta_signup#toggle_access", as: :stafftools_toggle_okta_team_sync_beta

get "stafftools/reminders_beta_signup", to: "stafftools/reminders_beta_signup#index", as: :stafftools_reminders_beta_signup
post "stafftools/reminders_beta_signup/toggle_event/:integration_id", to: "stafftools/reminders_beta_signup#toggle_reminder_event", as: :stafftools_toggle_reminder_event

get "stafftools/users/:user_id/projects/beta", to: "stafftools/projects_beta#index", as: :stafftools_projects_beta
get "stafftools/projects/beta/:id", to: "stafftools/projects_beta#show", as: :stafftools_projects_beta_show
post "stafftools/projects/beta/:id/reopen", to: "stafftools/projects_beta#reopen", as: :stafftools_projects_beta_reopen
post "stafftools/projects/beta/:id/restore", to: "stafftools/projects_beta#restore", as: :stafftools_projects_beta_restore
delete "stafftools/projects/beta/:id", to: "stafftools/projects_beta#delete", as: :stafftools_projects_beta_delete
delete "stafftools/projects/beta/:id/soft_delete", to: "stafftools/projects_beta#soft_delete", as: :stafftools_projects_beta_soft_delete
patch "stafftools/projects/beta/:id/sync_iteration_fields", to: "stafftools/projects_beta#sync_iteration_fields", as: :stafftools_projects_beta_sync_iteration_fields
patch "stafftools/projects/beta/:id/rebalance_items", to: "stafftools/projects_beta#rebalance_items", as: :stafftools_projects_beta_rebalance_items
patch "stafftools/projects/beta/:id/rebalance_views", to: "stafftools/projects_beta#rebalance_views", as: :stafftools_projects_beta_rebalance_views
patch "stafftools/projects/beta/:id/reindex_items", to: "stafftools/projects_beta#reindex_items", as: :stafftools_projects_beta_reindex_items
patch "stafftools/projects/beta/:id/sync_denormalized_data", to: "stafftools/projects_beta#sync_denormalized_data", as: :stafftools_projects_beta_sync_denormalized_data
patch "stafftools/projects/beta/:id/sync_hierarchy", to: "stafftools/projects_beta#sync_hierarchy", as: :stafftools_projects_beta_sync_hierarchy

get "stafftools/merge_queue_beta_signup", to: "stafftools/merge_queue_beta_signup#index", as: :stafftools_merge_queue_beta_signup
post "stafftools/merge_queue_beta_signup/add", to: "stafftools/merge_queue_beta_signup#mark_onboarded", as: :stafftools_merge_queue_beta_signup_add

# Memex without limits beta signup in stafftools
get "stafftools/memex_without_limits_beta_signup", to: "stafftools/memex_without_limits_beta_signup#index", as: :stafftools_memex_without_limits_beta_signup
post "stafftools/memex_without_limits_beta_signup", to: "stafftools/memex_without_limits_beta_signup#create", as: :stafftools_create_memex_without_limits_beta_signup
put "stafftools/memex_without_limits_beta_signup/:project_id", to: "stafftools/memex_without_limits_beta_signup#update", as: :stafftools_update_memex_without_limits_beta_signup

unless GitHub.enterprise?
  get "stafftools/projects_beta_signup/:feature", to: "stafftools/projects_beta_signup#index", as: :stafftools_projects_beta_signup
  put "stafftools/projects_beta_signup/:membership_id", to: "stafftools/projects_beta_signup#update", as: :stafftools_update_projects_beta_signup
end

# Beta waitlist management in stafftools
get "stafftools/betas", to: "stafftools/beta_signup#index", as: :stafftools_betas
get "stafftools/betas/:beta", to: "stafftools/beta_signup#show", as: :stafftools_beta_signup
get "stafftools/betas/:beta/add", to: "stafftools/beta_signup#add", as: :stafftools_add_beta_signup
post "stafftools/betas/:beta/add_in_batch", to: "stafftools/beta_signup#onboard_batch", as: :stafftools_onboard_beta_batch
post "stafftools/betas/:beta/add", to: "stafftools/beta_signup#submit", as: :stafftools_add_beta_signup_submit
post "stafftools/betas/:beta/:membership_id", to: "stafftools/beta_signup#toggle_access", as: :stafftools_toggle_beta

get :stafftools, to: "stafftools#index"
get "stafftools/_modal", to: "stafftools#modal", as: :stafftools_modal
put "stafftools/comments/:id/minimize", to: "stafftools/comments#minimize", as: :stafftools_minimize_comment
put "stafftools/comments/:id/unminimize", to: "stafftools/comments#unminimize", as: :stafftools_unminimize_comment
delete "stafftools/comments/:id", to: "stafftools/comments#destroy", as: :stafftools_delete_comment


put "stafftools/pinned_api_versions", to: "stafftools/pinned_api_versions#update", as: :stafftools_pinned_api_versions

get "stafftools/stream_processors", to: redirect("devtools/stream_processors")

scope module: :stafftools do
  # Toggle
  unless GitHub.enterprise?
    patch "/site/canary", to: "canary#update", as: :canary
    patch "/site/labs",   to: "labs#update",   as: :labs
  end

  patch "/site/site_admin_and_employee_status", to: "site_admin_and_employee_status#update", as: :site_admin_and_employee_status
  patch "/site/site_admin_performance_stats",   to: "site_admin_performance_stats#update",   as: :site_admin_performance_stats
end


namespace :stafftools do

  if GitHub.enterprise?
    get "/ghas_committers", to: "ghas_committers#index"
    post "/ghas_committers", to: "ghas_committers#index"
    get "/ghas_committers/download_active_committers", to: "ghas_committers#download_active_committers"
    get "/ghas_committers/download_maximum_committers", to: "ghas_committers#download_maximum_committers"
  end

  resources :audit_log_stream, only: [:show], param: :slug, controller: "businesses/audit_log_stream", as: :audit_log_stream
  post "/audit_log_stream/:slug/streams/:id", to: "businesses/audit_log_stream#send_disable_warning",
    constraints: lambda { |request| request.parameters[:notification_button] }, as: :audit_log_stream_send_disable_warning
  post "/audit_log_stream/:slug/streams/:id", to: "businesses/audit_log_stream#check_endpoint", as: :audit_log_stream_check_endpoint
  put "/audit_log_stream/:slug/streams/:id", to: "businesses/audit_log_stream#disable_endpoint", as: :audit_log_stream_disable_endpoint


  if GitHub.sla_reports_available?
    get "/sla_reports", to: "sla_reports#index"
    post "/sla_reports", to: "sla_reports#generate"
  end

  scope "/users/:user_id", as: :user do
    resource :organization_profiles, only: :update, path: "org-profile", as: :organization_profile
  end

  if GitHub.sponsors_enabled?
    # GitHub Sponsors Stafftools
    scope "/users/:user_id", as: :user do
      resource :sponsors_trust_levels, controller: "sponsors/trust_levels", only: [:update]
      resources :potential_sponsorships, module: :sponsors, only: [:new, :edit, :create, :update, :destroy]
      resource :potential_sponsorable_banner_preview, module: :sponsors, only: [:create]
      resource :sponsors_patreon_users, controller: "sponsors/sponsors_patreon_users", only: [:update]
    end

    resource :sponsors, module: :sponsors, only: [], format: false do
      get "/", to: redirect("/stafftools/sponsors/members")

      resources :agreements, only: [:index, :show, :new, :create] do
        resource :signature_export, only: [:create], module: :agreements
      end

      resources :billing_mismatches, only: :index do
        collection do
          get :unpaid_sponsorships
        end
      end

      post "/retry-one-time-subscription-items", to: "retry_one_time_subscription_items#create",
        as: "retry_one_time_subscription_items"

      resources :sponsorships, only: [:index, :update, :destroy] do
        resource :pending_change, only: [:destroy], module: :sponsorships
        resource :restoration, only: [:create], module: :sponsorships
      end

      resources :invoiced_agreement_signatures, only: [:update]

      resources :potential_sponsorships, only: :index
      resources :potential_sponsors, only: [:index]
      resources :approved_sponsorables, only: [:index]

      resources :bulk_approvals, only: [:index, :create]
      resources :bulk_bans, only: [:index, :create]

      resources :members, only: [:index, :show, :update, :destroy] do
        resource :acceptance, only: [:create, :destroy], module: :members
        resource :reactivation, only: [:create], module: :members
        resource :feature, only: :update, module: :members
        resource :reputable_orgs_partial, only: :show, module: :members
        resources :criterion, only: :update, module: :members
        resource :request_approval, only: [:destroy], module: :members
        resource :ban, only: [:create, :destroy], module: :members
        resource :ignore, only: [:create, :destroy], module: :members
        resources :staff_notes, only: :create, module: :members
        resources :activities, only: [:index], module: :members
        resources :child_listings, only: :index, module: :members
        resource :transaction_exports, only: :create, module: :members
        resources :payout_exports, only: [:index, :create], module: :members
        resources :health_checks, only: :index, module: :members
        resources :transfer_reversals, only: [:create], module: :members
        resources :transfer_refunds, only: [:create], module: :members
        resources :receipts, only: :create, module: :members
        resource :trust_level, only: :update, module: :members

        resource :listing, module: :members, only: [] do
          resource :approval, only: [:create, :destroy], module: :listing
          resource :disable, only: [:create], module: :listing
          resource :require_additional_review, only: [:create], module: :listing
          resources :agreement_signatures, only: [:destroy], module: :listing
          resource :match_toggle, only: [:create, :destroy], module: :listing
          resources :webhooks, only: :show, module: :listing do
            patch :toggle_active_status
          end
          resources :match_bans, only: [:create, :destroy], module: :listing
          resource :zuora_sync, only: [:create], module: :listing
        end

        resources :stripe_connect_accounts, module: :members, only: [:create, :destroy], constraints: {
          stripe_connect_account_id: STRIPE_ACCOUNT_ID_REGEX,
        } do
          resources :transfers, only: [:index, :create], module: :stripe_connect_accounts
          resource :transfers_preview_partial, only: :show, module: :stripe_connect_accounts
          resource :payouts_preview_partial, only: :show, module: :stripe_connect_accounts
          resource :payout_toggle, only: [:create, :destroy], module: :stripe_connect_accounts
          resources :transfer_match_reversals, only: :create, module: :stripe_connect_accounts
          resource :sync, only: :create, module: :stripe_connect_accounts
          resource :balance_partial, only: :show, module: :stripe_connect_accounts
          resource :payouts, only: :create, module: :stripe_connect_accounts
          resource :deactivation, only: :create, module: :stripe_connect_accounts
        end
      end

      resource :waitlist, only: [] do
        resources :queue, only: :index, module: :waitlist
        resource :export, only: :create, module: :waitlist
      end

      resources :fraud_reviews, only: [:index, :update]

      resources :fiscal_hosts, only: [:index]

      resources :find_listing, only: [:show]

      get "/stripe-customers", to: "stripe_customers#index"

      resources :invoiced_sponsors, only: [:index], path: "invoiced" do
        member do
          resources :stripe_invoices, only: [:new, :create], module: :invoiced, path: "stripe-invoices"
        end
        resources :invoiced_sponsorships, only: [:index], module: :invoiced
        resources :sponsorships, only: [:new, :index, :create, :edit, :update], module: :invoiced
        resources :transfers, only: [:index, :new, :create, :destroy], module: :invoiced do
          resources :reversals, only: [:new, :create], module: :transfers
        end
        resource :payment_run, only: :create, module: :invoiced
        resource :customer, only: [:create, :destroy], module: :invoiced
        resource :credit_balance, only: :create, module: :invoiced
        resource :credit_balance_confirmation, only: :show, module: :invoiced
      end
    end
  end

  unless GitHub.enterprise?
    resources :reused_card_fingerprints, only: [:index, :update], controller: "billing/reused_card_fingerprints" do
      collection do
        get :lookup
      end
    end

    resources :manually_review_payment_methods, only: [:update]
    # GitHub Trade Controls Stafftools
    resource :trade_compliance, module: :trade_compliance, only: [], format: false do
      get "/", to: redirect("/stafftools/trade_compliance/trade_screening_records")
      resources :trade_screening_records, only: [:index]
      resources :batch_operations, only: [:index, :create]
      resources :microsoft_trade_help_emails, only: [:index, :create]
    end
  end

  resources :stripe_webhooks, only: [:index] do
    put "/ignore", to: "stripe_webhooks#ignore"
    put "/perform", to: "stripe_webhooks#perform"
  end

  resources :zuora_webhooks, only: [:index] do
    put "/ignore", to: "zuora_webhooks#ignore"
    put "/investigate", to: "zuora_webhooks#investigate"
    put "/perform", to: "zuora_webhooks#perform"
    post "retry_all", on: :collection
    resource :sales_operations_issue_details, only: [:show], module: :zuora_webhooks
  end

  resources :subscription_sync_statuses, only: [:index, :show] do
    put "/force_sync", to: "subscription_sync_statuses#force_sync"
    put "/mark_successful", to: "subscription_sync_statuses#mark_successful"
    post "bulk_force_sync", on: :collection

    member do
      put "investigate", to: "subscription_sync_statuses#investigate"
    end
  end

  resource :support_plan_uploads, only: [:show, :update]

  if GitHub.codespaces_enabled?
    resources :codespaces_unprocessed_billing_messages, only: [:index, :show]
    resources :codespaces_dials, only: [:index, :edit, :update], controller: "codespaces/dials"
  end

  if GitHub.copilot_enabled?
    resources :copilot_enterprises, only: [:index]
    resources :copilot_bulk_blocks, only: [:index, :create]
    resources :copilot_bulk_unblocks, only: [:index, :create]
  end

  get :accounting, to: redirect("/biztools/accounting")

  resources :vss_subscription_events, only: :index do
    member do
      put "perform"
      put "investigate"
    end
  end
  get "/bundled_license_assignments/orphaned", to: "bundled_license_assignments#orphaned", as: :orphaned_bundled_license_assignments

  resources :metered_product_uuids, only: [:index, :show]
  resources :test_metered_products, only: [:create, :index]

  resources :showcase_collections, path: "showcases" do
    post :perform_healthcheck, to: "showcase_items#perform_healthcheck", as: :healthcheck
    member do
      put :featured, to: "showcase_collections#set_featured"
      delete :featured, to: "showcase_collections#remove_featured"
    end

    resources :showcase_items, path: "items",
                               only: [:create, :edit, :update, :destroy]
  end

  unless GitHub.enterprise?
    resources :enterprise_installations, only: [:index, :show, :destroy] do
      member do
        get :contributions
        get :user_accounts_uploads
        post :enqueue_user_accounts_uploads
        get :accounts
        put :block
        put :unblock
      end
    end
  end

  resources :networks, only: :index do
    collection do
      post :schedule_maintenance_for_failed
    end
  end

  resources :gist_maintenance, only: [:index] do
    member do
      post :schedule_maintenance
      post :mark_as_broken
    end
  end

  resources :fileservers, only: :index
  resources :reflogs, only: :index

  resources :receipts, only: [:create, :show]

  resources :reports, only: :index do
    collection do
      get :dormant_users
      get :active_users
      get :suspended_users
      get :all_users
      get :all_organizations
      get :all_repositories
    end
  end

  resources :projects, only: :show do
    member do
      get :permissions
      put :change_owner
      put :restore
      put :unlock
      put :unlink
      delete :destroy
    end
  end

  get "/topics", as: :topics_index, to: "topics#index"
  get "/topics/:topic", as: :topic, to: "topics#show"
  put "/topics/:topic", to: "topics#update"
  post "/topics/bulk-flag-by-id", as: :topics_bulk_flag, to: "topics#bulk_flag_by_id"
  post "/topics/bulk-flag-matching", as: :topics_bulk_flag_matching, to: "topics#bulk_flag_matching"

  get "/dependency_graph/", as: :dependency_graph, to: "dependency_graph#index"
  match "/dependency_graph/package_results", as: :dependency_graph_package_results, to: "dependency_graph#package_results", via: [:get, :post]
  post "/dependency_graph/assign_packages", as: :dependency_graph_assign_packages, to: "dependency_graph#assign_package"

  get "/bulk_dmca_takedown/parse_notice", to: "bulk_dmca_takedown#parse_notice"
  post "/bulk_dmca_takedown/new", to: "bulk_dmca_takedown#new", as: :new_stafftools_bulk_dmca_takedown
  get "/bulk_dmca_takedown/:id/validate_repos", to: "bulk_dmca_takedown#validate_repos", as: "bulk_dmca_takedown_validate_repos"
  post "/bulk_dmca_takedown/:id/start_job", to: "bulk_dmca_takedown#start_job", as: "bulk_dmca_takedown_start_job"
  resources :bulk_dmca_takedown, only: [:show, :index]

  unless GitHub.enterprise?
    get "/codeql_bulk_building", to: "codeql_bulk_building#index", as: :codeql_bulk_building
    get "/codeql_bulk_building/onboard", to: "codeql_bulk_building#onboard", as: :codeql_bulk_building_onboard
    post "/codeql_bulk_building/onboard", to: "codeql_bulk_building#onboard_submit"
    get "/codeql_bulk_building/offboard", to: "codeql_bulk_building#offboard", as: :codeql_bulk_building_offboard
    post "/codeql_bulk_building/offboard", to: "codeql_bulk_building#offboard_submit"
  end

  get "/copilot_pr_summary_feedback", to: "copilot_pr_summary_feedback#index", as: :copilot_pr_summary_feedback
  get "/copilot_pr_summary_feedback/:feedback_id", to: "copilot_pr_summary_feedback#show", as: :copilot_pr_summary_feedback_details

  get "/security_center", to: "security_center#index", as: :security_center
  post "/security_center/run_dlq_job", to: "security_center#run_dlq_job", as: :security_center_dlq_run_job

  get "/security_incident_response", to: "security_incident_response#index", as: :security_incident_response
  get "/security_incident_response/data", to: "security_incident_response_data#index", as: :security_incident_response_data
  post "/security_incident_response/data", to: "security_incident_response_data#create", as: :security_incident_response_process_data
  post "/security_incident_response/perform_bulk_action", to: "security_incident_response#create", as: :security_incident_response_perform_bulk_action

  get "/hosted_compute_ims_admin", to: "hosted_compute_ims_admin#index", as: :hosted_compute_ims_admin_index
  get "/hosted_compute_ims_admin/curated/new_image", to: "hosted_compute_ims_admin#new_curated_image", as: :hosted_compute_ims_admin_new_image_definiton
  get "/hosted_compute_ims_admin/curated/new_pointer", to: "hosted_compute_ims_admin#new_curated_pointer", as: :hosted_compute_ims_admin_new_pointer
  post "/hosted_compute_ims_admin_image_version", to: "hosted_compute_ims_admin#create", as: :create_hosted_compute_ims_admin_image_version
  get "/hosted_compute_ims_admin/curated/:image_definition_id", to: "hosted_compute_ims_admin#show", as: :image_version
  if GitHub.enterprise?
    get "external_groups", to: "external_groups#index"
    get "external_groups/:id", to: "external_groups#show", as: :external_group_members
  end

  get "repositories", to: "repositories#index"
  resources :repositories, path: "/repositories/:user_id",
                           id: REPO_REGEX, format: false,
                           defaults: { format: :html },
                           only: [:show]

  resources :repositories, path: "/repositories/:user_id",
                           id: REPO_REGEX, format: false,
                           only: [:destroy] do

    resource :preferred_files_redetection, module: :repositories, only: [:create]

    member do
      get :abuse_reports, to: "repositories/abuse_reports#abuse_reports"
      get :actions
      get :actions_billing
      get "/actions_workflow_execution/:check_suite_id", to: "repositories#actions_workflow_execution", as: :actions_workflow_execution
      get "/actions/runs/:workflow_run_id/usage", to: "repositories#actions_workflow_run_usage", as: :actions_workflow_run_usage
      get "/actions/runs/:workflow_run_id/artifacts", to: "repositories#actions_workflow_run_artifacts", as: :actions_workflow_run_artifacts
      post "/actions_workflow_execution/:check_suite_id/heal_check_suite", to: "repositories#heal_check_suite", as: :heal_check_suite
      post "/actions_workflow_execution/:check_suite_id/force_cancel_suite", to: "repositories#force_cancel_suite", as: :force_cancel_suite
      post "/actions_workflow_execution/:check_suite_id/:check_run_id/force_cancel_check_run", to: "repositories#force_cancel_check_run", as: :force_cancel_check_run
      get :actions_workflows
      get "/actions/workflow_schedules", to: "repositories/actions/workflow_schedules#index", as: :actions_workflow_schedules
      post "/actions/workflow_schedules/resync", to: "repositories/actions/workflow_schedules#resync", as: :resync_actions_workflow_schedules
      post "/actions/workflow_schedules/update", to: "repositories/actions/workflow_schedules#update", as: :update_actions_workflow_schedules
      get "/actions/artifacts", to: "repositories/actions/artifacts#index", as: :actions_artifacts
      get :actions_latest_runs
      get :actions_self_hosted_runners
      get :actions_secrets
      get :actions_variables
      get :admin
      get :collaboration
      get :database
      get :dependency_graph, to: "repositories/dependency_graph#dependency_graph"
      get :download_dependency_snapshot, to: "repositories/dependency_graph#download_dependency_snapshot"
      get :exclude_dependency_snapshot, to: "repositories/dependency_graph#exclude_dependency_snapshot"
      get :deploy_keys
      get :disable_job_info
      get :disk
      get :enabled_feature_flags if GitHub.flipper_ui_enabled?
      get :events
      get :topics, to: "repositories/topics#topics"
      get :security_center, to: "repositories/security_center#show"
      post "/security_center/trigger_update_job", to: "repositories/security_center#trigger_update_job", as: :security_center_update_job
      get :security_products, to: "repositories/security_products#show"
      get :languages
      get :notifications
      get :overview
      get :permissions
      get :releases
      post :unpublish_unsearchable_releases
      get :search
      get :security

      resources :star_counts, only: :create, controller: "repositories/star_counts", as: :repository_star_counts

      # no :merge_queue_branch parameter defaults to default repository branch
      get :merge_queue, to: "repositories/merge_queues#show"
      resources :merge_queue, only: [:show], param: :merge_queue_branch, controller: "repositories/merge_queues" do
        post :clear
        post :unlock_group

        resources :entries, only: [:destroy], controller: "repositories/merge_queue_entries", param: :merge_queue_entry_id
      end

      resources :merge_commit_requests, controller: "repositories/merge_commit_requests", only: [:index] do
        collection do
          post :clear
          post :pause
          post :unpause
        end
      end

      post :admin_disable
      post :archive
      post :block_archive_download
      post :unblock_archive_download
      post :analyze_language
      post :change_allow_force_push
      post :change_max_object_size
      post :change_warn_disk_quota
      post :change_lock_disk_quota
      post :change_ssh_access
      post :clear_dependencies, to: "repositories/dependency_graph#clear_dependencies"
      post :clear_snapshot_dependencies, to: "repositories/dependency_graph#clear_snapshot_dependencies"
      post :detect_manifests, to: "repositories/dependency_graph#detect_manifests"
      post :enable_code_search
      post :fix_issue_transfers
      post :fsck
      post :lock
      post :lock_for_migration
      post :hide_from_google
      post :hide_from_discovery
      post :require_login
      post :content_warning
      post :collaborators_only
      post :pause_repo_invite_limit
      post :purge_code
      post :purge_commits
      post :purge_discussions
      post :purge_issues
      post :purge_projects
      post :purge_releases
      post :purge_repository
      post :purge_wiki
      post :rebuild_commit_contributions
      post :reindex_commits
      post :reindex_discussions
      post :reindex_issues
      post :reindex_projects
      post :reindex_releases
      post :reindex_repository
      post :reindex_wiki
      post :toggle_allow_git_graph
      post :toggle_permission
      post :toggle_public_push
      post :toggle_token_scanning
      post :unlock
      post :wiki_mark_as_broken
      post :wiki_restore
      post :wiki_schedule_maintenance
      post :redetect_license
      post :redetect_community_health_files
      post :reindex_code
      post :reindex_blackbird
      post :reindex_org_blackbird
      post :request_access, to: "repositories/staff_access#request_access"
      post :schedule_backup
      post :schedule_wiki_backup
      post :unarchive
      post :change_anonymous_git_access
      post :change_anonymous_git_access_locked
      post :set_used_by, to: "repositories/dependency_graph#set_used_by"
      post :toggle_anonymous_release_download

      put  :unlock_repository
      put  :staff_unlock, to: "repositories/staff_access#staff_unlock"
      put  :staff_override_unlock, to: "repositories/staff_access#override_unlock"

      delete :cancel_access_request, to: "repositories/staff_access#cancel_access_request"
      delete :cancel_unlock, to: "repositories/staff_access#cancel_unlock"
      delete :disable, to: "repositories#remove_disable"
      delete :purge_events

      get :copilot_pr_summary, to: "repositories/copilot_pr_summary#index"
      post :copilot_pr_summary, to: "repositories/copilot_pr_summary#create"
    end

    collection do
      post ":id/permissions/search", to: "repositories#permissions", as: :search_permissions
    end

    resources :images, controller: :repository_images, only: [:index, :destroy]

    get :abilities, to: redirect("/stafftools/repositories/%{user_id}/%{repository_id}/collaboration")

    resources :recommendations, controller: :repository_recommendations, format: false,
                                only: [:index] do
      collection do
        post :opt_out
        post :opt_in
      end
    end

    resources :collaborators, only: [:index]
    resources :notification_settings, only: [:index], controller: :repository_notifications

    resource :country_block, only: [:create, :destroy]
    resource :dmca_takedown, only: [:create, :destroy]

    resources :pull_request_orchestrations, only: [:index, :show] do
      get :database, on: :member
    end

    resources :repository_orchestrations, only: [:index, :show] do
      get :database, on: :member
    end

    get "/repository_rules/insights", to: "repository_rules#rule_insights", as: :repository_rule_insights
    post "repository_rules/deferred_target_counts", to: "repository_rules#ruleset_deferred_target_counts"
    get "/repository_rules/insights/actors", to: "repository_rules#rule_insights_actors"
    get "/repository_rules/:id/history", to: "repository_rules#ruleset_history_summary"
    get "/repository_rules/:id/history/:history_id/compare(/:compare_history_id)", to: "repository_rules#ruleset_history_comparison"
    get "/repository_rules", to: "repository_rules#ruleset_index", as: :repository_rules
    get "/repository_rules/:id", to: "repository_rules#ruleset_show", as: :repository_rule

    resources :custom_properties, only: [:index]

    resources :issues, only: [:index, :show, :destroy] do
      get :database, on: :member

      resources :issue_comments, only: [:index, :show], as: "comments",
                path: "comments" do
        get :first, on: :collection
        get :database, on: :member
      end
      resources :subscriptions, only: :index, controller: :issue_subscriptions
    end

    resources :repository_advisories, only: [:index, :show, :destroy] do
      get :database, on: :member

      resources :repository_advisory_comments, only: [:index, :show], as: "comments",
                path: "comments" do
        get :database, on: :member
      end
    end

    resources :discussions, only: [:index, :show, :destroy] do
      collection do
        resource :category_limit_override,
          module: :discussions,
          only: [:update, :destroy]
      end

      member do
        get :database
        put :lock
        put :unlock
      end

      resources :discussion_comments, only: [:index, :show], as: "comments",
                path: "comments" do
        member do
          get :database
          get :nested_comments
        end
      end
      resources :subscriptions, only: :index, controller: :discussion_subscriptions
      resource :conversion_override, module: :discussions, only: :create
    end

    resources :large_files, only: [:index] do
      collection do
        post   :preview, to: "large_files#enable_repo_preview"
        delete :preview, to: "large_files#disable_repo_preview"
        post   :purge_objects, to: "large_files#purge_objects"
        post   :restore_objects, to: "large_files#restore_objects"
        post   :change_timeout, to: "large_files#change_timeout"
      end

      member do
        post :archive
        post :unarchive
      end
    end

    resource :mirror, only: [:create, :update, :destroy] do
      put :sync
    end

    get :network_tree, to: redirect("/stafftools/repositories/%{user_id}/%{repository_id}/network/tree")
    get :children, to: redirect("/stafftools/repositories/%{user_id}/%{repository_id}/network/children")
    get :siblings, to: redirect("/stafftools/repositories/%{user_id}/%{repository_id}/network/siblings")
    resource :network, only: :show do
      get :children
      get :siblings
      get :tree

      post :change_root
      post :detach
      post :extract
      post :new_extract
      post :increment_git_cache
      post :mark_as_broken
      post :reattach
      post :attach_to
      post :rebuild_network_graph
      post :reparent
      post :schedule_maintenance
      post :block_archive_download
      post :unblock_archive_download
    end

    resource :pages, only: [:show, :create, :destroy] do
      get :status
      get :certificate_status
      get :domain_status
      get :https_status
      put :clear_domain
      put :clear_generated_pages
      put :request_https_certificate
      delete :delete_https_certificate
      put :unlock_build
      put :restore_page
    end

    resources :protected_branches, only: :index

    get :pulls, to: redirect("/stafftools/repositories/%{user_id}/%{repository_id}/issues")
    get :pull_requests, to: redirect("/stafftools/repositories/%{user_id}/%{repository_id}/issues")
    resources :pull_requests, only: [:show, :destroy] do
      collection do
        post :purge
        post :reindex
      end

      member do
        get :database
        post :sync
        post :sync_search_index
        post :maintain_tracking_ref
      end

      resources :issue_comments, only: [:index, :show, :minimize], as: "comments",
                path: "comments" do
        get :first, on: :collection
        get :database, on: :member
      end
      resources :review_comments, only: [:index, :show] do
        get :database, on: :member
      end
      resources :subscriptions, only: :index, controller: :issue_subscriptions
    end

    resources :redirects, only: [:index, :create, :destroy]
    resources :repository_files, only: [:index, :show, :destroy] do
      get :database, on: :member
    end

    get :pushlog, to: redirect("/stafftools/repositories/%{user_id}/%{repository_id}/reflog")
    resource :reflog, only: [:show] do
      post :restore
    end

    get "/activity", to: "activity#index"
    get "activity/actors", to: "activity#actors"

    resources :projects, only: [:index]

    resource :svn, only: [:show], controller: "slumlord" do
      post :toggle_blocked
      post :toggle_debug
    end

    resources :watchers, only: :index, controller: :repository_watchers

    resources :vulnerability_alerts, only: [:index, :show]

    resource :dependabot, only: [:show], controller: :repository_dependabot do
      post :debug_update_config
    end

    resource :interaction_limits, only: [:update], module: :repositories
    resource :funding_links, only: [:show, :create, :destroy], module: :repositories
  end

  # External asset hosting (via git lfs)
  get    "/large_file_storage",                 to: "large_file_storage#index",        as: :large_file_storage
  get    "/:user_id/large_file_storage",        to: "large_file_storage#show",     as: :user_large_file_storage
  put    "/:user_id/large_file_storage",        to: "large_file_storage#update",   as: :user_update_large_file_storage
  get    "/:user_id/large_file_storage/edit",   to: "large_file_storage#edit",     as: :user_edit_large_file_storage

  # Trust Tier
  scope "/users/:user_id", as: :user do
    resources :trust_tiers, controller: :trust_tiers, only: [:index, :show] do
    end
    put "/trust_tiers/change_tier", to: "trust_tiers#change_tier", as: :change_trust_tier
  end
  # Codespaces
  scope "/users/:user_id", as: :user do
    resources :codespaces, controller: :codespaces, only: [:index, :show] do
      member do
        get :suspend_environment_component
        post :suspend_environment
        post :deprovision_environment
        post :fail_environment
        post :refresh_environment_data
        post :restore_environment
      end
    end

    post "/codespaces/deprovision_dependent_codespaces", to: "codespaces#deprovision_dependent_codespaces",  as: :deprovision_dependent_codespaces
    post "/codespaces/suspend_dependent_codespaces", to: "codespaces#suspend_dependent_codespaces",  as: :suspend_dependent_codespaces
    put "/codespaces/change_tier", to: "codespaces#change_tier", as: :change_tier
    post "/codespaces/bulk_restore_environments", to: "codespaces#bulk_restore_environments", as: :bulk_restore_environments
  end

  scope "/users/:user_id", as: :user do
    resource :copilot_seat_assignments, controller: :copilot_seat_assignments
    resource :copilot_seats, controller: :copilot_seats
    resource :copilot_settings, controller: :copilot_settings
    resource :copilot_usage_metrics, controller: :copilot_usage_metrics
    resource :copilot_business_trials, controller: :copilot_business_trials, only: [:create, :update, :destroy]
    put "/copilot_settings/administrative_block", to: "copilot_settings#administrative_block", as: :copilot_administrative_block
    post "/copilot_bulk_blocks/organization", to: "copilot_bulk_blocks#block_organization", as: :copilot_block_organization
    put "/copilot_settings/warn_via_sire", to: "copilot_settings#warn_via_sire", as: :copilot_warn_via_sire
    put "/copilot_settings/auth_and_capture", to: "copilot_settings#auth_and_capture", as: :copilot_auth_and_capture
    put "/copilot_settings/toggle_email_notifications", to: "copilot_settings#toggle_email_notifications", as: :copilot_toggle_email_notifications
    post "copilot_settings/migrate_copilot_for_prs", to: "copilot_settings#migrate_copilot_for_prs", as: :migrate_copilot_for_prs
    post "/copilot_settings/generate_csv", to: "copilot_settings#generate_csv", as: :copilot_generate_csv
    post "/copilot_settings/update_plan", to: "copilot_settings#update_plan", as: :copilot_update_plan
  end

  resources :copilot_seats, only: [:update, :destroy], param: :seat_id
  resources :copilot_seat_assignments, only: [:update, :destroy], param: :seat_assignment_id

  # Package hosting via GPR
  if !GitHub.enterprise? || (GitHub.enterprise? && GitHub.registry_v2_enabled_for_enterprise?)
    get    "/:user_id/packages",                                                                        to: "packages#index",                                 as: :user_packages
    get    "/:user_id/organization_packages",                                                           to: "organization_packages#index",                    as: :user_organization_packages
    delete "/:user_id/packages/:repo_name/:package_id/versions/:package_version",                       to: "packages#delete_version",                        as: :user_delete_package_version,                   constraints: { repo_name: REPO_REGEX, package_version: /[^\/]+/ }
    delete "/:user_id/packages/:repo_name/:package_id",                                                 to: "packages#purge_deleted",                         as: :user_purge_deleted_package,                    constraints: { repo_name: REPO_REGEX }
    delete "/:user_id/organization_packages/:ecosystem/:namespace/:id/",                                to: "organization_packages#purge_deleted",            as: :user_purge_deleted_organization_package
    delete "/:user_id/packages/:repo_name",                                                             to: "packages#delete_for_repo",                       as: :user_delete_packages_for_repo,                 constraints: { repo_name: REPO_REGEX }
    post   "/:user_id/packages/trigger_packages_billing_reconciliation",                                to: "packages#trigger_billing_reconciliation",        as: :user_trigger_packages_billing_reconciliation
    post   "/:user_id/packages/trigger_packages_docker_storage_reset",                                  to: "packages#trigger_docker_storage_reset",          as: :user_trigger_packages_docker_storage_reset
    post   "/:user_id/packages/trigger_packages_migration",                                             to: "packages#trigger_packages_migration",            as: :user_trigger_packages_migration
    get    "/:user_id/actions_packages",                                                                to: "actions_packages#show",                          as: :user_actions_packages_usage
  end

  get "/indexing", to: redirect("/stafftools/search_indexes")
  get "/indexing/new", to: redirect("/stafftools/search_indexes/new")
  get "/indexing/:name/manage", to: redirect("/stafftools/search_indexes/%{name}")
  get "/indexing/:name/repair", to: redirect("/stafftools/search_indexes/%{name}/repair")

  resources :search_indexes, except: [:edit] do
    collection do
      post :toggle_code_search
      post :toggle_code_search_indexing
    end

    member do
      put :make_primary
      put :update_version

      get :repair
      post :repair, to: "search_indexes#start_repair"
      put :pause_repair
      put :update_workers
      delete :repair, to: "search_indexes#reset_repair"
    end
  end

  resources :reserved_logins, only: [:index, :create, :destroy], param: :login
  get "/reserved_logins/search", to: "reserved_logins#search"

  resources :retired_namespaces, only: [:index, :destroy]

  resource :bulk_ticketer, only: [:show, :create]

  if GitHub.single_business_environment?
    get "/organizations", to: redirect("/business")
    get "/users/organizations", to: redirect("/business")
  end

  namespace :billing do
    if GitHub.iap_enabled?
      namespace :iap do
        resources :apple_lookups, only: %i[new create]
        resources :google_lookups, only: %i[new create]
      end
    end

    resources :billing_jobs, only: [:index] do
      collection do
        resources :business_organization_billing_job, only: [:index] do
          put :perform, on: :member
        end
      end
    end
    resource :metered_service_locks, only: [:create, :destroy]
    resources :pricings, only: [:index]
    resources :products, only: [:index, :show, :new, :create, :edit, :update] do
      resources :pricings, only: [:show, :new, :create, :edit, :update]
    end
    resources :dead_letter_queues, only: [:index, :show]
    resources :sales_tax_exemption, only: [:update]
    resource :trigger_azure_emission, only: [:show]
    resource :trigger_watermark_workflows, only: [:show]
    resource :generate_usages, only: [:show, :create]
    resource :can_proceed_with_usage, only: [:show, :create]
    resource :trigger_high_watermark_rollover, only: [:show]
    put "/dead_letter_queue/do_process_queue", to: "dead_letter_queues#do_process_queue"
    put "/dead_letter_queue/do_clear_queue", to: "dead_letter_queues#do_clear_queue"
    get "/trigger_azure_emission/trigger_emission", to: "trigger_azure_emissions#trigger_emission"
    get "/trigger_watermark_workflows/trigger", to: "trigger_watermark_workflows#trigger"
    get "/trigger_high_watermark_rollover/trigger", to: "trigger_high_watermark_rollovers#trigger"
    resources :onboard_billing_platform_customers, only: [:index, :new, :create, :destroy, :show]
  end

  if GitHub.enterprise?
    resources :dormant_users, only: [:index]
    resource :dormant_users, only: [] do
      scope module: :dormant_users do
        resource :bulk_suspension, only: [:create]
      end
    end

    resources :suspended_users, only: [:index]
  end

  resources :user_restorations, only: [:create]

  namespace :users do
    if GitHub.enterprise?
      get :invite, to: redirect("/stafftools/users/invitations/new")
      resources :invitations, only: [:new, :create]
    end

    resources :site_admins, only: [:index]
    resources :ip_addresses, only: [:show], id: IP_REGEX
  end

  resources :users, only: [:index, :show, :destroy] do
    scope module: :users do
      resources :abuse_reports, only: [:index]
      resources :acv_contributions, only: [:index, :update]
      resources :administrative_tasks, only: [:index], path: :admin
      resources :anonymously_accessible_repositories, only: [:index]
      resources :interactions, only: :index
      resources :notes,
        only: %i(create update destroy),
        controller: "/stafftools/staff_notes"
      resources :profile_highlight_contributions, only: [:index, :update]
      resources :hubber_access_overrides, only: [:create]
      resources :site_admins, only: [:create]
      resources :insight_backfills, only: [:create]
      resources :blocks, only: [:create, :destroy], param: :login
      resources :follows, only: [:destroy], param: :login
      resources :domains, only: [:index]
      resources :enterprise_installations, only: [:index]
      resources :team_sync_configurations, only: [:create]
      resources :moderators, only: [:index]

      if GitHub.flipper_ui_enabled?
        resources :enabled_feature_flags, only: [:index]
      end

      resource :activity, only: [:show, :destroy]
      resource :for_you_feed, only: [:destroy]
      resource :azure_exp, only: [:show, :destroy], controller: "azure_exp"
      resource :overview, only: [:show]
      resource :force_push_preference, only: [:update]
      resource :ssh_access_preference, only: [:update]
      resource :database_record, only: [:show]
      resource :employee_access_revocation, only: [:create]
      resource :privileged_access_revocation, only: [:create]
      resource :ip_allowlist, only: [:show, :destroy]
      resource :pronouns, only: [:destroy]
      resource :large_scale_contributor_classification, only: [:update]
      resource :contribution_class_flags, only: [:update]
      resource :log, only: [:show]
      resource :interaction_ban, only: [:create, :destroy]
      resource :legal_hold, only: [:create, :destroy]
      resource :operator_mode, only: [:create, :destroy]
      resource :standard_contractual_clauses, only: [:create, :destroy]
      resource :suspension, only: [:create, :destroy]
      resource :transformation_lockout, only: [:destroy]
      resource :lockout, only: [:destroy]
      resource :terms_of_service_record, only: [:show, :update]
      resource :github_developer_promotion, only: [:create]
      resource :github_biztools_promotion, only: [:create]
      resource :profile_data, only: [:destroy]
      resource :max_packages_authorizable_per_token, only: [:update], controller: "max_packages_authorizable_per_token"

      resource :security, only: [:show]

      unless GitHub.single_business_environment?
        resource :emu_deprovisioning, only: [:create, :destroy], controller: "emu_deprovisioning"
      end

      unless GitHub.enterprise?
        resources :sudo, only: [:destroy]
      end

      resource :security, only: [], path: "/" do
        scope module: :securities do
          resource :history, only: [:show], path: :security_history
        end
      end

      resource :search_record, only: [:show] do
        scope module: :search_records do
          resource :reindex_request, only: [:create]
          resource :reindex_org, only: [:create]
        end
      end

      resource :rate_limits, only: [:show, :destroy] do
        scope module: :rate_limits do
          resource :override, only: [:update]
          resource :temporary_override, only: [:create]
        end
      end

      resource :rename, only: [:create] do
        scope module: :renames do
          resource :status, only: [:show]
        end
      end

      resources :successors, only: [:index]
      resource :successors, only: [] do
        scope module: :successors do
          resource :promotion, only: [:create]
        end
      end

      resource :repositories, only: [] do
        scope module: :repositories do
          resources :notification_preferences, only: [:index]
          resources :notifyd_notifications, only: [:index]
          resources :collaborations, only: [:index]
          resources :stars, only: [:index]
          resources :roles, only: [:index]

          resources :contributions, only: [:index]
          resource :contributions, only: [] do
            scope module: :contributions do
              resource :rebuild, only: [:create]
            end
          end

          resource :deleted, only: [:show]
          resource :disabled, only: [:show]
          resource :dmca, only: [:show]
          resource :internal, only: [:show]
          resource :locked, only: [:show]
          resource :public, only: [:show]

          resource :bulk_privatization, only: [:create]

          resource :pages, only: [:show, :update]
        end
      end

      resources :repositories, only: [:index] do
        scope module: :repositories do
          resource :notification_preferences, only: [:destroy]
        end
      end

      resources :ssh_keys, only: [:index]
      resource :ssh_keys, only: [] do
        scope module: :ssh_keys do
          resource :verification, only: [:create]
          resources :certificate_authorities, only: [:index, :destroy]
        end
      end

      resources :org_roles, only: [:index]
      resources :org_role_assignments, only: [:index]


      namespace :billing do
        resources :zuora_webhooks, only: [:index]
        get :codespaces_usage, to: "codespaces_usage#show"
        resources :actions_usage, only: [:index]
        resources :packages_usage, only: [:index]
        resources :spending_limits, only: [:index] do
          collection do
            post :update
          end
        end
        resources :sdlc_licensing, only: [:index] do
          collection do
            put :update
          end
        end
      end

      resource :trade_compliance, only: [:show, :create], controller: :trade_compliance do
        scope module: :trade_compliance do
          # trade screening routes
          resource :screening_profile, only: [:update, :destroy], controller: :screening_profile
          resource :manual_screening, only: [:create], controller: :manual_screening
          resource :sdn_suspension, only: [:create, :destroy], controller: :sdn_suspension
          # trade controls routes
          resource :check_violations, only: [:show], controller: :check_violations
          resource :restrictions_enforcement, only: [:create, :update, :destroy], controller: :restrictions_enforcement
        end
      end
    end

    get "/org_owners", to: redirect("/stafftools/users/%{user_id}/owners")
    get "/history", to: "users/billing/history#index", as: "billing_history"
    get "/invoices", to: "users/billing/invoices#index", as: "billing_invoices"
    get "/invoices/:invoice_number", to: "users/billing/invoices#show", as: "billing_show_invoice"

    nested do
      scope :metered_billing, as: :metered_billing do
        get :actions, to: "users/metered_billing#actions"
        get :packages_bandwidth, to: "users/metered_billing#packages_bandwidth"
        get :shared_storage_usage, to: "users/metered_billing#shared_storage_usage"
        get :actions_artifact_expirations, to: "users/metered_billing#actions_artifact_expirations"
        get :copilot_usage, to: "users/metered_billing#copilot_usage"
        patch :advance_quota_reset_date, to: "users/metered_billing#advance_quota_reset_date"
        patch :rebuild_from_events, to: "users/metered_billing#rebuild_from_events"
      end

      resources :metered_exports, only: [:index, :show, :create], controller: "users/metered_exports"
      resource :interaction_limits, only: [:update], module: :users
    end

    resources :reminders, only: [:index], controller: "users/reminders"

    resources :retired_namespaces, only: [:index, :create, :destroy], controller: "users/retired_namespaces" do
      collection do
        delete "multiple", to: "users/unretire_multiple_namespaces#destroy"
      end
    end


    unless GitHub.enterprise?
      resource :advanced_security, only: [:show], controller: "users/advanced_security", as: :advanced_security do
        post :show
        get :download_active_committers
        get :download_maximum_committers
      end
    end

    member do
      get :billing, to: "users/billing#index"
      get "billing/emails", to: "users/billing#emails"
      get :billing_managers, to: "users/billing#billing_managers"
      get :invitations, to: "teams#invitations"
      get :failed_invitations, to: "teams#failed_invitations"
      get :invitation_opt_outs, to: "teams#invitation_opt_outs"
      get :members, to: "teams#direct_members"
      get :guest_collaborators, to: "teams#guest_collaborators"
      get :outside_collaborators, to: "teams#outside_collaborators"
      get :repository_collaborators, to: "teams#outside_collaborators"
      get :owners, to: "teams#owners"
      get :pending_collaborators, to: "teams#pending_collaborators"

      get :members_export, to: "orgs/members_export#show"
      post "members_export(.:format)", to: "orgs/members_export#create"

      post :stop_billing_check, to: "users/billing#stop_billing_check"
      post :add_owner, to: "teams#add_owner"
      post :demote_owner, to: "teams#demote_owner"
      post :billable_rollback, to: "users/billing/billable_rollbacks#create"
      post :update_bill_cycle_day, to: "users/billing#update_bill_cycle_day"
      post :charge, to: "users/billing#charge"
      post :lock_billing, to: "users/billing#lock_billing"
      post :pay_by_credit_card, to: "users/billing#pay_by_credit_card"
      post :pay_by_invoice, to: "users/billing#pay_by_invoice"
      post :remove_credit_card, to: "users/billing#remove_credit_card"
      post :run_pending_changes, to: "users/billing#run_pending_changes"
      post :sync_external_subscription, to: "users/billing#sync_external_subscription"
      post :sync_account_information, to: "users/billing#sync_account_information"
      post :reset_billing_attempts, to: "users/billing#reset_billing_attempts"
      post :unlock_billing, to: "users/billing#unlock_billing"

      put :change_plan, to: "users/billing#change_plan"
      put :edit_extra_billing_info, to: "users/billing#edit_extra_billing_info"
      put :change_seat_limit_for_upgrades, to: "users/billing#change_seat_limit_for_upgrades"
      put :update_metered_via_azure, to: "users/billing#update_metered_via_azure"
      put :update_azure_subscription, to: "users/billing#update_azure_subscription"
      put :change_advanced_security, to: "users/advanced_security#change_advanced_security"

      post :action_invocation, to: "action_invocation#unblock"
      delete :action_invocation, to: "action_invocation#block"

      post   :preview_lfs, to: "large_files#enable_user_preview"
      delete :preview_lfs, to: "large_files#disable_user_preview"
      post   :rebuild_status, to: "large_files#rebuild_status"

      unless GitHub.enterprise?
        post   :preview_gpr, to: "packages#enable_user_preview"
        delete :preview_gpr, to: "packages#disable_user_preview"
      end

      get :subpoena_discovery, to: "legal#subpoena_discovery"

      resource :dependabot, only: [:show], controller: :dependabot

      resource :dependency_graph, controller: :dependency_graph do
        get  :org, to: "dependency_graph#show"
        post :clear_org_dependencies
        post :redetect_org_dependencies
      end

      get "security_configurations", to: "security_configurations#index"
      get "security_configurations/:security_configuration_id", to: "security_configurations#show", as: :security_configuration
    end

    resource :data_packs, only: :destroy, to: "users/data_packs#delete"
    unless GitHub.enterprise?
      resources :prepaid_metered_usage_refills, only: [:index, :destroy], controller: "users/prepaid_metered_usage_refills"
    end

    resources :organization_external_identities, only: [:index, :show, :destroy],
      path: :external_identities,
      as: :external_identities

    resources :organization_unlinked_external_identities, only: [:index, :show, :destroy],
      path: :unlinked_external_identities,
      as: :unlinked_external_identities

    get "/legacy_show", to: redirect("/stafftools/users/%{user_id}")

    resources :applications, only: [:index, :show, :update] do
      get :index, to: "applications#user", on: :collection
      get "/developers/", to: "applications#developers", on: :collection
      get "/github/", to: "applications#github", on: :collection
      put :update_creation_limit, to: "applications#update_creation_limit", on: :collection

      member do
        post :suspend
        post :enable
      end

      resource :authorization, only: [:show, :destroy]
      resource :transfer, only: [:create], controller: "application_transfers" do
        get "/transfer_suggestions", to: "application_transfers#transfer_suggestions"
      end
    end

    put "/authenticated_devices/verify", to: "authenticated_devices#verify"
    put "/authenticated_devices/unverify", to: "authenticated_devices#unverify"

    delete "/mobile_registrations/:oauth_access", to: "mobile_registrations#destroy", as: :mobile_registration

    resources :avatars, only: [:index, :destroy] do
      collection do
        post :revert_to_gravatar
        post :purge
      end

      member do
        put :promote
      end
    end

    if GitHub.billing_enabled?
      resources :subscription_items, only: [:index, :show, :destroy]

      get "/billing/per_seat_pricing_model", to: redirect("/stafftools/users/%{user_id}/per_seat_pricing_model")
      resource :per_seat_pricing_model, only: [:show, :update],
        controller: "per_seat_pricing_model"

      resource :seat_change, only: :show,
        controller: "seat_change"

      resource :plan_subscription, only: [] do
        collection do
          get :synchronization
          get :payment_information
        end
      end

      resource :auto_pay, only: [], controller: :auto_pay do
        put :enable
        put :disable
      end
    end

    get "/issue_comments", to: redirect("/stafftools/users/%{user_id}/comments")
    resources :comments, only: :index

    resources :emails, only: [:index, :create, :destroy] do
      collection do
        get :duplicates
        put :disable_mandatory_email_verification
        put :disable_marketing_email
        put :repair_primary
        put :request_verification
        put :restore_mandatory_email_verification
        put :set_email
        put :change_email_notifications
        put "/unclaim_primary_email", to: "email_claims#update", as: :unclaim_primary_email
        put "/email_claim_resend_verification", to: "email_claims#create", as: :email_claim_resend_verification
        delete "/billing_external_emails/:id", to: "emails#destroy_billing_external_email", as: :billing_external_emails

        unless GitHub.enterprise?
          put :request_unlink
        end
      end

      member do
        put :repair
      end
    end

    resource :profile, only: [:show] do
      collection do
        put :recalculate_all
        put :recalculate_attribute
        put :toggle_attribute
      end
    end

    resources :achievements, only: [:index, :new, :create, :destroy, :edit, :update]
    resource(
      :social_account,
      only: [:update],
      path: "social_accounts/:existing_provider_key/:new_provider_key",
    )

    resources :gists, only: [:index, :show, :destroy] do
      collection do
        get :deleted
      end

      member do
        post :restore

        delete :purge

        post :dmca_takedown
        delete :dmca_takedown, to: "gists#dmca_restore"

        post :country_block
        delete :country_block, to: "gists#remove_country_block"

        post :schedule_backup
        post :mark_as_broken
        post :schedule_maintenance
        post :block_archive_download
        post :unblock_archive_download
      end
    end

    resources :gpg_keys, only: [:index, :show] do
      get :database, on: :member
    end

    resources :installations, only: [:index, :show, :update], controller: "integration_installations" do
      member do
        post   "/suspensions", action: :suspend,   as: :suspend
        delete "/suspensions", action: :unsuspend, as: :unsuspend
        delete "/uninstall",   action: :uninstall, as: :uninstall
      end
    end

    resources :apps, only: [:index, :show], controller: "integrations", as: :apps do
      collection do
        get :authorizations
        put :update_creation_limit
        post :suspensions, action: :suspend_all, as: :suspend
        delete :suspensions, action: :unsuspend_all, as: :unsuspend
      end

      member do
        post :rename
        delete :public_keys, to: "integrations#revoke_public_keys", as: :revoke_public_keys
        patch :toggle_hook_active_status
        post :suspensions, action: :suspend, as: :suspend
        delete :suspensions, action: :unsuspend, as: :unsuspend
      end

      resource :authorization, only: [:show, :destroy], controller: "authorizations"
      resource :listing, only: [:create, :update], controller: "integration_listings"
      resource :transfer, only: [:create], controller: "integration_transfers" do
        get "/transfer_suggestions", to: "integration_transfers#transfer_suggestions"
      end
    end

    get  :ldap, to: "ldap#index", on: :collection
    post :ldap, to: "ldap#create", on: :collection
    resource :ldap, only: [:update], controller: "ldap" do
      put :sync
    end

    resources :oauth_tokens, only: [:index, :show, :destroy] do
      put :compare, on: :member
    end

    resources :personal_access_tokens, path: "personal-access-tokens", only: [:index, :show, :destroy] do
      put :compare,    on: :member
      get :expiration, on: :member

      get :owners, on: :collection, action: :index, controller: "personal_access_tokens/owners"
      get "requests-pending-approval", on: :collection, action: :index, controller: "personal_access_tokens/grant_requests/pending_approvals"

      resources :organizations, only: [:index, :show], controller: "personal_access_tokens/grants/organizations" do
        scope controller: "personal_access_tokens/grant_requests/organizations" do
          get :requests, action: :index, on: :collection
          get :request,  action: :show,  on: :member
        end
      end

      resources :users, only: [:index, :show], controller: "personal_access_tokens/grants/users" do
        scope controller: "personal_access_tokens/grant_requests/users" do
          get :requests, action: :index, on: :collection
          get :request,  action: :show,  on: :member
        end
      end
    end

    get "/orgs", to: redirect("/stafftools/users/%{user_id}/organization_memberships")
    resources :organization_memberships, only: [:index, :show]
    post "/organization_memberships/remove_user/:id",
        to: "organization_memberships#remove_user",
        as: :remove_from_org
    put "/organization_memberships/enable_two_factor_requirement/:id",
         to: "organization_memberships#enable_two_factor_requirement",
         as: :enable_two_factor_requirement
    put "/organization_memberships/disable_two_factor_requirement/:id",
         to: "organization_memberships#disable_two_factor_requirement",
         as: :disable_two_factor_requirement
    get "/audit_log_teaser",
        to: "audit_log_teaser#show",
        as: :audit_log_teaser

    resource :password, only: [] do
      put :randomize
      put :send_reset_email
    end

    resource :feature_enrollments, only: [:show] do
      post :toggle
    end

    resources :projects, only: [:index]

    resource :saml_provider, only: :destroy, to: "orgs/saml_providers#destroy"

    resource :spam, only: [:create, :destroy], controller: "spam" do
      post :flag_all
      post :allowlist
      post :toggle_renaming_or_deleting
      post :toggle_override_for_owned_orgs
    end

    resources :teams, only: [:index, :show] do
      collection do
        post :set_invitation_rate_limit
        post :reset_invitation_rate_limit
        post :remove_invitation_opt_out
      end

      member do
        get :database
        get :members
        get :repositories
        get :child_teams
        get :external_groups
        get :requests
        get :group_sync_status
        put :reconcile
        put :sync
        post :migration_override
      end

      resource :ldap, only: [] do
        put :update, to: "ldap#update_team"
        put :sync, to: "ldap#sync_team"
      end

      get "/external_groups/:group_id/members", to: "teams#external_members", as: :external_members
    end

    resource :two_factor_credential, only: :destroy do
      put :check_otp
      put :send_test_sms
      post :change_sms_provider
      post :approve_2fa_removal_request
      post :decline_2fa_removal_request
    end

    resources :trial_extensions, only: [:create], controller: "users/trial_extensions"

    unless GitHub.enterprise?
      resources :staff_access_requests,
        only: %i(create destroy),
        controller: "users/staff_access_requests"

      resources :invitations_collections, param: :state, only: :destroy, controller: "orgs/invitations_collections"
    end

    if GitHub.enterprise?
      resource :saml_mapping, only: :update, controller: "users/saml_mapping"
    end

    resource :soft_deletion, only: :create, controller: "orgs/soft_deletion"

    resources :undeletes, only: [:create], controller: "users/undeletes"

    resource :security_center, controller: "orgs/security_center", only: [:show]
    get  "/security_center/code_scanning/alert_counts", to: "orgs/security_center#code_scanning_alert_counts", as: :security_center_code_scanning_alert_counts
    get  "/security_center/secret_scanning/alert_counts", to: "orgs/security_center#secret_scanning_alert_counts", as: :security_center_secret_scanning_alert_counts
    get  "/security_center/dependabot/alert_counts", to: "orgs/security_center#dependabot_alert_counts", as: :security_center_dependabot_alert_counts
    post "/security_center/trigger_reconciliation_job", to: "orgs/security_center#trigger_reconciliation_job", as: :security_center_reconciliation_job
    post "/security_center/initialize_analytics", to: "orgs/security_center#initialize_analytics", as: :security_center_initialize_analytics
    post "/security_center/reset_analytics", to: "orgs/security_center#reset_analytics", as: :security_center_reset_analytics
    post "/security_center/enqueue_analytics_reconciliation", to: "orgs/security_center#enqueue_analytics_reconciliation", as: :security_center_enqueue_analytics_reconciliation
    post "/security_center/clear_analytics_reconciliation", to: "orgs/security_center#clear_analytics_reconciliation", as: :security_center_clear_analytics_reconciliation

    get "/organization_rules/insights", to: "users/organization_rules#rule_insights"
    get "/organization_rules/insights/actors", to: "users/organization_rules#rule_insights_actors"
    get "/organization_rules/:id", to: "users/organization_rules#ruleset_show"
    get "/organization_rules/:id/history", to: "users/organization_rules#ruleset_history_summary"
    get "/organization_rules/:id/history/:history_id/compare(/:compare_history_id)", to: "users/organization_rules#ruleset_history_comparison"
    get "/organization_rules", to: "users/organization_rules#ruleset_index"
    post"/organization_rules/deferred_target_counts",         to: "users/organization_rules#ruleset_deferred_target_counts"

    resources :organization_custom_properties, only: [:index, :show], controller: "users/organization_custom_properties"

    resource :archive, only: %i(create destroy), controller: "orgs/archive"
  end

  resources :domains, only: [:show] do
    member do
      put :verify
      put :unverify
      put :set_token_expiration
    end
  end

  get "/internal-apps",                         to: "internal_apps#index", as: :internal_apps
  get "/internal-apps/:app_alias",              to: "internal_apps#show", as: :internal_apps_show

  if GitHub.actions_enabled?
    get "/users/:user_id/actions", to: "actions#show_user_actions", as: :user_actions
    get "/:user_id/actions", to: "actions#show_org_actions", as: :org_actions
    post "/:user_id/actions/restore_owner", to: "actions#restore_billing_owner", as: :actions_restore_billing_owner
    post "/:user_id/actions/onboard_larger_runners", to: "actions#onboard_larger_runners", as: :actions_onboard_larger_runners
    post "/:user_id/actions/larger_runners_manage_beta_features", to: "actions#larger_runners_manage_beta_features", as: :actions_larger_runners_manage_beta_features
  end

  unless GitHub.single_business_environment?
    scope "/users/:user_id", as: :user, module: :users do
      resource :hosted_compute_networking, controller: :hosted_compute_networking, only: [:show]
    end
  end

  get "/search", to: "search#search", as: :search
  get "/search/search_results_async", to: "search#search_results_async", as: :search_results_async
  get "/audit_log", to: "search#audit_log", as: :audit_log
  get "/audit-log/query-results",   to: "search#async_query_results",  as: :audit_log_query_results
  get "/audit-log/query-status",    to: "search#async_query_status",   as: :audit_log_query_status
  post "/audit-log/query",          to: "search#async_query_start",    as: :audit_log_query_start
  get "/audit_log/advanced_search", to: "search#audit_log_advanced_search", as: :audit_log_advanced_search
  get "/cname", to: "search#cname", as: :search_cname
  get "/user_assets", to: "search#user_assets", as: :search_user_assets
  get "/actions_workflow_execution", to: "search#actions_workflow_execution", as: :search_actions_workflow_execution

  get "/user_assets/:id", to: "user_assets#show", as: :user_asset
  delete "/user_assets/:id", to: "user_assets#destroy"
  post "/user_assets/:id/send_for_scanning", to: "user_assets#send_for_scanning", as: :user_asset_scan
  post "/users/:user_id/batch_scan_user_assets", to: "user_assets#send_for_batch_scan_for_user", as: :user_asset_batch_scan
  post "/repositories/:repository_id/batch_scan_repository_assets", to: "user_assets#send_for_batch_scan_for_repository", as: :repository_asset_batch_scan

  get  "/restore/:id/partial", to: "purgatory#restore_partial", as: :restore_repo_partial
  get  "/restore/:id", to: "purgatory#restore_status", as: :restore_repo
  post "/restore/:id", to: "purgatory#restore"
  post "/restore_bulk", to: "purgatory#restore_bulk", as: :restore_repo_bulk

  get  "/purge/:id", to: "purgatory#purge_status", as: :purge_repo
  post "/purge/:id", to: "purgatory#purge"

  get  "/detach/:id", to: "purgatory#detach_status", as: :detach_repo
  post "/detach/:id", to: "purgatory#detach"

  post "/impersonate/:id", to: "sessions#impersonate", as: "impersonate"

  unless GitHub.enterprise?
    post "/override_impersonate/:id", to: "sessions#override_impersonate", as: "override_impersonate"
  end

  delete "/impersonate",   to: "sessions#back_to_the_login", as: "deimpersonate"

  resource :ssh_audit, as: :ssh_audit, controller: "ssh_audit", only: :create

  get "/graphs/flamegraph", to: "graphs#flamegraph"

  get  "/explore", to: "explore#index", as: :explore
  post "/explore/queue_trending", to: "explore#queue_trending", as: :trending_job_queue

  get "/storage", to: "storage#index", as: :storage
  get "/storage/blobs", to: "storage#blobs", as: :storage_blobs
  get "/storage/blobs/:oid", to: "storage#blob", as: :storage_blob
  get "/assets", to: "assets#index", as: :assets
  get "/assets/avatars/:id", to: "assets#avatar", as: :asset_avatar
  get "/assets/:oid", to: "assets#show", as: :asset

  get    "/locked_ip", to: "locked_ip#index", as: :locked_ip
  delete "/locked_ip/:ip_address", to: "locked_ip#destroy", as: :remove_locked_ip, ip_address: IP_REGEX
  post   "/locked_ip/:ip_address/whitelist", to: "locked_ip#whitelist", as: :whitelist_ip, ip_address: IP_REGEX
  delete "/locked_ip/:ip_address/whitelist", to: "locked_ip#unwhitelist", as: :unwhitelist_ip, ip_address: IP_REGEX

  if GitHub.billing_enabled?
    get  "/billing_transactions/search", to: "billing_transactions#index", as: :billing_transaction
    get  "/deleted_account_transactions", to: "deleted_account_transactions#index", as: :deleted_account_transactions

    post "/billing_transactions/refunds/:transaction_id", to: "refunds#create", as: :billing_transactions_refund
    post "/:user/refund_transaction", to: "refunds#create", as: :user_refund_transaction
    post "/billing_transactions/cancel_authorization_billing_transaction", to: "billing_transactions#cancel_authorization_billing_transaction", as: :cancel_authorization_billing_transaction
  end

  resources :compliance_reports, param: :slug

  resources :enterprises, controller: "businesses", param: :slug do
    scope module: :businesses do
      namespace :billing do
        get "/payment_history", to: "payment_history#index", as: :payment_history
        resources :zuora_webhooks, only: [:index]
        get :codespaces_usage, to: "codespaces_usage#show"
        resources :actions_usage, only: [:index]
        resources :packages_usage, only: [:index]
        resources :sponsorships, only: [:index]
      end
      get :marketplace, to: "marketplace#index"

      # business trade compliance
      resource :trade_compliance, only: [:show, :create], controller: :trade_compliance do
        scope module: :trade_compliance do
          resource :screening_status, only: [:update], controller: :screening_status
        end
      end
    end

    member do
      resources :organizations,
        as: :enterprise_organizations,
        controller: "businesses/organizations",
        param: :organization,
        only: %w(index create destroy) do
        collection do
          get :summary, to: "businesses/organizations_summary#index"
        end
      end
      resource :member_organizations,
        as: :enterprise_member_organizations,
        controller: "businesses/member_organizations",
        only: :destroy
      resources :deleted_organizations,
        as: :enterprise_deleted_organizations,
        controller: "businesses/deleted_organizations",
        only: %w(index)
      resources :enterprise_teams,
        controller: "businesses/enterprise_teams",
        only: %w(index show database) do
          member do
            get :database
          end

          # Restful separation for members
          resources :members, controller: "businesses/enterprise_team_members", only: %w(index)
          resources :external_group_members, controller: "businesses/enterprise_team_external_group_members", only: %w(index)
          resources :organization_mappings, controller: "businesses/enterprise_team_organization_mappings", only: %w(index) do
            collection do
              put :update
            end
          end
        end
      resources :organization_transfers,
        as: :enterprise_organization_transfers,
        controller: "businesses/organization_transfers",
        only: %w(index create update)
      resources :organization_invitations,
        as: :enterprise_organization_invitations,
        controller: "businesses/organization_invitations",
        only: %w(index)
      resources :reviewable_organization_invitations,
        as: :enterprise_reviewable_organization_invitations,
        controller: "businesses/reviewable_organization_invitations",
        param: :invitation_id,
        only: %w(update)
      resource :reviewable_organization_upgrade,
        as: :enterprise_reviewable_organization_upgrade,
        controller: "businesses/reviewable_organization_upgrades",
        only: %w(update)
      resource :trial,
        as: :enterprise_trials,
        controller: "businesses/trials",
        only: %w(update)
      resource :manual_payment_accounts,
        as: :enterprise_manual_payment_accounts,
        controller: "businesses/manual_payment_accounts",
        only: %w(index update)
      patch  "/advanced_security/subscriptions", to: "businesses/advanced_security/subscriptions#update"
      patch  "/advanced_security/trials", to: "businesses/advanced_security/trials#update"
      resources :people,
        as: :enterprise_people,
        controller: "businesses/people",
        only: %w(index)
      resources :members,
        as: :enterprise_members,
        controller: "businesses/members",
        only: %w(index)
      resources :pending_members,
        as: :enterprise_pending_members,
        controller: "businesses/pending_members",
        only: %w(index)
      resource :suspended_members,
        as: :enterprise_suspended_members,
        controller: "businesses/suspended_members",
        only: %w(show destroy)
      resources :unaffiliated_members,
        as: :enterprise_unaffiliated_members,
        controller: "businesses/unaffiliated_members",
        only: %w(index)
      resources :domains,
        as: :enterprise_domains,
        controller: "businesses/domains",
        only: %w(index)
      resources :guest_collaborators,
        as: :enterprise_guest_collaborators,
        controller: "businesses/guest_collaborators",
        only: %w(index)
      resources :repository_collaborators,
        as: :enterprise_repository_collaborators,
        controller: "businesses/outside_collaborators",
        only: %w(index)
      resources :outside_collaborators,
        as: :enterprise_outside_collaborators,
        controller: "businesses/outside_collaborators",
        only: %w(index)
      resources :pending_collaborators,
        as: :enterprise_pending_collaborators,
        controller: "businesses/pending_collaborators",
        only: %w(index)
      resources :support_entitlees,
        as: :enterprise_support_entitlees,
        controller: "businesses/support_entitlees",
        only: %w(index)
      resources :billing_managers,
        as: :enterprise_billing_managers,
        controller: "businesses/billing_managers",
        only: %w(index destroy)
      resources :pending_billing_managers,
        as: :enterprise_pending_billing_managers,
        controller: "businesses/pending_billing_managers",
        only: %w(index)
      resources :owners,
        as: :enterprise_owners,
        controller: "businesses/owners",
        param: :owner,
        only: %w(index create destroy)
      resources :pending_owners,
        as: :enterprise_pending_owners,
        controller: "businesses/pending_owners",
        param: :invitation_id,
        only: %w(index destroy)
      resources :user_namespace_repositories,
        as: :enterprise_user_namespace_repositories,
        controller: "businesses/user_namespace_repositories",
        only: %w(index)
      resources :expired_owner_invitations,
        as: :enterprise_expired_owner_invitations,
        controller: "businesses/expired_owner_invitations",
        only: %w(index)
      get    :policies, to: "businesses/policies#index"
      get    "policies/repositories", to: "businesses/policies#repositories", as: :repository_policies
      get    "policies/actions", to: "businesses/policies#actions", as: :actions_policies
      get    "policies/projects", to: "businesses/policies#projects", as: :project_policies
      get    "policies/teams", to: "businesses/policies#teams", as: :team_policies
      get    "policies/organizations", to: "businesses/policies#organizations", as: :organization_policies
      resources :hooks,
        as: :enterprise_hooks,
        controller: "businesses/hooks",
        only: %w(index show) do
        member do
          patch :active_status, to: "businesses/hooks/active_status#update"
        end
      end
      resources :organization_suggestions,
        as: :enterprise_organization_suggestions,
        controller: "businesses/organization_suggestions",
        only: %w(index)
      resource :security,
        as: :enterprise_security,
        controller: "businesses/security",
        only: %w(show)
      resources :ssh_certificate_authorities,
        as: :enterprise_ssh_certificate_authority,
        controller: "businesses/ssh_certificate_authorities",
        only: %w(destroy)
      resource :external_provider,
        as: :enterprise_external_provider,
        controller: "businesses/external_provider",
        only: %w(destroy)
      resource :ip_allowlist_enabled,
        as: :enterprise_ip_allowlist_enabled,
        controller: "businesses/ip_allowlist_enabled",
        only: %w(update)
      resource :ip_allowlist_user_level_enforcement_enabled,
        as: :enterprise_ip_allowlist_user_level_enforcement_enabled,
        controller: "businesses/ip_allowlist_user_level_enforcement_enabled",
        only: %w(update)
      resource :slug,
        as: :enterprise_slug,
        controller: "businesses/slug",
        only: %w(update)
      resources :enterprise_installations,
        as: :enterprise_enterprise_installations,
        controller: "businesses/enterprise_installations",
        only: %w(index)
      resource :complete,
        as: :enterprise_complete,
        controller: "businesses/complete",
        only: %w(show)
      resources :admin_suggestions,
        as: :enterprise_admin_suggestions,
        controller: "businesses/admin_suggestions",
        only: %w(index)
      get    "external_groups", to: "external_groups#index", as: :external_groups
      get    "external_groups/:id", to: "external_groups#show", as: :external_group_members
      post   :action_invocation, to: "businesses/action_invocation#unblock"
      post   :stop_billing_check, to: "businesses/billing#stop_billing_check"
      get    :dormant_users_exports, to: "businesses/dormant_users_export#index", as: :dormant_users_exports
      get    "dormant_users_exports/:token", to: "businesses/dormant_users_export#show", as: :dormant_users_export
      post   :dormant_users_exports, to: "businesses/dormant_users_export#create"
      delete "/dormant_users_exports/:id", to: "businesses/dormant_users_export#destroy", as: :dormant_users_export_destroy
      get  "people/export/:token", to: "businesses/enterprise_users_export#show", as: :enterprise_users_export
      post "people/export", to: "businesses/enterprise_users_export#create", format: "json"
      post :run_pending_changes, to: "businesses/billing#run_pending_changes"
      post :sync_customer, to: "businesses/billing#sync_customer"

      resources :enterprise_agreements, controller: "businesses/enterprise_agreements"
      resource :seat_limits, only: [:edit, :update], controller: "businesses/seat_limits"
      resource :enterprise_licensing, only: [:show, :update], controller: "businesses/enterprise_licensing" do
        collection do
          post "export", to: "businesses/enterprise_licensing#create_export"
          get "export"
          post "transition_licensing_model", to: "businesses/enterprise_licensing#transition_licensing_model"
          post "reconcile_licenses_with_billing_platform", to: "businesses/enterprise_licensing#reconcile_licenses_with_billing_platform"
          delete "transition_licensing_model/:transition_id", to: "businesses/enterprise_licensing#cancel_transition", as: :cancel_transition
        end
      end
      resources :metered_server_licenses, only: [:show, :create], controller: "businesses/metered_server_licenses", constraints: { id: /[\da-f]{6}(?:[\da-f]{14})?/ }
      resources :bundled_license_assignments, only: [:index], controller: "bundled_license_assignments", as: :enterprise_bundled_license_assignments do
        member do
          post :perform_user_link_job, to: "bundled_license_assignments#perform_user_link_job"
        end
      end

      resources :external_identities, only: [:show, :destroy],
        controller: "business_external_identities",
        as: :enterprise_external_identities do

        collection do
          get :linked_external_members, to: "business_external_identities/linked_external_members#show"
          get :unlinked_external_members, to: "business_external_identities/unlinked_external_members#show"
          get :unlinked_external_identities, to: "business_external_identities/unlinked_external_identities#index"
          get "unlinked_external_identities/:id", to: "business_external_identities/unlinked_external_identities#show", as: :unlinked_external_identity
          delete "unlinked_external_identities/:id", to: "business_external_identities/unlinked_external_identities#destroy", as: :destroy_unlinked_external_identity
          get :linked_saml_orgs
        end
      end

      resource :billing, only: [:show, :update], controller: "businesses/billing", as: :enterprise_billing do
        collection do
          get :emails
          get :subscription_status
        end

        resource :plan_subscription, only: [:edit, :show, :update], controller: "businesses/billing/plan_subscription"
        resource :bill_cycle_day, only: [:edit, :show, :update], controller: "businesses/billing/bill_cycle_day"
        resource :billing_type, only: [:update], controller: "businesses/billing/billing_type"
        resource :downgrade, only: [:update], controller: "businesses/billing/downgrade"
        resource :sync_subscription, only: [:show, :update], controller: "businesses/billing/sync_subscription"
        resource :sync_account_information, only: [:show, :update], controller: "businesses/billing/sync_account_information"
        resource :education_configuration, only: [:show, :edit, :update], controller: "businesses/billing/education_configuration"
        resource :lock, only: [:update], controller: "businesses/billing/lock"

        # billing vnext
        scope module: :businesses do
          scope module: :billing do
            resources :invoices, only: [:index, :create]
            resources :cost_centers, only: [:index, :show]
            resources :budgets, only: [:index, :edit, :update]
            resources :azure_emissions, only: [:index]
            resources :usage_report, only: [:create, :show]

            resource :usage_overview, only: :show, path: :overview

            resource :usage, only: :show do
              get "/repo", to: "repo_usage#show", as: :org
              get "/total", to: "usage_totals#show"
            end

            get "/net_usage", to: "net_usages#index"
            get "/usage_table", to: "usage_table#index"

            resource :migrations, only: :show do
              resource :actions_storage_backfill, only: [:create],  controller: "migrations/actions_storage_backfill"
            end
            resource :trigger_azure_emissions, only: [:show]
            get "/trigger_azure_emissions/trigger_emission", to: "trigger_azure_emissions#trigger_emission"
            resources :discounts, only: [:index, :create]
          end
        end
      end

      unless GitHub.enterprise?
        resource :advanced_security, only: [:show], controller: "businesses/advanced_security", as: :advanced_security do
          post :show
          get :download_active_committers
          get :download_maximum_committers
        end
      end

      resource :security_center, as: :enterprise_security_center, controller: "businesses/security_center", only: [:show]
      post "/security_center/trigger_reconciliation_job", to: "businesses/security_center#trigger_reconciliation_job", as: :security_center_reconciliation_job

      unless GitHub.enterprise?
        resource :hosted_compute_networking, controller: "businesses/hosted_compute_networking", as: :hosted_compute_networking do
          get :show
        end
      end

      resources :prepaid_metered_usage_refills, only: [:index, :destroy], controller: "businesses/prepaid_metered_usage_refills"
      resource :actions, only: [:show], controller: "businesses/actions" do
        post :onboard_larger_runners
        post :larger_runners_manage_beta_features
      end
      resource :actions_hosted_runners, only: [:show], controller: "businesses/actions_hosted_runners"
      resource :actions_packages, only: [:show], controller: "businesses/actions_packages" do
        post :trigger_packages_billing_reconciliation
      end
      resource :codespaces, only: [:show], controller: "businesses/codespaces"

      resource :copilot, only: [:show], controller: "businesses/copilot" do
        member do
          get "seat_assignments", as: :standalone_seat_assignments, to: "businesses/copilot_standalone_assignments#show"
          put "seat_assignment", as: :update_standalone_seat_assignment, to: "businesses/copilot_standalone_assignments#update"
          delete "seat_assignment", as: :destroy_standalone_seat_assignment, to: "businesses/copilot_standalone_assignments#destroy"
        end
      end

      resource :copilot_usage_metrics, only: [:show], controller: "businesses/copilot_usage_metrics"
      post :copilot_generate_csv, to: "businesses/copilot#generate_csv", as: :business_generate_copilot_csv
      post :copilot_update_plan, to: "businesses/copilot#update_plan", as: :business_update_copilot_plan
      put :copilot_toggle_email_notifications, to: "businesses/copilot#toggle_email_notifications", as: :business_toggle_copilot_email_notifications
      resource :copilot_usage, only: [:show], controller: "businesses/copilot_usage"
      resources :metered_exports, only: [:index, :show, :create], controller: "businesses/metered_exports"

      post "migrate_to_enterprise_teams", to: "businesses/copilot#migrate_to_enterprise_teams", as: :migrate_to_enterprise_teams_copilot

      resource :spam, only: [:create, :destroy], controller: "businesses/spam", as: :enterprise_spam do
        post :allowlist
      end
      resource :suspension, only: [:create, :destroy], controller: "businesses/suspension", as: :enterprise_suspension
      resource :two_factor_requirement,
        only: :destroy,
        controller: "businesses/two_factor_requirement",
        as: :enterprise_two_factor_requirement
      resource :soft_deletion,
        only: :create,
        controller: "businesses/soft_deletion",
        as: :enterprise_soft_deletion
      resource :restores,
        only: :create,
        controller: "businesses/restores",
        as: :enterprise_restores
      resource :git_lfs_usage,
        only: :show,
        controller: "businesses/git_lfs_usage",
        as: :enterprise_git_lfs_usage
      resources :notes,
        only: %i(create update destroy),
        controller: "/stafftools/staff_notes",
        as: :enterprise_notes
      resource :seats_plan_type,
        only: :update,
        controller: "businesses/seats_plan_type",
        as: :enterprise_seats_plan_type
    end

    collection do
      post :check_slug
      post :shortcode_check, to: "businesses/shortcode_check#create"
      get :organization_invitations, to: "businesses/reviewable_organization_invitations#index"
      get :organization_upgrades, to: "businesses/reviewable_organization_upgrades#index"
      get :self_serve_organization_upgrades, to: "businesses/self_serve_organization_upgrades#index"
      get :trials, to: "businesses/trials#index"
      get :manual_payment_accounts, to: "businesses/manual_payment_accounts#index"
    end
  end

  unless GitHub.enterprise?
    resources :customers, only: [] do
      scope module: :customers do
        resources :licensify_licenses, only: [:index] do
          collection do
            get ":type/:id", to: "licensify_licenses#show", as: :show, constraints: { type: /(user|bua)/ }
            post "sync_licenses", to: "licensify_licenses#sync_licenses"
          end
        end
      end
    end
  end

  get "/organizations/:user/hooks",     to: "hooks#index", as: :org_hooks
  get "/organizations/:user/hooks/:id", to: "hooks#show",  as: :org_hook
  patch "/organizations/:user/hooks/:id/toggle_active_status", to: "hooks#toggle_active_status", as: :org_hook_toggle_active_status
  get "/:user_id/:repository/hooks",       to: "hooks#index", repository: REPO_REGEX, as: :repo_hooks
  get "/:user_id/:repository/hooks/:id",   to: "hooks#show",  repository: REPO_REGEX, as: :repo_hook
  patch "/:user_id/:repository/hooks/:id/toggle_active_status", to: "hooks#toggle_active_status", repository: REPO_REGEX, as: :repo_hook_toggle_active_status

  delete "/commit_comments/:user/:comment_id", to: "commit_comments#destroy", as: :user_commit_comment
  resources :commit_comments, only: [:show]
  delete "/gist_comments/:user/:comment_id", to: "gist_comments#destroy", as: :user_gist_comment

  resources :certificate_notice_dismissals, only: [:create]
  resources :license_notice_dismissals, only: [:create]

  resources :vulnerabilities, only: [:index] do
    post :enqueue_dotcom_sync, on: :collection
  end

  resources :integration_installation_triggers, path: "automatic-apps"

  resources :product_enablements, only: [:index, :create]

  get "/proxima_service_rate_limits", to: "proxima_service_rate_limits#index", as: :proxima_service_rate_limits
  post "/proxima_service_rate_limits", to: "proxima_service_rate_limits#create", as: :proxima_service_rate_limits_create
  put "/proxima_service_rate_limits/:id", to: "proxima_service_rate_limits#update", as: :proxima_service_rate_limits_update
  delete "/proxima_service_rate_limits/:id", to: "proxima_service_rate_limits#destroy", as: :proxima_service_rate_limits_destroy

  get "/research_participants", to: "research_participants#index", as: :research_participants
  post "/research_participants", to: "research_participants#create", as: :research_participants_create

  get "/models", to: "models#index", as: :models
  put "/models", to: "models#update", as: :models_update

  post "/research_participants/export", to: "research_participants#export", as: :research_participants_export
end

# legacy admin URL redirects
scope controller: "stafftools/admin_redirects", format: false do
  get "/admin/repos",        action: "repositories", as: nil
  get "/admin/repositories", action: "repositories", as: nil
  get "/admin/users",        action: "users",        as: nil
  get "/admin/coupons",      action: "coupons",      as: nil
end
