# frozen_string_literal: true

resources :enterprises, controller: "businesses", param: :slug, only: [:show] do
  member do
    scope :settings do
      get "actions",                                        to: "businesses/actions_settings#show",                                 as: :settings_actions
      put "actions/enable_org",                             to: "businesses/actions/policies#enable_org",                           as: :settings_actions_org_enablement
      get "actions/policies/bulk_orgs",                     to: "businesses/actions/policies#bulk",                                 as: :settings_actions_bulk_orgs
      put "actions/policies/bulk_orgs",                     to: "businesses/actions/policies#bulk_update",                          as: :update_settings_actions_bulk_orgs
      put "actions/policies/actions_access",                to: "businesses/actions/policies#update_actions_access",                as: :settings_actions_update_access_policy
      put "actions/policies/allowed_actions",               to: "businesses/actions/policies#update_allowed_actions",               as: :settings_actions_update_allowed_actions
      put "actions/policies/fork_pr_workflows_policy",      to: "businesses/actions/policies#update_fork_pr_workflows_policy",      as: :settings_actions_fork_pr_workflows_policy
      put "actions/policies/public_fork_pr_workflows_policy", to: "businesses/actions/policies#update_public_fork_pr_workflows_policy",  as: :settings_actions_public_fork_pr_workflows_policy
      put "actions/policies/default_workflow_permissions",  to: "businesses/actions/policies#update_default_workflow_permissions",  as: :settings_actions_update_default_workflow_permissions
      put "actions/policies/repo_self_hosted_runners",  to: "businesses/actions/policies#update_repo_self_hosted_runners",  as: :settings_actions_update_repo_self_hosted_runners
      put "actions/retention",                              to: "businesses/actions_settings#update_retention",                     as: :settings_actions_update_retention
      put "actions/policies/fork_pr_approvals_policy",      to: "businesses/actions/policies#update_fork_pr_approvals_policy",      as: :settings_actions_fork_pr_approvals_policy
      put "actions/cache_size_limit",                       to: "businesses/actions_settings#update_cache_size_limit",              as: :settings_actions_cache_size_limit
      put "actions/cache_size_upper_limit",                 to: "businesses/actions_settings#update_cache_size_upper_limit",        as: :settings_actions_cache_size_upper_limit


      get    "actions/runners",                         to: "businesses/actions/runners#index",               as: :settings_actions_runners
      get    "actions/runners/new",                     to: "businesses/actions/runners#new",                 as: :settings_actions_add_runner
      get    "actions/runners/:id",                     to: "businesses/actions/runners#runner_details",      as: :settings_actions_runner_details
      put    "actions/runners/:id",                     to: "businesses/actions/runners#update",              as: :settings_actions_update_runner
      get    "actions/runners/delete-runner-modal/:id", to: "businesses/actions/runners#delete_runner_modal", as: :settings_actions_delete_runner_modal
      delete "actions/runners/:id",                     to: "businesses/actions/runners#destroy",             as: :settings_actions_delete_runner

      get    "actions/hosted-runners",                to: "businesses/actions/runners#hosted_runners",          as: :settings_actions_hosted_runners

      get    "actions/runner-scale-sets/:id", to: "businesses/actions/runner_scale_sets#show", as: :settings_actions_runner_scale_set

      get    "actions/labels",                to: "businesses/actions/runner_labels#index",                 as: :settings_actions_runner_labels
      post   "actions/label",                 to: "businesses/actions/runner_labels#create",                as: :settings_actions_create_runner_label
      put    "actions/labels",                to: "businesses/actions/runner_labels#update",                as: :settings_actions_update_runner_labels

      get    "actions/runner-groups",         to: "businesses/actions/runner_groups#index",                 as: :settings_actions_runner_groups
      post   "actions/runner-groups",         to: "businesses/actions/runner_groups#create",                as: :settings_actions_create_runner_group
      get    "actions/runner-groups/new",     to: "businesses/actions/runner_groups#new",                   as: :settings_actions_add_runner_group
      get    "actions/runner-groups/targets", to: "businesses/actions/runner_groups#show_selected_targets", as: :settings_actions_runner_group_targets
      put    "actions/runner-groups/runners", to: "businesses/actions/runner_groups#update_runners",        as: :settings_actions_update_runner_group_runners
      get    "actions/runner-groups/menu",    to: "businesses/actions/runner_groups#show_menu",             as: :settings_actions_runner_groups_menu
      put    "actions/runner-groups/:id",     to: "businesses/actions/runner_groups#update",                as: :settings_actions_update_runner_group
      get    "actions/runner-groups/:id",     to: "businesses/actions/runner_groups#edit",                  as: :settings_actions_runner_group
      delete "actions/runner-groups/:id",     to: "businesses/actions/runner_groups#destroy",               as: :settings_actions_delete_runner_group

      post   "actions/github-hosted-runners/label",           to: "businesses/actions/larger_runners_labels#create",                     as: :settings_actions_create_label_larger_runner
      get    "actions/github-hosted-runners/new",             to: "businesses/actions/larger_runners#new",                               as: :settings_actions_add_larger_runner
      post   "actions/github-hosted-runners",                 to: "businesses/actions/larger_runners#create",                            as: :settings_actions_create_larger_runner
      get    "actions/github-hosted-runners/:id",             to: "businesses/actions/larger_runners#runner_details",                    as: :settings_actions_larger_runner_details
      get    "actions/github-hosted-runners/:id/edit",        to: "businesses/actions/larger_runners#edit",                              as: :settings_actions_edit_larger_runner
      get    "actions/delete-github-hosted-runner-modal/:id", to: "businesses/actions/larger_runners#delete_larger_runner_modal",        as: :settings_actions_delete_larger_runner_modal
      patch  "actions/github-hosted-runners/:id",             to: "businesses/actions/larger_runners#update",                            as: :settings_actions_update_larger_runner
      delete "actions/github-hosted-runners/:id",             to: "businesses/actions/larger_runners#destroy",                           as: :settings_actions_delete_larger_runner
      post   "actions/github-hosted-runners/check-name",      to: "businesses/actions/larger_runners#check_name",                        as: :settings_actions_check_name_larger_runner
      post   "actions/github-hosted-runners/setup-default-runners", to: "businesses/actions/larger_runners#setup_default_runners",       as: :settings_actions_setup_default_runners

      get "actions/custom-images", to: "businesses/actions/custom_images#index", as: :settings_actions_custom_images
      delete "actions/custom-images/:id", to: "businesses/actions/custom_images#destroy", as: :settings_actions_delete_custom_image
      get "actions/custom-images/:image_id/versions", to: "businesses/actions/custom_image_versions#index", as: :settings_actions_custom_image_versions
      delete "actions/custom-images/:image_id/versions/:version", to: "businesses/actions/custom_image_versions#destroy", as: :settings_actions_delete_custom_image_version,  constraints: { version: /[^\/]+/ } # allow dots in version
    end
  end
