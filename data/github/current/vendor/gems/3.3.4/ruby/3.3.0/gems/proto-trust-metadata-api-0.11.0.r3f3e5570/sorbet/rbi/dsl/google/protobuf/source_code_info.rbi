# typed: true

# DO NOT EDIT MANUALLY
# This is an autogenerated file for dynamic methods in `Google::Protobuf::SourceCodeInfo`.
# Please instead update this file by running `bin/tapioca dsl Google::Protobuf::SourceCodeInfo`.

class Google::Protobuf::SourceCodeInfo
  sig do
    params(
      location: T.nilable(T.any(Google::Protobuf::RepeatedField[Google::Protobuf::SourceCodeInfo::Location], T::Array[Google::Protobuf::SourceCodeInfo::Location]))
    ).void
  end
  def initialize(location: T.unsafe(nil)); end

  sig { void }
  def clear_location; end

  sig { returns(Google::Protobuf::RepeatedField[Google::Protobuf::SourceCodeInfo::Location]) }
  def location; end

  sig { params(value: Google::Protobuf::RepeatedField[Google::Protobuf::SourceCodeInfo::Location]).void }
  def location=(value); end
end
