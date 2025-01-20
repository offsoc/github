# typed: true

class IntegrationInstallation
  class PrivateRelation

    sig { params(
      subject: T.any(
        Business,
        Organization,
        ProtectedBranch,
        PullRequest,
        Repositories::IRepository,
        User
      ),
      resources: String,
      min_action: Symbol,
      )
      .returns(IntegrationInstallation::PrivateRelation) }
    def with_resources_on(subject:, resources:, min_action:); end
  end

  class PrivateCollectionProxy

    sig { params(user: T.any(User, Bot), repository_ids: T::Array[Integer]).returns(ActiveRecord::Relation) }
    def with_user(user, repository_ids: nil); end
  end

  # method from ActiveRecord::AssociationRelation
  def self.scoping(&block); end

end
