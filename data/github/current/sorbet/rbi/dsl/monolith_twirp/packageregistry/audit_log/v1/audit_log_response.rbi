# typed: true

# DO NOT EDIT MANUALLY
# This is an autogenerated file for dynamic methods in `MonolithTwirp::Packageregistry::AuditLog::V1::AuditLogResponse`.
# Please instead update this file by running `bin/tapioca dsl MonolithTwirp::Packageregistry::AuditLog::V1::AuditLogResponse`.

class MonolithTwirp::Packageregistry::AuditLog::V1::AuditLogResponse
  sig { params(msg: T.nilable(String)).void }
  def initialize(msg: nil); end

  sig { void }
  def clear_msg; end

  sig { returns(String) }
  def msg; end

  sig { params(value: String).void }
  def msg=(value); end
end
