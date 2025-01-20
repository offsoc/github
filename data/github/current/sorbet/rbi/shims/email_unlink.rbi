# frozen_string_literal: true
# typed: strict

# Methods in this class overrides the automatic generated ones
# in sorbet/rbi/dsl/email_unlink.rbi. It adds methods dynamically
# defined by `define_method` which cannot be introspected by Sorbet.
class EmailUnlink
  extend T::Sig

  sig { returns(T::Boolean) }
  def flash_notice?; end

  sig { returns(T::Boolean) }
  def flash_warn?; end

  sig { returns(T::Boolean) }
  def flash_error?; end

  sig { returns(String) }
  def flash_notice; end

  sig { returns(String) }
  def flash_warn; end

  sig { returns(String) }
  def flash_error; end

  sig { params(value: String).void }
  def flash_notice=(value); end

  sig { params(value: String).void }
  def flash_warn=(value); end

  sig { params(value: String).void }
  def flash_error=(value); end
end
