# typed: strict
# frozen_string_literal: true

T.bind(self, ActionDispatch::Routing::Mapper)

# Org Level Discussion Categories and Sections
scope "discussions", module: :discussions, as: "org_discussions" do
  resources :categories, only: [:index, :new, :edit]
  resources :sections, only: [:new, :edit], param: :slug
end

# Org Level Discussions
get     "/discussions",                       to: "orgs/discussions#index", as: :org_discussions
get     "/discussions/categories/:category_slug", to: "orgs/discussions#index", as: :org_discussions_category
get     "/discussions/new",                   to: "discussions#new", as: :new_org_discussion
get     "/discussions/new/choose",            to: "discussions/choose#show", as: :org_choose_category_discussion
get     "/discussions/author_filter_content", to: "orgs/discussions#author_filter_content",
  as: :org_discussions_author_filter_content
get     "/discussions/:number",               to: "discussions#show", as: :org_discussion
