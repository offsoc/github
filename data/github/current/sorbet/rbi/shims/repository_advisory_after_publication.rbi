# typed: true

module RepositoryAdvisory::AfterPublication
  sig { returns(Promise[RepositoryAdvisory]) }
  def async_repository_advisory; end

  sig { returns(::ActiveSupport::TimeWithZone) }
  def created_at; end
end
