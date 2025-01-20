# typed: true
# frozen_string_literal: true

module Platform
  module Interfaces
    module Base

      requires_ancestor { Kernel }

      module ClassMethods

        sig do
          params(
            args: T.untyped,
            kwargs: T.untyped,
            block: T.nilable(T.proc.bind(Platform::Objects::Base::Field).params(arg0: Platform::Objects::Base::Field).void)
          ).returns(Platform::Objects::Base::Field)
        end
        def field(*args, **kwargs, &block); end
      end

      mixes_in_class_methods(ClassMethods)
    end
  end
end
