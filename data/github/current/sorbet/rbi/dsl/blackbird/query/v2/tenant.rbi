# typed: true

# DO NOT EDIT MANUALLY
# This is an autogenerated file for dynamic methods in `Blackbird::Query::V2::Tenant`.
# Please instead update this file by running `bin/tapioca dsl Blackbird::Query::V2::Tenant`.

class Blackbird::Query::V2::Tenant
  sig { params(shortcode: T.nilable(String), slug: T.nilable(String), tenant_id: T.nilable(Integer)).void }
  def initialize(shortcode: nil, slug: nil, tenant_id: nil); end

  sig { void }
  def clear_shortcode; end

  sig { void }
  def clear_slug; end

  sig { void }
  def clear_tenant_id; end

  sig { returns(String) }
  def shortcode; end

  sig { params(value: String).void }
  def shortcode=(value); end

  sig { returns(String) }
  def slug; end

  sig { params(value: String).void }
  def slug=(value); end

  sig { returns(Integer) }
  def tenant_id; end

  sig { params(value: Integer).void }
  def tenant_id=(value); end
end
