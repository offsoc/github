# typed: strict
# frozen_string_literal: true

MemexOwner = T.type_alias { T.any(Organization, User) }

class MemexProject
  sig { returns(Promise[T.nilable(MemexOwner)]) }
  def async_owner; end
end
