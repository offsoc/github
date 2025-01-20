# typed: true

class OrganizationInvitation
  class PrivateRelation
    extend T::Sig

    sig { params(token: String).returns(OrganizationInvitation::PrivateRelation) }
    def find_by_token(token); end
  end
end
