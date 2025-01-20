# typed: true

module Stafftools
  class LargeFilesView
    module PreviewTogglerHelper
      extend T::Sig
      extend T::Helpers

      abstract!

      sig { abstract.returns(::Repository) }
      def git_lfs_configurable; end
    end
  end
end

module Configurable
  module GitLfs
    extend T::Sig
    extend T::Helpers

    abstract!

    sig { abstract.returns(Configuration) }
    def config; end
  end
end
