# typed: true
# frozen_string_literal: true

return unless GitHub.billing_enabled?

class GeoIpLocationDiscrepancyError < StandardError; end

TRADE_RESTRICTION_REASONS = %w[
  ip
  email
  organization_member
  organization_admin
  organization_billing_manager
  website_url
  automatic_override_of_ip_based_restriction
]

GlobalInstrumenter.subscribe "user.signup.ip_update" do |_, _, _, _, payload|
  signup_compliance_check(payload: payload)
end

GlobalInstrumenter.subscribe "user.last_ip_update" do |_, _, _, _, payload|
  location_based_compliance_check(payload: payload)
end

GlobalInstrumenter.subscribe "user.add_email" do |_, _, _, _, payload|
  user = payload[:user]
  unless user.trade_controls_restriction.any?
    enqueue_user_compliance_check(user.id, email: payload[:added_email]&.email)
    enqueue_user_high_risk_geo(user, email: payload[:added_email]&.email)
  end
end

# Report trade controls events to dogstats
GitHub.subscribe(/^trade_controls_restriction\./) do |event, _, _, _, payload|
  # Keep reason tag to low cardinality
  payload[:reason] = :manual unless TRADE_RESTRICTION_REASONS.include?(payload[:reason].to_s)
  if payload[:country_code].blank? && payload[:restricted_country].present?
    payload[:country_code] = payload[:restricted_country]
  end

  tags = payload
    .slice(:country_code, :reason, :restriction_type, :restriction_type_was, :skip_enforcement_email)
    .map { |t| t.join(":") }
  tags << "owner_type:#{payload[:user] ? 'USER' : 'ORGANIZATION'}" if payload[:user] || payload[:org]
  GitHub.dogstats.increment(event, tags: tags)
end

GlobalInstrumenter.subscribe "profile.update" do |_, _, _, _, payload|
  account = payload[:current_profile].user
  if account.organization? && payload[:changed_attribute_names].include?("blog")
    enqueue_org_compliance_check(account.id, website_url: account.profile_blog)
    enqueue_org_high_risk_geo(account.id, reason: :website_url)
  end
end

GlobalInstrumenter.subscribe "profile.update" do |_, _, _, _, payload|
  account = payload[:current_profile].user
  if account.organization? && payload[:changed_attribute_names].include?("email")
    enqueue_org_compliance_check(account.id, reason: :organization_profile_email)
    enqueue_org_high_risk_geo(account.id, reason: :profile_email)
  end
end

GitHub.subscribe "billing.change_email" do |_, _, _, _, payload|
  enqueue_org_compliance_check(payload[:org_id], reason: :organization_billing_email)
  enqueue_org_high_risk_geo(payload[:org_id], reason: :billing_email)
end

GitHub.subscribe "org.add_billing_manager" do |_, _, _, _, payload|
  enqueue_org_compliance_check(payload[:org_id], reason: :organization_billing_manager)
end

GitHub.subscribe "org.remove_billing_manager" do |_, _, _, _, payload|
  enqueue_org_compliance_check(payload[:org_id], reason: :organization_billing_manager)
end

GlobalInstrumenter.subscribe "org.add_member" do |_, _, _, _, payload|
  if payload[:permission] == :admin
    enqueue_org_compliance_check(payload[:org].id, reason: :organization_admin)
  end
end

GitHub.subscribe "org.update_member" do |_, _, _, _, payload|
  if payload[:permission] == :admin
    enqueue_org_compliance_check(payload[:org_id], reason: :organization_admin)
  end
end

GlobalInstrumenter.subscribe "copilot.trade_restricted_country_block" do |_, _, _, _, payload|
  location_based_compliance_check(payload: payload)
end

GlobalInstrumenter.subscribe "organization.create" do |_, _, _, _, payload|
  enqueue_org_compliance_check(payload[:organization].id, reason: :organization_billing_email, event_source: "organization.create")
end

GlobalInstrumenter.subscribe "org.add_member" do |_, _, _, _, payload|
  enqueue_org_compliance_check(payload[:org].id, reason: :organization_member)
end

def enqueue_org_compliance_check(org, **kwargs)
  TradeControls::OrganizationComplianceCheckJob.perform_later(org, **kwargs)
end

def enqueue_user_compliance_check(user, **kwargs)
  TradeControls::ComplianceCheckJob.perform_later(user, **kwargs)
end

