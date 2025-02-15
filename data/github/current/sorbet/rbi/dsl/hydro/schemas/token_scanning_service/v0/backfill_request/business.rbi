# typed: true

# DO NOT EDIT MANUALLY
# This is an autogenerated file for dynamic methods in `Hydro::Schemas::TokenScanningService::V0::BackfillRequest::Business`.
# Please instead update this file by running `bin/tapioca dsl Hydro::Schemas::TokenScanningService::V0::BackfillRequest::Business`.

class Hydro::Schemas::TokenScanningService::V0::BackfillRequest::Business
  sig { params(id: T.nilable(Google::Protobuf::Int32Value), name: T.nilable(String)).void }
  def initialize(id: nil, name: nil); end

  sig { void }
  def clear_id; end

  sig { void }
  def clear_name; end

  sig { returns(T.nilable(Google::Protobuf::Int32Value)) }
  def id; end

  sig { params(value: T.nilable(Google::Protobuf::Int32Value)).void }
  def id=(value); end

  sig { returns(String) }
  def name; end

  sig { params(value: String).void }
  def name=(value); end
end
