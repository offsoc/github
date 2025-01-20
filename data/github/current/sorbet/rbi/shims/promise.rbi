# typed: true

class Promise
  sig do
    type_parameters(:U).
      params(obj: T.nilable(T.any(T.type_parameter(:U), Promise[T.type_parameter(:U)]))).
      returns(Promise[T.type_parameter(:U)])
  end
  def self.resolve(obj = nil); end

  sig { params(enumerable: T::Enumerable[T.untyped]).returns(Promise[T::Array[T.untyped]]) }
  def self.all(enumerable); end

  sig { returns(Value) }
  def value; end

  sig { params(value: Value).returns(T.self_type) }
  def fulfill(value); end

  sig do
    type_parameters(:U).params(
      on_fulfill: T.nilable(T.proc.params(arg0: Value).returns(T.type_parameter(:U))),
      on_reject:  T.nilable(T.proc.params(arg0: T.untyped).returns(T.self_type)),
      block: T.nilable(T.proc.params(arg0: Value).returns(T.type_parameter(:U)))).
    returns(Promise[T.untyped])
  end
  def then(on_fulfill = nil, on_reject = nil, &block); end

  sig { returns(T::Boolean) }
  def pending?; end

  sig { returns(T::Boolean) }
  def fulfilled?; end

  sig { returns(T::Boolean) }
  def rejected?; end

  sig { returns(Value) }
  def sync; end
end
