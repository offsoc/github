# typed: true
# frozen_string_literal: true

module Storage::Uploadable
  mixes_in_class_methods(Storage::Uploadable::Policy::ClassMethods)
end
