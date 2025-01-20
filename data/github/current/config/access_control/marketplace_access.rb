# typed: true
# frozen_string_literal: true

class Api::AccessControl < Egress::AccessControl
  define_access :write_marketplace_listing do |access|
    access.ensure_context :marketplace_listing

    access.allow :marketplace_listing_writer
  end

  define_access :read_marketplace_listing do |access|
    access.ensure_context :marketplace_listing

    access.allow(:everyone) { |context| context[:marketplace_listing].publicly_listed? }
    access.allow :marketplace_listing_writer
  end
end
