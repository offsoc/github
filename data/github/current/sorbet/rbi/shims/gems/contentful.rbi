# typed: true
# frozen_string_literal: true

class Contentful::Asset < ::Contentful::FieldsResource
  sig { returns(String) }
  def title; end

  sig { returns(String) }
  def description; end

  sig { returns Contentful::File }
  def file; end
end

class Contentful::ContentType < ::Contentful::BaseResource
  sig { returns(String) }
  def id; end
end
