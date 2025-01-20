# frozen_string_literal: true
# typed: strict

require "vexi/entity"
require "vexi/actor_collection"
require "vexi/hash_actor_collection"

module Vexi
  # Segment represents a segment.
  class Segment
    extend T::Sig
    extend T::Helpers

    include Entity

    sig { params(name: String).void }
    attr_writer :name

    sig { returns(ActorCollection) }
    attr_accessor :actors

    sig { params(name: String, actors: ActorCollection, actors_embedded: T::Boolean).void }
    def initialize(name: "", actors: HashActorCollection.new({}), actors_embedded: false)
      @name = name
      @actors = actors
    end

    sig { override.returns(String) }
    def name
      @name
    end

    sig { params(json: T::Hash[String, T.untyped]).returns(Segment) }
    def self.from_json(json)
      segment = Segment.new
      segment.name = json["name"]
      segment.actors = HashActorCollection.new({})
      (json["actors"] || []).each do |actor_name|
        segment.actors[actor_name] = true
      end
      segment
    end

    sig { params(name: String).returns(Segment) }
    def self.create_default(name)
      Segment.new(name: name, actors_embedded: false)
    end
  end
end
