# typed: true

# DO NOT EDIT MANUALLY
# This is an autogenerated file for dynamic methods in `Turboscan::Proto::CountsByToolResponse`.
# Please instead update this file by running `bin/tapioca dsl Turboscan::Proto::CountsByToolResponse`.

class Turboscan::Proto::CountsByToolResponse
  sig do
    params(
      tool_counts: T.nilable(T.any(Google::Protobuf::RepeatedField[Turboscan::Proto::ToolAlertCount], T::Array[Turboscan::Proto::ToolAlertCount]))
    ).void
  end
  def initialize(tool_counts: T.unsafe(nil)); end

  sig { void }
  def clear_tool_counts; end

  sig { returns(Google::Protobuf::RepeatedField[Turboscan::Proto::ToolAlertCount]) }
  def tool_counts; end

  sig { params(value: Google::Protobuf::RepeatedField[Turboscan::Proto::ToolAlertCount]).void }
  def tool_counts=(value); end
end
