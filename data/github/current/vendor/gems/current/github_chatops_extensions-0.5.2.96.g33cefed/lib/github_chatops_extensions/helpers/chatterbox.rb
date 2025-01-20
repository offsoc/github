# frozen_string_literal: true

require "chatterbox-client"

module GitHubChatopsExtensions
  class Helpers
    class Chatterbox
      # Send a direct message to a user. Note that as presently implemented, this message
      # will appear under Slackbot, and not in any direct message the user may have open
      # with Hubot. I'm not sure if a fix for this is possible or desirable.
      #
      # user    - String - user ID who should receive the message
      # message - String - text of the message to send
      #
      # Returns nothing and does not block on failure.
      def self.say_in_direct_message(user:, message:)
        say_out_of_band(user:, room_id: nil, message:)
      end

      # Send an out-of-band reply, e.g. if you need to prompt a user to do something
      # before the command finishes running or surface an error immediately. This will
      # send the message to the room where it was typed, or direct-message it to the
      # person if the room cannot be determined.
      #
      # user    - String - user ID who should receive the message
      # room_id - String - room ID where message should be sent (nil for DM)
      # message - String - text of the message to send
      # mention - Boolean - whether to at-mention the recipient
      #
      # Returns nothing and does not block on failure.
      def self.say_out_of_band(user:, room_id: nil, message:, mention: nil)

        # Handle direct messages
        target_room = if room_id == "##{user}" || room_id.nil? || room_id.strip == ""
                        mention = false
                        "@#{user}"
        else
          room_id
        end

        # TODO: Does this ever have to reference `mention_slug`? Slack seems to accept `@user` from bots now.
        mentioned = "@#{user}"

        # Add an at-mention depending on text of the message and the user's wishes.
        message_to_send = if mention == false
                            message
        elsif mention == true
          "#{mentioned}: #{message}"
        else
          message.start_with?("@") ? message : "#{mentioned}: #{message}"
        end

        # Transmit the message. Log any exceptions to failbot but don't block/raise on them
        # or surface them directly to the user.
        begin
          ::Chatterbox::Client.say(target_room, message_to_send)
        rescue => exc
          Failbot.report(exc)
        end
      end
    end
  end
end