end

# Organization Actions Cache Settings Page
get    "/organizations/:organization_id/settings/actions/caches",                             to: "orgs/actions_settings/caches#index",                             as: :settings_org_actions_caches
put    "/organizations/:organization_id/settings/actions/caches",                             to: "orgs/actions_settings/caches#update_cache_size",                 as: :settings_org_actions_cache_size

# Organization Actions Runner Settings Page
get    "/organizations/:organization_id/settings/actions/list_runners",                               to: "orgs/actions_settings/runners#list_runners",                     as: :settings_org_actions_list_runners
get    "/organizations/:organization_id/settings/actions/add-new-runner-instructions",                to: "orgs/actions_settings/runners#add_runner_instructions",          as: :settings_org_actions_add_runner_instructions
get    "/organizations/:organization_id/settings/actions/delete_runner_modal/:id",                    to: "orgs/actions_settings/runners#delete_runner_modal",              as: :settings_org_actions_delete_runner_modal
get    "/organizations/:organization_id/settings/actions/repository_items",                           to: "orgs/actions_settings/repository_items#index",                   as: :settings_org_actions_repository_items
get    "/organizations/:organization_id/settings/actions/runners",                                    to: "orgs/actions_settings/runners#runners",                          as: :settings_org_actions_runners
get    "/organizations/:organization_id/settings/actions/runners/new",                                to: "orgs/actions_settings/runners#add_new_runner",                   as: :settings_org_actions_add_new_runner
get    "/organizations/:organization_id/settings/actions/runners/:id",                                to: "orgs/actions_settings/runners#runner_details",                   as: :settings_org_actions_runner_details
put    "/organizations/:organization_id/settings/actions/runners/:id",                                to: "orgs/actions_settings/runners#update_runner",                    as: :settings_org_actions_update_runner
delete "/organizations/:organization_id/settings/actions/runners/:id",                                to: "orgs/actions_settings/runners#delete_runner",                    as: :settings_org_actions_delete_runner
get    "/organizations/:organization_id/settings/actions/labels",                                     to: "orgs/actions_settings/runner_labels#index",                      as: :settings_org_actions_labels
post   "/organizations/:organization_id/settings/actions/label",                                      to: "orgs/actions_settings/runner_labels#create",                     as: :create_org_runner_label
put    "/organizations/:organization_id/settings/actions/labels",                                     to: "orgs/actions_settings/runner_labels#update",                     as: :update_org_runner_labels
get    "/organizations/:organization_id/settings/actions/hosted-runners",                             to: "orgs/actions_settings/runners#hosted_runners",                   as: :settings_org_actions_hosted_runners

