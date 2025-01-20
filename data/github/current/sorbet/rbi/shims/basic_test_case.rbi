# frozen_string_literal: true
# typed: true

class GitHub::BasicTestCase
  sig { params(args: T.untyped, block: T.proc.bind(T.attached_class).void).void }
  def self.setup(*args, &block); end

  sig { params(args: T.untyped, block: T.proc.bind(T.attached_class).void).void }
  def self.setup_once(*args, &block); end

  sig { params(args: T.untyped, block: T.proc.bind(T.attached_class).void).void }
  def self.teardown(*args, &block); end

  sig { params(args: T.untyped, block: T.proc.bind(T.attached_class).void).void }
  def self.teardown_once(*args, &block); end

  sig { params(args: T.untyped, block: T.proc.bind(T.attached_class).void).void }
  def self.fixtures(*args, &block); end

  sig { params(value: T::Boolean).void }
  def self.strict_fixtures=(value); end

  sig { params(reason: String).returns(T::Boolean) }
  def self.skip(reason); end

  sig { returns(T::Boolean) }
  def self.strict_fixtures; end

  sig { returns(T::Boolean) }
  def self.skip_enterprise; end

  sig { returns(T::Boolean) }
  def self.enterprise_only; end

  sig { returns(T::Boolean) }
  def self.skip_all_features; end

  sig { returns(T::Boolean) }
  def self.skip_with_all_emus; end

  sig { returns(T::Boolean) }
  def self.temporarily_skip_until_audited_in_emu_fanout_initiative; end

  sig { returns(T::Boolean) }
  def self.skip_in_multitenant_mode; end

  sig { returns(T::Boolean) }
  def self.spammy_only; end

  sig { returns(T::Boolean) }
  def self.skip_when_spammy; end

  sig { params(config: Symbol).returns(T::Boolean) }
  def self.skip_unless(config); end

  sig { returns(T::Boolean) }
  def self.es_5_only; end

  sig { params(name: String, opts: T::Hash[Symbol, T.untyped], block: T.proc.bind(T.attached_class).void).void }
  def self.gauntlet(name, *opts, &block); end
end
