# typed: true

# DO NOT EDIT MANUALLY
# This is an autogenerated file for dynamic methods in `FeatureManagement::FeatureFlags::Management::V3::ListRolloutTreesRequest`.
# Please instead update this file by running `bin/tapioca dsl FeatureManagement::FeatureFlags::Management::V3::ListRolloutTreesRequest`.

class FeatureManagement::FeatureFlags::Management::V3::ListRolloutTreesRequest
  sig do
    params(
      filter: T.nilable(String),
      page: T.nilable(Integer),
      page_size: T.nilable(Integer),
      sort_by: T.nilable(String)
    ).void
  end
  def initialize(filter: nil, page: nil, page_size: nil, sort_by: nil); end

  sig { returns(T.nilable(Symbol)) }
  def _filter; end

  sig { returns(T.nilable(Symbol)) }
  def _sort_by; end

  sig { void }
  def clear_filter; end

  sig { void }
  def clear_page; end

  sig { void }
  def clear_page_size; end

  sig { void }
  def clear_sort_by; end

  sig { returns(String) }
  def filter; end

  sig { params(value: String).void }
  def filter=(value); end

  sig { returns(Integer) }
  def page; end

  sig { params(value: Integer).void }
  def page=(value); end

  sig { returns(Integer) }
  def page_size; end

  sig { params(value: Integer).void }
  def page_size=(value); end

  sig { returns(String) }
  def sort_by; end

  sig { params(value: String).void }
  def sort_by=(value); end
end
