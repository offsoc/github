# frozen_string_literal: true
require 'set'

module Codeowners
  class OwnerResolver
    def initialize
      @owners = {}
    end

    def register_owners(owners_list)
      owners_list.each do |owner|
        @owners[owner.identifier.downcase] = owner
      end
    end

    # The resolve method is here so that subclasses of OwnerResolver can override this method.
    # An example give would be of an implementation where a resolved owner is an active record object.
    def resolve(owner_identifier)
      @owners[owner_identifier.downcase]
    end

    def resolve_many(owner_identifiers)
      @owners.values_at(*owner_identifiers.map(&:downcase))
    end

    # Subclasses should override this method to provide more context-specific
    # information.
    def suggestion_for_unresolved_owner(_owner)
      nil
    end
  end
end
