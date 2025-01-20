# typed: true
# frozen_string_literal: true

class Api::AccessControl < Egress::AccessControl
  define_access :read_sponsors_listing do |access|
    access.ensure_context :sponsors_listing

    access.allow(:everyone) { |context| context[:sponsors_listing].approved? }
    access.allow :sponsors_listing_reader
  end

  define_access :read_sponsors_tier do |access|
    access.ensure_context :sponsors_tier

    access.allow(:everyone) { |context| context[:sponsors_tier].publicly_visible? }
    access.allow :sponsors_tier_reader
  end

  define_access :read_sponsors_tier_admin_info do |access|
    access.ensure_context :sponsors_tier
    access.allow :sponsors_tier_admin_info_reader
  end

  define_access :read_sponsorship_newsletter do |access|
    access.ensure_context :sponsorship_newsletter
    access.allow :sponsorship_newsletter_reader
  end

  define_access :read_sponsors_goal do |access|
    access.ensure_context :sponsors_goal

    access.allow(:everyone) { |context| context[:sponsors_goal].publicly_visible? }
    access.allow :sponsors_goal_reader
  end

  define_access :read_sponsors_activity do |access|
    access.ensure_context :sponsors_activity
    access.allow :sponsors_activity_reader
  end

  define_access :admin_sponsorship do |access|
    access.allow :sponsorship_writer
  end

  define_access :admin_sponsors_listing do |access|
    access.allow :sponsors_listing_writer
  end
end
