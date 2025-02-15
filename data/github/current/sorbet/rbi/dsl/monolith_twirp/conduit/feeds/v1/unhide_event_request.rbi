# typed: true

# DO NOT EDIT MANUALLY
# This is an autogenerated file for dynamic methods in `MonolithTwirp::Conduit::Feeds::V1::UnhideEventRequest`.
# Please instead update this file by running `bin/tapioca dsl MonolithTwirp::Conduit::Feeds::V1::UnhideEventRequest`.

class MonolithTwirp::Conduit::Feeds::V1::UnhideEventRequest
  sig { params(event_id: T.nilable(Integer)).void }
  def initialize(event_id: nil); end

  sig { void }
  def clear_event_id; end

  sig { returns(Integer) }
  def event_id; end

  sig { params(value: Integer).void }
  def event_id=(value); end
end