# Organization Actions Custom Images Pages
get    "/organizations/:organization_id/settings/actions/custom-images",                              to: "orgs/actions_settings/custom_images#index",                      as: :settings_org_actions_custom_images
delete "/organizations/:organization_id/settings/actions/custom-images/:id",                          to: "orgs/actions_settings/custom_images#destroy",                    as: :settings_org_actions_delete_custom_image
get    "/organizations/:organization_id/settings/actions/custom-images/:image_id/versions",           to: "orgs/actions_settings/custom_image_versions#index",              as: :settings_org_actions_custom_image_versions
delete "/organizations/:organization_id/settings/actions/custom-images/:image_id/versions/:version",  to: "orgs/actions_settings/custom_image_versions#destroy",            as: :settings_org_actions_delete_custom_image_version,  constraints: { version: /[^\/]+/ } # allow dots in version

# Organization Actions General Settings Page
get    "/organizations/:organization_id/settings/actions",                                                to: "orgs/actions_settings/policies#index",                                             as: :settings_org_actions
get    "/organizations/:organization_id/settings/actions/repo_policies",                                  to: "orgs/actions_settings/policies#repo_dialog",                                       as: :org_actions_repo_dialog
put    "/organizations/:organization_id/settings/actions/repo_policies",                                  to: "orgs/actions_settings/policies#update_repos",                                      as: :org_actions_repo_policies
put    "/organizations/:organization_id/settings/actions/policies/actions_access",                        to: "orgs/actions_settings/policies#update_actions_access",                             as: :settings_org_actions_update_access_policy
put    "/organizations/:organization_id/settings/actions/policies/allowed_actions",                       to: "orgs/actions_settings/policies#update_allowed_actions",                            as: :settings_org_actions_update_allowed_actions
put    "/organizations/:organization_id/settings/actions/policies/repo_self_hosted_runners",              to: "orgs/actions_settings/policies#update_repo_self_hosted_runners",                   as: :settings_org_actions_update_repo_self_hosted_runners
get    "/organizations/:organization_id/settings/actions/policies/repo_self_hosted_runners_repos",        to: "orgs/actions_settings/policies#repo_self_hosted_runners_repos_dialog",             as: :settings_org_actions_repo_self_hosted_runners_repos
put    "/organizations/:organization_id/settings/actions/policies/repo_self_hosted_runners_repos",        to: "orgs/actions_settings/policies#update_repo_self_hosted_runners_repos",             as: :settings_org_actions_update_repo_self_hosted_runners_repos
put    "/organizations/:organization_id/settings/actions/policies/retention",                             to: "orgs/actions_settings/policies#update_retention",                                  as: :settings_org_actions_update_retention
put    "/organizations/:organization_id/settings/actions/policies/fork_pr_workflows_policy",              to: "orgs/actions_settings/policies#update_fork_pr_workflows_policy",                   as: :settings_org_actions_update_fork_pr_workflows_policy
put    "/organizations/:organization_id/settings/actions/policies/public_fork_pr_workflows_policy",       to: "orgs/actions_settings/policies#update_public_fork_pr_workflows_policy",            as: :settings_org_actions_update_public_fork_pr_workflows_policy
put    "/organizations/:organization_id/settings/actions/policies/fork_pr_approvals_policy",              to: "orgs/actions_settings/policies#update_fork_pr_approvals_policy",                   as: :settings_org_actions_update_fork_pr_approvals_policy
put    "/organizations/:organization_id/settings/actions/policies/update_default_workflow_permissions",   to: "orgs/actions_settings/policies#update_default_workflow_permissions",               as: :settings_org_actions_update_default_workflow_permissions

