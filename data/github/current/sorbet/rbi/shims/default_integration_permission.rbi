# typed: true

class DefaultIntegrationPermission
  class PrivateCollectionProxy

    sig { returns(T::Hash[String, Symbol]) }
    def permission_map; end

    sig { params(permissions: T::Array[T::Hash[String,Symbol]]).returns(T::Array[T::Hash[String, Symbol]]) }
    def permission_map=(permissions); end
  end
end
