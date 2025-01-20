# typed: true
# frozen_string_literal: true

class CSV::Row
  sig { params(index_or_header: T.any(Integer, String), minimum_index: T.nilable(Integer)).returns(T.untyped) }
  def [](index_or_header, minimum_index = _); end
end