get    "/organizations/:organization_id/settings/actions/runner-groups",                      to: "orgs/actions_settings/runner_groups#index",                 as: :settings_org_actions_runner_groups
get    "/organizations/:organization_id/settings/actions/runner-groups/new",                  to: "orgs/actions_settings/runner_groups#new",                   as: :settings_org_actions_add_runner_group
post   "/organizations/:organization_id/settings/actions/runner-groups",                      to: "orgs/actions_settings/runner_groups#create",                as: :settings_org_actions_create_runner_group
get    "/organizations/:organization_id/settings/actions/runner-groups/targets",              to: "orgs/actions_settings/runner_groups#show_selected_targets", as: :settings_org_actions_runner_group_targets
put    "/organizations/:organization_id/settings/actions/runner-groups/runners",              to: "orgs/actions_settings/runner_groups#update_runners",        as: :settings_org_actions_update_runner_group_runners
get    "/organizations/:organization_id/settings/actions/runner-groups/menu",                 to: "orgs/actions_settings/runner_groups#show_menu",             as: :settings_org_actions_runner_groups_menu
put    "/organizations/:organization_id/settings/actions/runner-groups/:id",                  to: "orgs/actions_settings/runner_groups#update",                as: :settings_org_actions_update_runner_group
delete "/organizations/:organization_id/settings/actions/runner-groups/:id",                  to: "orgs/actions_settings/runner_groups#destroy",               as: :settings_org_actions_delete_runner_group
get    "/organizations/:organization_id/settings/actions/runner-groups/:id",                  to: "orgs/actions_settings/runner_groups#edit",                  as: :settings_org_actions_runner_group

post   "/organizations/:organization_id/settings/actions/github-hosted-runners/label",              to: "orgs/actions_settings/larger_runners_labels#create",                      as: :settings_org_actions_create_label_larger_runner
get    "/organizations/:organization_id/settings/actions/github-hosted-runners/new",                to: "orgs/actions_settings/larger_runners#new",                                as: :settings_org_actions_add_new_larger_runner
post   "/organizations/:organization_id/settings/actions/github-hosted-runners",                    to: "orgs/actions_settings/larger_runners#create",                             as: :settings_org_actions_create_larger_runner
get    "/organizations/:organization_id/settings/actions/github-hosted-runners/:id",                to: "orgs/actions_settings/larger_runners#runner_details",                     as: :settings_org_actions_larger_runner_details
get    "/organizations/:organization_id/settings/actions/github-hosted-runners/:id/edit",           to: "orgs/actions_settings/larger_runners#edit",                               as: :settings_org_actions_edit_larger_runner
patch  "/organizations/:organization_id/settings/actions/github-hosted-runners/:id",                to: "orgs/actions_settings/larger_runners#update",                             as: :settings_org_actions_update_larger_runner
delete "/organizations/:organization_id/settings/actions/github-hosted-runners/:id",                to: "orgs/actions_settings/larger_runners#destroy",                            as: :settings_org_actions_delete_larger_runner
get    "/organizations/:organization_id/settings/actions/delete-github-hosted-runner-modal/:id",    to: "orgs/actions_settings/larger_runners#delete_larger_runner_modal",         as: :settings_org_actions_delete_larger_runner_modal
post   "/organizations/:organization_id/settings/actions/github-hosted-runners/check-name",         to: "orgs/actions_settings/larger_runners#check_name",                         as: :settings_org_actions_check_name_larger_runner
post   "/organizations/:organization_id/settings/actions/github-hosted-runners/setup-default-runners", to: "orgs/actions_settings/larger_runners#setup_default_runners",           as: :settings_org_actions_setup_default_runners

