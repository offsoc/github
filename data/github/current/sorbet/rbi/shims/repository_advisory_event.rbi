# frozen_string_literal: true
# typed: true

class RepositoryAdvisoryEvent
  extend T::Sig

  sig { returns(T::Boolean) }
  def accepted?; end

  sig { returns(T::Boolean) }
  def closed?; end

  sig { returns(T::Boolean) }
  def collaborator_added?; end

  sig { returns(T::Boolean) }
  def collaborator_removed?; end

  sig { returns(T::Boolean) }
  def credit_accepted?; end

  sig { returns(T::Boolean) }
  def credit_assigned?; end

  sig { returns(T::Boolean) }
  def credit_declined?; end

  sig { returns(T::Boolean) }
  def credit_type_changed?; end

  sig { returns(T::Boolean) }
  def credit_unassigned?; end

  sig { returns(T::Boolean) }
  def cve_assigned?; end

  sig { returns(T::Boolean) }
  def cve_not_assigned?; end

  sig { returns(T::Boolean) }
  def cve_requested?; end

  sig { returns(T::Boolean) }
  def github_published?; end

  sig { returns(T::Boolean) }
  def github_rejected?; end

  sig { returns(T::Boolean) }
  def github_withdrawn?; end

  sig { returns(T::Boolean) }
  def published?; end

  sig { returns(T::Boolean) }
  def renamed?; end

  sig { returns(T::Boolean) }
  def reopened?; end

  sig { returns(T::Boolean) }
  def workspace_created?; end

  sig { returns(T::Boolean) }
  def workspace_deleted?; end
end
