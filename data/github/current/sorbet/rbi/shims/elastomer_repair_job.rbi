# typed: true

class Elastomer::RepairJob
  sig { params(type: String, opts: T::Hash[Symbol, T.untyped]).returns(NilClass)}
  def self.reconcile(type, opts); end
end
