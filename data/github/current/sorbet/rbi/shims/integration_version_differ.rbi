# typed: true

class IntegrationVersion
  class Differ
    class Result

      # dynamically defined in IntegrationVersion::Differ::Result
      sig { returns(T::Boolean) }
      def events_added?; end

      sig { returns(T::Boolean) }
      def events_removed?; end

      sig { returns(T::Boolean) }
      def events_changed?; end

      sig { returns(T::Hash[String, Symbol]) }
      def permissions_added; end

      sig { returns(T::Boolean) }
      def permissions_added?; end

      sig { returns(T::Boolean) }
      def permissions_downgraded?; end

      sig { returns(T::Boolean) }
      def permissions_removed?; end

      sig { returns(T::Boolean) }
      def permissions_unchanged?; end

      sig { returns(T::Hash[String, Symbol]) }
      def permissions_upgraded; end

      sig { returns(T::Boolean) }
      def permissions_upgraded?; end

      sig { returns(T::Boolean) }
      def single_file_paths_added?; end

      sig { returns(T::Boolean) }
      def single_file_paths_removed?; end

      sig { returns(T::Boolean) }
      def single_file_paths_unchanged?; end

      sig { returns(T::Boolean) }
      def content_references_added?; end

      sig { returns(T::Boolean) }
      def content_references_removed?; end

      sig { returns(T::Boolean) }
      def contents_unchanged?; end

    end
  end
end
