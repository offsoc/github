# frozen_string_literal: true
module Enterprise
  module ConfigApply
    module HAProxy
      def haproxy_manage_command(socket, command)
        return if command.empty?
        return unless File.exist?(socket) && File.socket?(socket)
        begin
          Socket.unix(socket) do |sock|
            sock.write("#{command.chomp}\n")
            yield sock
          end
        rescue
          return
        end
      end

      def check_server_health(socket, server)
        server_data = {}
        haproxy_manage_command(socket, "show servers state #{server}") do |sock|
          sock.each do |line|
            next if line.empty?
            c_server_data = line.chomp.split(" ")
            # HAProxy data field 2 here is backend name
            next if c_server_data[1] != server
            # HAProxy data field 18 here is srv_fqdn
            server_data[:fqdn] = c_server_data[17]
            # HAProxy data field 6 here is op_state - an op_state of 2 is running fully
            server_data[:op_code] = c_server_data[5].to_i
            # Return the server data if it is the running server
            break if ! c_server_data.empty? && server_data[:op_code] == 2
          end
        end
        # Even if there isn't a running server return the last one parsed or the empty hash
        return server_data
      end
    end
  end
end
