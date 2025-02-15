# typed: true

# DO NOT EDIT MANUALLY
# This is an autogenerated file for dynamic methods in `PlatformTypes::GateRequestState`.
# Please instead update this file by running `bin/tapioca dsl PlatformTypes::GateRequestState`.

module PlatformTypes::GateRequestState
  sig { returns(T::Boolean) }
  def closed?; end

  sig { returns(T::Boolean) }
  def open?; end

  CLOSED = T.let("CLOSED", String)
  OPEN = T.let("OPEN", String)
end
