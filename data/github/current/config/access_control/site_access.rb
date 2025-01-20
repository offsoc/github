# typed: true
# frozen_string_literal: true

class Api::AccessControl < Egress::AccessControl
  define_access :public_site_information do |access|
    access.allow :everyone
  end

  define_access :authenticated_user do |access|
    access.allow :authenticated_user
  end

  # This control access is used soley when
  # we need a control_access for auditing purposes.
  #
  # This is not intended for actual authorization.
  # Background: https://github.com/github/iam/blob/master/proposals/auditing-the-REST-api.md
  define_access :apps_audited do |access|
    access.allow :everyone
  end

  # This control access is used solely when we need an `access_allowed` call in
  # GraphQL for enforcing SAML in controllers, and the object is internal or
  # otherwise will not be accessed via the API
  define_access :saml_via_graphql do |access|
    access.allow :nobody
  end
end