# TODO: this needs to happen for businesses as well
get    "/organizations/:organization_id/settings/actions/runner-scale-sets/:id",                to: "orgs/actions_settings/runner_scale_sets#show",                     as: :settings_org_actions_runner_scale_set

scope "/:user_id/:repository", constraints: { repository: REPO_REGEX, user_id: USERID_REGEX } do
  if GitHub.actions_enabled? || Rails.env.test?
    get "actions/workflows_partial",                        to: "actions/workflows_partials#show",                   as: :workflows_partial
    get "actions/workflows_partial/unpin_workflow_dialogs", to: "actions/workflows_partials#unpin_workflow_dialogs", as: :unpin_workflow_dialogs

    get "actions/workflow-run/:workflow_run_id",     to: "actions#workflow_run_item",                  as: :workflow_run_item_partial
    get "actions/check-run/:check_run_id",           to: "actions#check_run_item",                     as: :check_run_item_partial
    get "actions/workflow-runs",                     to: "actions#workflow_runs",                      as: :workflow_runs_partial
    get "actions/navigation_partial",                to: "actions/navigation_partial#show",            as: :actions_navigation_partial
    get "actions/new/navigation_partial",            to: "actions/navigation_partial#new",             as: :actions_new_navigation_partial

    post "actions/enable",          to: "actions#enable",           as: :actions_enable
    get "actions/actors",           to: "actions/actors#index",     as: :actions_actors_menu
    get "actions/branches",         to: "actions/branches#index",   as: :actions_branches_menu
    get "actions/branches/select",  to: "actions/branches#select",  as: :actions_branches_select
    get "actions/events",           to: "actions/events#index",     as: :actions_events_menu
    get "actions/statuses",         to: "actions/statuses#index",   as: :actions_statuses_menu
    get "actions/workflows",        to: "actions/workflows#index",  as: :actions_workflows_menu

    post "actions/pinned_workflows",   to: "actions/pinned_workflows#create",  as: :pin_workflow
    delete "actions/pinned_workflows/:workflow_id", to: "actions/pinned_workflows#destroy", as: :unpin_workflow

    unless GitHub.enterprise?
      post "actions/survey/open",     to: "actions/survey#open",    as: :actions_survey_open
      post "actions/survey/dismiss",  to: "actions/survey#dismiss", as: :actions_survey_dismiss
    end

    actions_onboarding_filter_constraint = -> (request) do
      request.query_parameters["query"].present? ||
        request.query_parameters["category"].present?
    end

    constraints actions_onboarding_filter_constraint do
      get "actions/new", to: "actions#new_with_filter", as: :actions_onboarding_filter
    end

    get "actions/new(/:language_category)", to: "actions#new", as: :actions_onboarding

    put "actions/runs/:workflow_run_id/rerequest_check_suite", to: "actions/workflow_runs#rerequest_check_suite", as: :workflow_run_rerequest_check_suite

    get "actions/runs/:workflow_run_id",                                to: "actions/workflow_runs#show",                         as: :workflow_run
    get "actions/runs/:workflow_run_id/attempts/:attempt",              to: "actions/workflow_runs#show",                         as: :workflow_run_attempt
    get "actions/runs/:workflow_run_id/attempts",                       to: "actions/workflow_runs#attempts",                     as: :workflow_run_attempts_menu
    get "actions/runs/:workflow_run_id/new_attempts",                   to: "actions/workflow_runs#new_attempts_menu",            as: :workflow_run_new_attempts_menu
    get "actions/runs/:workflow_run_id/usage",                          to: "actions/workflow_runs#usage",                        as: :workflow_run_usage
    get "actions/runs/:workflow_run_id/summary_partial",                to: "actions/workflow_runs#workflow_run_summary_partial", as: :workflow_run_summary_partial
    get "actions/runs/:workflow_run_id/annotations_partial",            to: "actions/workflow_runs#annotations_partial",          as: :workflow_run_annotations_partial
    get "actions/runs/:workflow_run_id/sidebar_partial",                to: "actions/workflow_runs#sidebar_partial",              as: :workflow_run_sidebar_partial
    get "actions/runs/:workflow_run_id/navigation_partial",             to: "actions/workflow_runs#navigation_partial",           as: :workflow_run_navigation_partial
    get "actions/runs/:workflow_run_id/header_partial",                 to: "actions/workflow_runs#header_partial",               as: :workflow_run_header_partial
    get "actions/runs/:workflow_run_id/approvals_partial",              to: "actions/workflow_runs#approvals_partial",            as: :workflow_run_approvals_partial
    get "actions/runs/:workflow_run_id/graph_partial",                  to: "actions/workflow_runs#graph_partial",                as: :workflow_run_graph_partial
    get "actions/runs/:workflow_run_id/approvals_banner_partial",       to: "actions/workflow_runs#approvals_banner_partial",     as: :workflow_run_approvals_banner_partial
    get "actions/runs/:workflow_run_id/artifacts_partial",              to: "actions/workflow_runs#artifacts_partial",            as: :workflow_run_artifacts_partial
    get "actions/runs/:workflow_run_id/workflow",                       to: "actions/workflow_runs#workflow_file",                as: :workflow_run_file
    get "actions/runs/:workflow_run_id/action_required_partial",        to: "actions/workflow_runs#action_required_partial",      as: :workflow_run_action_required_partial
    get "actions/runs/:workflow_run_id/job_rerun_dialogs_partial",      to: "actions/workflow_runs#job_rerun_dialogs_partial",    as: :job_rerun_dialogs
    get "actions/runs/:workflow_run_id/concurrency_banner_partial",     to: "actions/workflow_runs#concurrency_banner_partial",   as: :workflow_run_concurrency_banner_partial
    get "actions/runs/:workflow_run_id/delete_pull_requests_list",      to: "actions/workflow_runs#delete_pull_requests_list",    as: :workflow_run_delete_pull_requests_list
    get "actions/runs/:workflow_run_id/artifacts/:artifact_id",         to: "actions/workflow_runs#download_artifact",            as: :workflow_run_download_artifact


    delete "actions/runs/:workflow_run_id",       to: "actions/workflow_runs#delete_workflow_run",  as: :delete_workflow_run
    delete "actions/runs/:workflow_run_id/logs",  to: "actions/workflow_runs#delete_logs",          as: :delete_workflow_run_logs

    # Workflow job
    # 2 routes because the first uses the check_run_id while the other uses the workflow_job_run_id https://github.com/github/c2c-actions/blob/main/docs/adrs/7143-workflow-job-web-url.md
    get "actions/runs/:workflow_run_id/job/:job_id",                                      to: "actions/job#index",                                  as: :actions_job
    get "actions/runs/:workflow_run_id/jobs/:job_id",                                     to: "actions/job#show",                                   as: :workflow_run_job

    get "actions/runs/:workflow_run_id/jobs/:job_id/steps",                               to: "actions/workflow_runs#job_steps",                    as: :workflow_run_job_steps
    get "actions/runs/:workflow_run_id/jobs/:job_id/steps/:step_external_id/backscroll",  to: "actions/workflow_runs#job_step_backscroll",          as: :workflow_run_job_step_backscroll
    get "actions/runs/:workflow_run_id/jobs/:job_id/summary_content",                     to: "actions/workflow_runs#job_summary_content",          as: :workflow_run_job_summary_content
    get "actions/runs/:workflow_run_id/jobs/:job_id/summary_raw",                         to: "actions/workflow_runs#job_summary_raw",              as: :workflow_run_job_summary_raw
    get "actions/runs/:workflow_run_id/job_summary_partial",                              to: "actions/workflow_runs#job_summary_partial",          as: :workflow_run_job_summary_partial
    get "actions/runs/:workflow_run_id/jobs/:job_id/downstream_list",                     to: "actions/workflow_runs#job_downstream_list",          as: :workflow_run_job_downstream_list
    get "actions/runs/:workflow_run_id/failed_jobs",                                      to: "actions/workflow_runs#failed_jobs",                  as: :workflow_run_failed_jobs
    get "actions/runs/:workflow_run_id/jobs_list",                                        to: "actions/workflow_runs#jobs_list",                    as: :workflow_run_jobs_list

    # Workflow badge
    get "actions/workflows/*workflow_filename/badge.svg", to: "workflows/badges#show_by_file",      as: :workflow_badge_by_file, workflow_filename: /[\w\-\/\[\]]+|.+\.(ya?ml)/, defaults: { format: :svg }
    get "actions/workflows/*workflow_filename/badge",     to: "workflows/badges#configure_by_file", as: :workflow_badge_by_file_configure, workflow_filename: /[\w\-\/\[\]]+|.+\.(ya?ml)/
    get "workflows/*workflow_name/badge.svg",             to: "workflows/badges#show",              as: :workflow_badge, defaults: { format: :svg }

    get "actions/workflows/*workflow_file_name",    to: "actions#index",                          as: :workflow_runs_list, workflow_file_name: /.+/, format: false, defaults: { format: :html }
    post "actions/workflows/:workflow_id/disable",  to: "actions/workflow_runs#disable_workflow", as: :disable_workflow
    post "actions/workflows/:workflow_id/enable",   to: "actions/workflow_runs#enable_workflow",  as: :enable_workflow

    get "actions/manual",  to: "actions/manual#manual_run_partial", as: :actions_manual_run_partial
    post "actions/manual", to: "actions/manual#trigger",            as: :actions_manual_run_trigger

    get "actions/runs/:workflow_run_id/graph/job/*job_id",            to: "actions/graph#job",    as: :actions_graph_job, job_id: /.+/
    get "actions/runs/:workflow_run_id/graph/matrix/:matrix_id_hash", to: "actions/graph#matrix", as: :actions_graph_matrix

    # Actions cache
    get "actions/caches",                         to: "actions_cache#index", as: :actions_caches

    delete "actions/caches/:cache_id",            to: "actions_cache#destroy",  as: :destroy_actions_cache

    get "actions/caches/branches",                to: "actions/cache_branches#index",   as: :actions_cache_branches_menu

    # Actions Runners
    get "actions/runners",                        to: "actions/repository_runners#index", as: :actions_runners
    get "actions/runners/github_hosted_runners",  to: "actions/repository_runners#github_hosted_runners"
    get "actions/runners/shared_runners",         to: "actions/repository_runners#shared_runners"
    get "actions/runners/repository_scale_sets",  to: "actions/repository_runners#repository_scale_sets"
    get "actions/runners/repository_self_hosted", to: "actions/repository_runners#repository_self_hosted"

    post "actions/immutable_actions/migrate",    to: "actions/immutable_actions#migrate", as: :migrate_to_immutable_actions
  end


  # RepositoryActionsSettingsController
  get    "settings/actions",                              to: "repository_actions_settings#index",                                as: :repository_actions_settings
  get    "settings/actions/list_runners",                 to: "repository_actions_settings#list_runners",                         as: :repository_actions_settings_list_runners
  get    "settings/actions/check_readiness",              to: "repository_actions_settings#check_readiness",                      as: :repository_actions_settings_check_readiness
  get    "settings/actions/delete_runner_modal/:id",      to: "repository_actions_settings#delete_runner_modal",                  as: :repository_actions_settings_delete_runner_modal
  get    "settings/actions/runners",                      to: "repository_actions_settings#runners",                              as: :repository_actions_settings_runners
  get    "settings/actions/runners/new",                  to: "repository_actions_settings#add_new_runner",                       as: :repository_actions_settings_add_new_runner
  get    "settings/actions/runners/:id",                  to: "repository_actions_settings#runner_details",                       as: :repository_actions_settings_runner_details
  delete "settings/actions/runners/:id",                  to: "repository_actions_settings#delete_runner",                        as: :repository_actions_settings_delete_runner
  get    "settings/actions/runner-scale-sets/:id",        to: "repos/actions_settings/runner_scale_sets#show",                    as: :settings_repo_actions_runner_scale_set
  put    "settings/actions/fork_pr_workflows_policy",     to: "repository_actions_settings#update_fork_pr_workflows_policy",      as: :update_repository_fork_pr_workflows_policy
  put    "settings/actions/public_fork_pr_workflows_policy", to: "repository_actions_settings#update_public_fork_pr_workflows_policy",      as: :update_repository_public_fork_pr_workflows_policy
  put    "settings/actions/default_workflow_permissions", to: "repository_actions_settings#update_default_workflow_permissions",  as: :update_repository_default_workflow_permissions
  put    "settings/actions/retention",                    to: "repository_actions_settings#update_retention",                     as: :repo_actions_update_retention
  put    "settings/actions/cache_size",                   to: "repository_actions_settings#update_cache_size",                    as: :repo_actions_cache_size
  put    "settings/actions/fork_pr_approvals_policy",     to: "repository_actions_settings#update_fork_pr_approvals_policy",      as: :update_repository_fork_pr_approvals_policy
  put    "settings/actions/repository_share_policy",      to: "repository_actions_settings#update_repository_share_policy",       as: :update_actions_repository_share_policy

  # Repos::ActionsSettings::RunnerLabelsController
  get    "settings/actions/labels",      to: "repos/actions_settings/runner_labels#index",       as: :repo_runner_labels
  post   "settings/actions/labels",      to: "repos/actions_settings/runner_labels#create",      as: :create_repo_runner_label
  put    "settings/actions/labels",      to: "repos/actions_settings/runner_labels#update",      as: :update_repo_runner_label

  # Repos::ActionsSettings::PoliciesController
  put    "settings/actions/policies/allowed_actions",  to: "repos/actions_settings/policies#update_allowed_actions",  as: :repository_actions_settings_update_allowed_actions

  # RepositoryEnvironmentSettingsController
  scope path: "settings" do
    get    "environments/suggested_approvers",                   to: "repository_environments#suggested_approvers",    as: :repository_environment_suggested_approvers
    post   "environments/:environment_id/secrets/new",           to: "repository_environments#add_secret",             as: :repository_environment_add_secret
    delete "environments/:environment_id/secrets/:secret_name",  to: "repository_environments#remove_secret",          as: :repository_environment_remove_secret
    put    "environments/:environment_id/secrets/:secret_name",  to: "repository_environments#update_secret",          as: :repository_environment_update_secret

    resources :repository_environments, path: :environments, param: :environment_id
  end

  # Environments::BranchPoliciesController
  scope path: "settings" do
    post   "environments/:environment_id/branch-policies",      to: "environments/branch_policies#create",  as: :create_environment_branch_policy
    put    "environments/:environment_id/branch-policies/:id",  to: "environments/branch_policies#update",  as: :update_environment_branch_policy
    delete "environments/:environment_id/branch-policies/:id",  to: "environments/branch_policies#destroy", as: :destroy_environment_branch_policy
    post   "environments/:environment_id/branch-policies/type", to: "environments/branch_policies#type",    as: :change_environment_branch_policy_type
  end

end
