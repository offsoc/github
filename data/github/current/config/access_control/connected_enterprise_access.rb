# typed: true
# frozen_string_literal: true
class Api::AccessControl < Egress::AccessControl
  role :s4_enterprise_data_reader, scope: %w(read:enterprise) do |context|
    user, business = extract(context, :user, :resource)
    user && business && business.readable_by?(user)
  end

  role :s4_organization_data_reader, scope: %w(read:org) do |context|
    user, org = extract(context, :user, :resource)
    user && org && org.resources.organization_administration.readable_by?(user) && org.plan.business_plus?
  end
end
