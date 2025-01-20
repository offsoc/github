# frozen_string_literal: true
require "set"
require "open3"

module Enterprise
  module ConfigApply
    # Firewall contains methods to manipulate the appliance's iptables rules
    module Firewall

      class UfwRule
        def initialize(name, allow_string, ip)
          @name = name.downcase
          @allow_boolean = allow_string.downcase
          @ip = ip
        end
        def to_s
          "#{@name}, #{@allow_boolean}, #{@ip}"
        end
      end

      UFW_APPLICATIONS = [
        "cluster-ghe-1336",
        "cluster-ghe-1433",
        "cluster-ghe-3000",
        "cluster-ghe-10008",
        "cluster-ghe-3306",
        "cluster-ghe-4486",
        "cluster-ghe-5004",
        "cluster-ghe-5010",
        "cluster-ghe-5022",
        "cluster-ghe-5115",
        "cluster-ghe-6379",
        "cluster-ghe-8149",
        "cluster-ghe-9000",
        "cluster-ghe-9092",
        "cluster-ghe-9100",
        "cluster-ghe-9101",
        "cluster-ghe-9102",
        "cluster-ghe-9105",
        "cluster-ghe-9200",
        "cluster-ghe-9300",
        "cluster-ghe-11211",
        "cluster-ghe-15000",
        # gitrpcd
        "cluster-ghe-8743",
        "cluster-ghe-9480",
        # collectd network server
        "cluster-ghe-25827",
        # collectd statsd server
        "cluster-ghe-8125",
        # graphite-web (Graphite API)
        "cluster-ghe-8000",
        # grafana (Grafana dashboard)
        "cluster-ghe-8001",
        # svn commit pushes from svnbridge on a fileserver
        "cluster-ghe-3033",
        # Consul ports for Server RPC, Serf LAN, and Serf WAN
        # Other ports are 8500 (HTTP API) and 8600 (DNS), but those are only localhost
        # See https://www.consul.io/docs/agent/options.html#ports
        "cluster-ghe-8300",
        "cluster-ghe-8301",
        "cluster-ghe-8302",
        # Nomad ports for HTTP API, RPC, Serf WAN and Dynamic Ports
        # See https://www.nomadproject.io/guides/install/production/requirements.html#ports-used
        "cluster-ghe-4646",
        "cluster-ghe-4647",
        "cluster-ghe-4648",
        "cluster-ghe-5008",
        "cluster-ghe-5012",
        "cluster-ghe-20000-20499",
        "cluster-ghe-10001-10003",
        "cluster-ghe-10004",
        "cluster-ghe-10005",
        "cluster-ghe-10007",
        "cluster-ghe-10012",
        # ghes manage api: gateway and agent
        "cluster-ghe-9400",
        "cluster-ghe-9402",
        # fluent-bit
        "cluster-ghe-24242"
      ].freeze

      PROXY_SERVICES = [
        'proxy-ghe-23',
        'proxy-ghe-81',
        'proxy-ghe-444',
        'proxy-ghe-8081',
        'proxy-ghe-8444',
        'proxy-ghe-9419'
      ].freeze

      def delete_allow_from_ip(ip)
        UFW_APPLICATIONS.each do |item|
          system_log("ufw delete allow from #{ip} to any app #{item}")
        end
      end

      # When adding new ports here, also update the list of ports to
      # check in ghe-cluster-status-nodes
      def allow_from_ip(ip)
        protocol_suffix = "6" if Resolv::IPv6::Regex.match?(ip)

        system_log("ip#{protocol_suffix}tables -C ufw#{protocol_suffix}-before-output -d #{ip} -m owner --uid-owner githook -j REJECT 2> /dev/null || ip#{protocol_suffix}tables -I ufw#{protocol_suffix}-before-output -d #{ip} -m owner --uid-owner githook -j REJECT")
        system_log("ip#{protocol_suffix}tables -C ufw#{protocol_suffix}-before-output -d #{ip} -m owner --uid-owner hookshot -j REJECT 2> /dev/null || ip#{protocol_suffix}tables -I ufw#{protocol_suffix}-before-output -d #{ip} -m owner --uid-owner hookshot -j REJECT")
        system_log("ip#{protocol_suffix}tables -C ufw#{protocol_suffix}-before-output -d #{ip} -m owner --uid-owner hookshot -m state --state ESTABLISHED -j ACCEPT 2> /dev/null || ip#{protocol_suffix}tables -I ufw#{protocol_suffix}-before-output -d #{ip} -m owner --uid-owner hookshot -m state --state ESTABLISHED -j ACCEPT")
        system_log("ip#{protocol_suffix}tables -C ufw#{protocol_suffix}-before-output -d #{ip} -m owner --uid-owner pages -j REJECT 2> /dev/null || ip#{protocol_suffix}tables -I ufw#{protocol_suffix}-before-output -d #{ip} -m owner --uid-owner pages -j REJECT")
        system_log("ip#{protocol_suffix}tables -C ufw#{protocol_suffix}-before-output -d #{ip} -m multiport -p tcp --dports 80,443 -j ACCEPT 2> /dev/null || ip#{protocol_suffix}tables -I ufw#{protocol_suffix}-before-output -d #{ip} -m multiport -p tcp --dports 80,443 -j ACCEPT")

        # Collect the existing UFW rules that are currently already in place
        existing_ufw_rules = gather_existing_rules

        UFW_APPLICATIONS.each do |item|
          ufw_item = UfwRule.new(item, "ALLOW IN", ip)
          if !existing_ufw_rules.empty? && existing_ufw_rules.include?(ufw_item.to_s)
            log("ufw already includes ip: #{ip} rule #{item}. Skipping system call")
          else
            system_log("ufw allow from #{ip} to any app #{item} comment 'GHES'")
          end
        end
      end

      def is_firewall_enabled?
        stdout, stderr, status = Open3.capture3("sudo ufw status")
        if status == 0
          ufw_cmd_output = (stdout || "")
          if ufw_cmd_output.include? "Status: active"
            return true
          end
        end
        log("could not determine if firewall is enabled. Assuming it is not")
        log("stdout: #{stdout}")
        log("stderr: #{stderr}")
        log("status: #{status}")
        false
      end

      def gather_ipv4_rules(ufw_cmd_output)
        ipv4_rules = [] # [[to, action, from, comment], ...]
        ufw_cmd_output.each_line do |line|
          if line.start_with?("[") && !line.include?("(v6)")
            rule = line.strip # [ 1] ghe-1194                   ALLOW IN    Anywhere                  # GHES
            rule = rule.gsub(/\s+/m, " ").strip # [ 1] ghe-1194 ALLOW IN Anywhere # GHES
            rule = rule.gsub(/\[\s*\d+\]/, "").strip # ghe-1194 ALLOW IN Anywhere # GHES
            rule_parts = rule.split(" ") # ["ghe-1194", "ALLOW", "IN", "Anywhere", "#", "GHES"]

            rule_to = rule_parts[0] # ghe-1194
            rule_action = rule_parts[1..2].join(" ") # ALLOW IN
            rule_from = rule_parts[3] # Anywhere

            # only look for a comment if there is a # in the rule
            rule_comment = "" # ""
            if rule_parts.include?("#")
              rule_comment = rule_parts.slice(rule_parts.index("#")..-1).join(" ") # # GHES
              rule_comment = rule_comment.gsub("#", "").strip # GHES
            end
            ipv4_rules << [rule_to, rule_action, rule_from, rule_comment]
          end
        end
        return ipv4_rules
      end

      def gather_ipv6_rules(ufw_cmd_output)
        ipv6_rules = [] # [[to, action, from], ...]
        ufw_cmd_output.each_line do |line|
          if line.start_with?("[") && line.include?("(v6)")
            rule = line.strip # [12] ghe-1194 (v6)              ALLOW IN    Anywhere (v6)
            rule = rule.gsub(/\s+/m, " ").strip # [12] ghe-1194 (v6) ALLOW IN Anywhere (v6)
            rule = rule.gsub(/\[\s*\d+\]/, "").strip # ghe-1194 (v6) ALLOW IN Anywhere (v6)
            rule_parts = rule.split(" ") # ["ghe-1194", "(v6)", "ALLOW", "IN", "Anywhere", "(v6)"]

            rule_to = rule_parts[0] # ghe-1194
            rule_action = rule_parts[2..3].join(" ") # ALLOW IN
            rule_from = rule_parts[4] # Anywhere

            ipv6_rules << rule
          end
        end
        return ipv6_rules
      end

      def gather_existing_rules(comment = nil)
        # Optionally filter by comment
        # Example comment: GHES

        if !is_firewall_enabled?
          log("ufw status is inactive: no rules to gather")
          return Set.new
        end

        existing_ufw_rules = Set.new
        stdout, stderr, status = Open3.capture3("sudo ufw status numbered")
        # The output of ufw status is a table with 3 columns
        # Example output of `sudo ufw status numbered`:
        # Status: active

        #      To                    Action      From
        #      --                    ------      ----
        # [ 1] ghe-1194              ALLOW IN    Anywhere                  # GHES
        # [ 2] ghe-1155              DENY IN     Anywhere                  # GHES
        # ...

        if status == 0
          ufw_cmd_output = (stdout || "")

          ipv4_rules = gather_ipv4_rules(ufw_cmd_output)

          # We don't need to gather IPv6 rules, because we don't use IPv6
          # ipv6_rules = gather_ipv6_rules(ufw_cmd_output)

          # construct new UfwRules from the gathered rules
          ipv4_rules.each do |rule|
            rule_to = rule[0]
            rule_action = rule[1]
            rule_from = rule[2]
            rule_comment = rule[3]
            ufw = UfwRule.new(rule_to, rule_action, rule_from)

            if comment && rule_comment != comment
              next
            end

            existing_ufw_rules << ufw.to_s
          end

        else # status != 0
          log("could not retrieve existing ufw rules. Proceeding including cluster rules without speedup.")
          log("stdout: #{stdout}")
          log("stderr: #{stderr}")
          log("status: #{status}")
        end

        return existing_ufw_rules
      end

      def allow_proxy_services
        # for each service, run `ufw allow to any app <service> comment 'GHES'`
        # Example: ufw allow to any app proxy-ghe-23 comment 'GHES'

        PROXY_SERVICES.each do |service|
          system_log("ufw allow to any app #{service} comment 'GHES'")
        end
      end

      def disallow_proxy_services
        # for each service, run `ufw delete allow to any app <service>`
        # Example: ufw delete allow to any app proxy-ghe-23

        PROXY_SERVICES.each do |service|
          system_log("ufw delete allow to any app #{service}")
        end
      end

      def cluster_ips
        cluster_ips = Set.new
        cluster_nodes.each do |node|
          if node["ipv4"] && !node["ipv4"].empty? && Resolv::IPv4::Regex.match?(node["ipv4"])
            cluster_ips.add(node["ipv4"])
          end
          if node["ipv6"] && !node["ipv6"].empty?&& Resolv::IPv6::Regex.match?(node["ipv6"])
            cluster_ips.add(node["ipv6"])
          end
        end
        return cluster_ips
      end

      def allow_new_ips
        cluster_ips.each do |ip|
          allow_from_ip(ip)
        end
      end

      def existing_firewall_ips
        ufw_firewall_ips = Set.new
        # Add each IP address to the set of all ufw ips.
        existing_rules = gather_existing_rules("GHES") # We only care about GHES rules
        existing_rules.each do |rule|
          ip_string = rule.delete(" \t\r\n").split(",")[2]
          # The rule can have something other than an IP, so check before adding.
          ufw_firewall_ips.add(ip_string) if (ip_string =~ Resolv::IPv4::Regex) || (ip_string =~ Resolv::IPv6::Regex)
        end
        return ufw_firewall_ips
      end

      def delete_allow_old_ips()
        ufw_firewall_ips = existing_firewall_ips()

        # Subtract the cluster_ips from all the firewall ips should leave us with just the ones to delete
        ufw_ips_to_delete = ufw_firewall_ips - cluster_ips

        # Delete any inactive IPs from ufw
        if ufw_ips_to_delete.size() > 0
          ufw_ips_to_delete.each do |ip|
            delete_allow_from_ip(ip)
          end
        end
      end

      def update_firewall
        if config_value("loadbalancer", "proxy-protocol")
          allow_proxy_services
        else
          disallow_proxy_services
        end
        return if wireguard_enabled?

        allow_new_ips()
        delete_allow_old_ips()
      end
    end
  end
end
