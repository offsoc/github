# frozen_string_literal: true

require_relative "base"

module GitHubChatopsExtensions
  module Checks
    module Includable
      module Room
        # Require that the chat message be sent in a particular chat room. If
        # room_id_or_list is not specified, then this will prohibit direct messages
        # but allow any chat room.
        #
        # room_id_or_list - A String or Array with acceptable room name(s).
        #
        # Returns nothing, but will `jsonrpc_response` an error if room does not match.
        def require_in_room(room_id_or_list = :any)
          banner = ".#{self.class.chatops_namespace} #{params[:action]}"
          checker = GitHubChatopsExtensions::Checks::Room.new(params, banner, logger)
          begin
            checker.require_in_room(room_id_or_list)
          rescue GitHubChatopsExtensions::Errors::RoomRestrictionError => exc
            jsonrpc_response(result: exc.message)
          end
        end
      end
    end

    class Room < Base
      # Require that the chat message be sent in a particular chat room. If
      # room_id_or_list is not specified, then this will prohibit direct messages
      # but allow any chat room.
      #
      # room_id_or_list - A String or Array with acceptable room name(s).
      #
      # Returns nothing, but will raise RoomRestrictionError upon prohibited action.
      def require_in_room(room_id_or_list = :any)
        acceptable_rooms = [room_id_or_list].flatten.compact

        # Direct messages
        if acceptable_rooms.include?(:any)
          return if room_id != "##{user}"
          acceptable_room_error(acceptable_rooms)
        end

        # Actual room restrictions
        acceptable_rooms.map! { |room| room.start_with?("#") ? room : "##{room}" }
        acceptable_room_error(acceptable_rooms) unless acceptable_rooms.include?(room_id)
      end

      private

      def acceptable_room_error(acceptable_rooms)
        logger.error "#{user} tried to run '#{banner}' in #{room_id.inspect}"
        where = acceptable_room_string(acceptable_rooms)
        message = "Sorry, @#{user}, `#{banner}` must be run in #{where}"
        raise GitHubChatopsExtensions::Errors::RoomRestrictionError, message
      end

      def acceptable_room_string(acceptable_rooms)
        if acceptable_rooms.empty? || acceptable_rooms.include?(:any)
          "a chat room (not a direct message)"
        elsif acceptable_rooms.size == 1
          acceptable_rooms.first
        else
          room_list = acceptable_rooms.join(", ")
          "one of these rooms: #{room_list}"
        end
      end
    end
  end
end
