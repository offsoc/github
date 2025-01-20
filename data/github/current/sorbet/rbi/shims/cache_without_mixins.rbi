# frozen_string_literal: true
# typed: true

module GitHub
  module Cache
    module WithoutMixins
      # this shim stubs the methods dynamically defined by
      # lib/github/cache/without_mixins.rb

      extend T::Sig

      def orig_get_multi(keys, raw); end;

      def orig_set(key, value, ttl, raw); end;

      def orig_add(key, value, ttl, raw); end;

      def orig_incr(key, value); end;

      def orig_decr(key, value); end;

      def orig_delete(key); end;

      def orig_exist?(key, options); end;
    end
  end
end
