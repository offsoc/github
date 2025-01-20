# typed: strict
# frozen_string_literal: true

T.bind(self, ActionDispatch::Routing::Mapper)

##
# OrganizationVariablesController
constraints app_name: /actions/ do
  get    "/organizations/:organization_id/settings/variables/:app_name",                          to: "orgs/organization_variables#index",                      as: :organization_variables
  get    "/organizations/:organization_id/settings/variables/:app_name/list/:page",               to: "orgs/organization_variables#list_partial",               as: :organization_variables_list_partial, constraints: { page: /\d+/ }
  get    "/organizations/:organization_id/settings/variables/:app_name/new",                      to: "orgs/organization_variables#new",                        as: :organization_new_variable
  post   "/organizations/:organization_id/settings/variables/:app_name/new",                      to: "orgs/organization_variables#create",                     as: :organization_create_variable
  get    "/organizations/:organization_id/settings/variables/:app_name/repository_items",         to: "orgs/variables_repository_items#index",                  as: :organization_variables_repository_items
  delete "/organizations/:organization_id/settings/variables/:app_name/:name",                    to: "orgs/organization_variables#destroy",                    as: :organization_delete_variable
  get    "/organizations/:organization_id/settings/variables/:app_name/:name/delete",             to: "orgs/organization_variables#destroy_variable_partial",   as: :organization_delete_variable_partial
  get    "/organizations/:organization_id/settings/variables/:app_name/:name",                    to: "orgs/organization_variables#edit",                       as: :organization_edit_variable
  put    "/organizations/:organization_id/settings/variables/:app_name/:name",                    to: "orgs/organization_variables#update",                     as: :organization_update_variable
end

scope "/:user_id/:repository", constraints: { repository: REPO_REGEX, user_id: USERID_REGEX } do
  ##
  # VariablesController
  constraints app_name: /actions/ do
    get    "settings/variables/:app_name",                     to: "variables#index",                         as: :repository_variables
    get    "settings/variables/:app_name/new",                 to: "variables#new",                           as: :repository_new_variable
    post   "settings/variables/:app_name/create",              to: "variables#create",                        as: :repository_create_variable
    delete "settings/variables/:app_name/:name",               to: "variables#destroy",                       as: :repository_delete_variable
    get    "settings/variables/:app_name/:name",               to: "variables#edit",                          as: :repository_edit_variable
    put    "settings/variables/:app_name/:name",               to: "variables#update",                        as: :repository_update_variable
  end

  scope path: "settings" do
    post   "environments/:environment_id/variables/new",             to: "repository_environments#add_variable",             as: :repository_environment_add_variable
    delete "environments/:environment_id/variables/:variable_name",  to: "repository_environments#remove_variable",          as: :repository_environment_remove_variable
    put    "environments/:environment_id/variables/:variable_name",  to: "repository_environments#update_variable",          as: :repository_environment_update_variable
  end

end
