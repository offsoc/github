# typed: true

class Google::Protobuf::EnumDescriptor
  sig { returns(T.all(Google::Protobuf::EnumDescriptor::EnumModule, Module)) }
  def enummodule; end
end

module Google::Protobuf::EnumDescriptor::EnumModule
  sig { returns(Google::Protobuf::EnumDescriptor) }
  def descriptor; end
end
