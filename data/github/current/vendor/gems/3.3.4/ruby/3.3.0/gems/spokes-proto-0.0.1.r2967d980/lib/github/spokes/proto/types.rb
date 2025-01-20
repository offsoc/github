# frozen_string_literal: true

module GitHub
  module Spokes
    module Proto
      module Types
        def new_repository(id)
          V1::Repository.new(id: id, type: :TYPE_REPOSITORY)
        end

        def new_gist(id)
          V1::Repository.new(id: id, type: :TYPE_GIST)
        end

        def new_wiki(id)
          V1::Repository.new(id: id, type: :TYPE_WIKI)
        end

        extend self
      end
    end
  end
end