def enqueue_user_high_risk_geo(user, **kwargs)
  TradeControls::UserHighRiskGeoJob.perform_later(user, **kwargs)
end

def enqueue_org_high_risk_geo(org_id, **kwargs)
  TradeControls::OrgHighRiskGeoJob.perform_later(org_id, **kwargs)
end

def signup_compliance_check(payload:)
  actor = payload[:actor]
  actor_ip = payload[:actor_ip]
  location = get_location(payload: payload)

  if actor_ip.blank? && GitHub.context.to_hash[:actor_ip].present?
    instrument_actor_ip_mismatch_error(actor: actor, action: "signup", code_function: "signup_compliance_check")
  end
  enqueue_user_compliance_check(actor.id, ip: actor_ip, location: location, event_source: "user.signup")
  enqueue_user_compliance_check(actor.id, email: payload[:signup_email]&.email, event_source: "user.signup")
  enqueue_user_high_risk_geo(actor, location: location, email: payload[:signup_email]&.email)
end

def location_based_compliance_check(payload:)
  actor = payload[:actor]
  actor_has_restriction = actor.trade_controls_restriction.any?

  location = get_location(payload: payload)
  return unless location&.dig(:country_code)

  actor_location_is_high_risk = actor_location_high_risk?(location: location)
  return if actor_location_is_high_risk && actor_has_restriction

  if actor_has_restriction
    if actor.trade_controls_restriction.can_override_automatically?
      reason = "automatic_override_of_ip_based_restriction"
      compliance = TradeControls::ManualCompliance.new(actor: User.staff_user, reason: reason)
      actor.trade_controls_restriction.override!(compliance: compliance)
    end

    return
  end

  # run the compliance check if the actor location: has no country code or is high risk
  # An actor with a high risk location will be checked for compliance
  # An actor with a payload with no country code will be checked for compliance
  country = location.dig(:country_code) # 2-letter code
  return unless country.nil? || actor_location_is_high_risk

  if payload[:current_ip].blank? && GitHub.context.to_hash[:actor_ip].present?
    instrument_actor_ip_mismatch_error(actor: actor, action: "ip_update", code_function: "location_based_compliance_check")
  end

  enqueue_user_compliance_check(actor.id, ip: payload[:current_ip], location: location)
  enqueue_user_high_risk_geo(actor, location: location)
end

private

def instrument_actor_ip_mismatch_error(actor:, action:, code_function:)
  GitHub.dogstats.increment("trade_controls.actor_ip_mismatch_error", tags: ["action:#{action}"])
  GitHub.logger.warn("Could not find actor IP from lookup while IP from context is present", {
    "code.namespace" => "TradeControlsEventSubscriptions",
    "code.function" => code_function,
    "enduser.id" => actor.display_login,
    "gh.enduser.id" => actor.id,
    "gh.enduser.login" => actor.display_login
  })
end

def actor_location_high_risk?(location:)
  country = location.dig(:country_code) # 2-letter code
  region = location.dig(:region_name)
  city = location.dig(:city)

  if country.present?
    return ::TradeControls::Countries.high_risk_geo?(country: country, region: region, city: city)
  end

  high_risk_geo = TradeControls::UserHighRiskGeoManager.new(location: location).high_risk_geo
  return true if high_risk_geo.present?

  compliance = TradeControls::Compliance.for(ip: payload[:current_ip], location: location)
  compliance.violation?
end

def get_location(payload:)
  # `user.signup.ip_update` sets `actor_` in the payload instead of `current_` so this is to normalize the payload
  payload = payload.merge(current_ip: payload[:actor_ip]) unless payload.dig(:current_ip).present?
  payload = payload.merge(current_location: payload[:actor_location]) unless payload.dig(:current_location).present?

  # return if there is not sufficient data to get a location
  return unless payload.dig(:current_location, :country_code).present? || payload[:current_ip].present?

  payload_location = payload[:current_location] || {}
  country = payload_location.dig(:country_code)
  region = payload_location.dig(:region_name)
  city = payload_location.dig(:city)
  return payload_location if country.present? && region.present? && city.present?

  # If the GeoIP2 DB is not present log it as the lookup will return an empty location
  geoip_location = GitHub::Location.look_up(payload[:current_ip])
  GitHub.dogstats.increment("geoip2.trade_controls.database_missing") if geoip_location[:country_code].blank? && GitHub::Location.db.nil?

  geoip_location
end
