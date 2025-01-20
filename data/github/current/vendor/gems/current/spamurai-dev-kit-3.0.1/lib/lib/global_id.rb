require "base64"
require "json"
require "msgpack"

module SpamuraiDevKit
  module GlobalId
    METADATA = JSON.parse(File.read(File.join(File.dirname(__FILE__), "globalIdMetadata.json")))
    TYPE_HINT_TO_MODEL = METADATA["githubPlatformPrefixes"]
    SPAMURAI_NODE_TYPES = METADATA["spamuraiNodeTypes"]
    SUPPORTED_MODELS = TYPE_HINT_TO_MODEL.values + SPAMURAI_NODE_TYPES

    NEW_GRID_DELIMITER = "_".freeze

    class EncodeError < StandardError; end
    class ParseError < StandardError; end

    MALFORMED_ID_ERROR = "Unexpected data in global relay id (next GitHub platform format)"
    SUPPORTED_MODELS_ERROR = "We only support the following models: #{SUPPORTED_MODELS.join(", ")}"

    # Public: Extract an entity's model type and database ID from its
    # global ID.
    #
    # New GitHub Platform ids are base64 encoded model and database id
    # representations. The prefix maps to a specific model, and the rest of the id
    # base64 decodes to a msgpacked array with a template id and database id (for
    # account types). For example, the id "U_kgDOAAGn5g" is of type "User" with
    # a database id of 108518, since the contained data is [0, 108518]. (We can
    # ignore the template id for our purposes.)
    #
    # Spamurai and old GitHub Platform ids are base64 encoded model and database
    # id representations. They look like this when decoded:
    #
    #   04:User623
    #   12:Organization9919
    #
    # The first part describes how long the model name is and the second part is
    # the model name and the database id. Extract the database id by splitting on
    # ':' and then using the model name length from the first part to remove the
    # model name from the second part, leaving the database id as the remainder.
    #
    # graphql_id - String.
    #
    # Returns a tuple of [model_name, database_id].
    def self.extract_model_and_database_id(graphql_id)
      if graphql_id.include?(NEW_GRID_DELIMITER)
        extract_model_and_database_id_next(graphql_id)
      else
        extract_model_and_database_id_original(graphql_id)
      end
    end

    def self.extract_model_and_database_id_original(graphql_id)
      length_string, rest = Base64.decode64(graphql_id).split(":", 2)

      unless rest
        raise SpamuraiDevKit::GlobalId::ParseError.new("Invalid global relay id: #{graphql_id}")
      end

      length = length_string.to_i

      model_name = rest[0..length - 1]
      database_id = rest[length..-1].to_i
      [model_name, database_id]
    end

    def self.extract_model_and_database_id_next(graphql_id)
      type_hint, id_part = graphql_id.split(NEW_GRID_DELIMITER, 2)
      model_name = TYPE_HINT_TO_MODEL[type_hint]

      raise SpamuraiDevKit::GlobalId::ParseError.new(SUPPORTED_MODELS_ERROR) unless model_name

      id_part.strip!
      decoded_packed_path = Base64.urlsafe_decode64(id_part)
      decoded_result = MessagePack.unpack(decoded_packed_path)

      unless decoded_result.is_a?(Array)
        raise SpamuraiDevKit::GlobalId::ParseError.new(MALFORMED_ID_ERROR)
      end

      database_id = decoded_result.last
      [model_name, database_id]
    end

    # Public: Construct a classic global relay ID for an entity. Used for
    # all spamurai-next types and for legacy purposes on dotcom types.
    #
    # model_name - String.
    # database_id - Integer.
    #
    # Returns a String.
    def self.global_relay_id_classic(model_name, database_id)
      Base64.strict_encode64(["0", model_name.length, ":", model_name, database_id.to_s].join)
    end

    # Public: Construct a global relay ID for an entity. We only support Account
    # types, as defined by the GitHub GraphQL API e.g. User and Organization,
    # and SpamuraiNode types, as defined by the Spamurai Next GraphQL API e.g.
    # Queue and QueueEntry.
    #
    # model_name - String.
    # database_id - Integer.
    # quiet - Boolean. Should we throw an error or warn when given an unsupported model?
    #
    # Returns a String.
    def self.global_relay_id(model_name, database_id, quiet: false)
      unless SUPPORTED_MODELS.include?(model_name)
        raise SpamuraiDevKit::GlobalId::EncodeError.new(SUPPORTED_MODELS_ERROR) unless quiet

        # Warn and fall back to the original format for now
        puts "#{model_name} will lose Global ID support soon."
        puts "Please report to #platform-health-eng why you are writing an ID for this entity."
        return global_relay_id_classic(model_name, database_id)
      end

      # Use the original format for Spamurai Nodes
      return global_relay_id_classic(model_name, database_id) if SPAMURAI_NODE_TYPES.include?(model_name)

      type_prefix = TYPE_HINT_TO_MODEL.key(model_name)
      parts = [0, database_id]
      id_part = Base64.urlsafe_encode64(MessagePack.pack(parts)).sub(/=+\Z/, "")
      return "#{type_prefix}_#{id_part}"
    end
  end
end
