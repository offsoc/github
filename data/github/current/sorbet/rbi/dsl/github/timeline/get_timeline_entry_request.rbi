# typed: true

# DO NOT EDIT MANUALLY
# This is an autogenerated file for dynamic methods in `Github::Timeline::GetTimelineEntryRequest`.
# Please instead update this file by running `bin/tapioca dsl Github::Timeline::GetTimelineEntryRequest`.

class Github::Timeline::GetTimelineEntryRequest
  sig do
    params(
      id: T.nilable(String),
      parent: T.nilable(Github::Timeline::Entity),
      viewer: T.nilable(Github::Timeline::Viewer)
    ).void
  end
  def initialize(id: nil, parent: nil, viewer: nil); end

  sig { void }
  def clear_id; end

  sig { void }
  def clear_parent; end

  sig { void }
  def clear_viewer; end

  sig { returns(String) }
  def id; end

  sig { params(value: String).void }
  def id=(value); end

  sig { returns(T.nilable(Github::Timeline::Entity)) }
  def parent; end

  sig { params(value: T.nilable(Github::Timeline::Entity)).void }
  def parent=(value); end

  sig { returns(T.nilable(Github::Timeline::Viewer)) }
  def viewer; end

  sig { params(value: T.nilable(Github::Timeline::Viewer)).void }
  def viewer=(value); end
end
