# typed: true

# DO NOT EDIT MANUALLY
# This is an autogenerated file for dynamic methods in `MonolithTwirp::Features::Actors::V1::GetActorsByNameRequest`.
# Please instead update this file by running `bin/tapioca dsl MonolithTwirp::Features::Actors::V1::GetActorsByNameRequest`.

class MonolithTwirp::Features::Actors::V1::GetActorsByNameRequest
  sig do
    params(
      query: T.nilable(T.any(Google::Protobuf::RepeatedField[MonolithTwirp::Features::Actors::V1::GetActorsByNameQuery], T::Array[MonolithTwirp::Features::Actors::V1::GetActorsByNameQuery]))
    ).void
  end
  def initialize(query: T.unsafe(nil)); end

  sig { void }
  def clear_query; end

  sig { returns(Google::Protobuf::RepeatedField[MonolithTwirp::Features::Actors::V1::GetActorsByNameQuery]) }
  def query; end

  sig do
    params(
      value: Google::Protobuf::RepeatedField[MonolithTwirp::Features::Actors::V1::GetActorsByNameQuery]
    ).void
  end
  def query=(value); end
end
