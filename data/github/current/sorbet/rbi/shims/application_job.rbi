# frozen_string_literal: true
# typed: true

class ApplicationJob < ActiveJob::Base
  extend T::Sig

  sig { params(method_names: Symbol, blk: T.nilable(T.proc.params(job: T.attached_class).bind(T.attached_class).void)).void }
  def self.before_enqueue(*method_names, &blk); end

  sig { params(method_names: Symbol, blk: T.nilable(T.proc.params(job: T.attached_class).bind(T.attached_class).void)).void }
  def self.before_perform(*method_names, &blk); end

  sig { params(method_names: Symbol, blk: T.nilable(T.proc.params(job: T.attached_class).bind(T.attached_class).void)).void }
  def self.after_enqueue(*method_names, &blk); end

  sig { params(method_names: Symbol, blk: T.nilable(T.proc.params(job: T.attached_class).bind(T.attached_class).void)).void }
  def self.after_perform(*method_names, &blk); end

  sig { params(method_names: Symbol, blk: T.nilable(T.proc.params(job: T.attached_class, block: T.proc.void).bind(T.attached_class).void)).void }
  def self.around_enqueue(*method_names, &blk); end

  sig { params(method_names: Symbol, blk: T.nilable(T.proc.params(job: T.attached_class, block: T.proc.void).bind(T.attached_class).void)).void }
  def self.around_perform(*method_names, &blk); end
end
