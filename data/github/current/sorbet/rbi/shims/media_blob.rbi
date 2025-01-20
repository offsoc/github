# typed: true

class Media::Blob
  # This happens at runtime, but help Sorbet figure this out statically.
  extend Asset::AlambicCaller::ClassMethods

  extend T::Sig

  # The Tapioca bindings misconfigure this to have it return a string rather
  # than deferring to Storage::Uploadable::Policy like Ruby does.
  sig { returns(Symbol) }
  def storage_provider; end

  class PrivateRelation
    extend T::Helpers

    sig { params(repository_network: RepositoryNetwork).returns(T::Boolean) }
    def in_network?(repository_network); end
  end
end
