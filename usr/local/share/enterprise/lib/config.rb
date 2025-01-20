# frozen_string_literal: true
require_relative "configapply/configapply.rb"

T0 = Time.now

# config file => array of dependent services
# services are started in order listed
CONFIG_FILES = {
  "/etc/hostname" => ["hostname"],
  "/etc/hosts.dnsmasq" => ["dnsmasq"],
  "/etc/environment" => [],

  "/home/git/.ssh/config" => [],
  "/home/git/.ssh/id_ed25519" => [],
  "/home/git/.ssh/id_ed25519.pub" => [],
  "/home/git/.ssh/authorized_keys" => [],

  "/home/admin/.ssh/config" => [],
  "/home/admin/.ssh/id_ed25519" => [],
  "/home/admin/.ssh/id_ed25519.pub" => [],
  "/home/admin/.ssh/authorized_keys" => [],

  "/etc/cron.d/acme-renew" => [],

  "/etc/github/domain" => ["ssl-certificate"],
  "/etc/nomad-jobs/actions/secrets.json" => [],
  "/etc/nomad-jobs/packages/secrets.json" => [],
  "/etc/nomad-jobs/packages-v2/secrets.json" => [],

  "/etc/haproxy/haproxy-frontend.cfg" => ["haproxy-frontend"],
  "/etc/haproxy/ssl.crt" => %w[haproxy-frontend],
  "/etc/haproxy/ssl.key" => %w[haproxy-frontend],
  "/etc/haproxy/ssl.crt+key" => %w[haproxy-frontend],

  "/etc/logrotate.d/github" => [],
  "/etc/logrotate.d/syslog-ng" => [],
  "/etc/logrotate.d/babeld" => [],

  "/etc/nginx/sites-enabled/github.conf" => ["nginx"],
  "/etc/nginx/sites-enabled/pages.conf" => ["nginx"],
  "/etc/nginx/sites-enabled/pages-storage.conf" => ["nginx"],
  "/etc/nginx/sites-enabled/raw.conf" => ["nginx"],
  "/etc/nginx/sites-enabled/viewscreen.conf" => ["nginx"],
  "/etc/nginx/sites-enabled/notebooks.conf" => ["nginx"],
  "/etc/nginx/sites-enabled/avatars.conf" => ["nginx"],
  "/etc/nginx/sites-enabled/storage.conf" => ["nginx"],
  "/etc/nginx/sites-enabled/gist.conf" => ["nginx"],
  "/etc/nginx/sites-enabled/github_includes/alambic.conf" => ["nginx"],
  "/etc/nginx/sites-enabled/github_includes/enterprise-manage.conf" => ["nginx"],
  "/etc/nginx/sites-enabled/github_includes/gist.conf" => ["nginx"],
  "/etc/nginx/sites-enabled/github_includes/pages.conf" => ["nginx"],
  "/etc/nginx/sites-enabled/github_includes/viewscreen.conf" => ["nginx"],
  "/etc/nginx/sites-enabled/github_includes/notebooks.conf" => ["nginx"],
  "/etc/nginx/acme_challenge_include.conf" => ["nginx"],
  "/etc/nginx/private_mode_server_include.conf" => ["nginx"],
  "/etc/nginx/private_mode_location_include.conf" => ["nginx"],
  "/etc/nginx/pages_fe_include.conf" => ["nginx"],

  "/etc/chrony/chrony.conf" => ["chrony"],
  "/etc/snmp/snmpd.conf" => ["snmpd"],
  "/etc/collectd/conf.d/hostname.conf" => ["collectd"],
  "/var/lib/grafana/dashboards/github-enterprise.json" => [],
  "/etc/collectd/conf.d/cluster_ping.conf" => ["collectd"],
  "/etc/collectd/conf.d/forwarding.conf" => ["collectd"],
  "/etc/collectd/conf.d/mssql.conf" => ["collectd"],
  "/etc/collectd/conf.d/mysql.conf" => ["collectd"],
  "/etc/collectd/conf.d/elasticsearch.conf" => ["collectd"],
  "/etc/collectd/conf.d/memcached.conf" => ["collectd"],
  "/etc/collectd/conf.d/redis.conf" => ["collectd"],
  "/etc/collectd/conf.d/postfix.conf" => ["collectd"],
  "/etc/collectd/conf.d/graphite.conf" => ["collectd"],
  "/etc/collectd/conf.d/network.conf" => ["collectd"],
  "/etc/collectd/conf.d/statsd.conf" => ["collectd"],
  "/etc/collectd/conf.d/wireguard.conf" => ["collectd"],
  "/etc/collectd/conf.d/nomad.conf" => ["collectd"],
  "/etc/collectd/conf.d/minio.conf" => ["collectd"],
  "/etc/collectd/conf.d/spokes.conf" => ["collectd"],
  "/etc/collectd/conf.d/dependency-graph-api.conf" => ["collectd"],
  "/etc/collectd/conf.d/dependency-snapshots-api.conf" => ["collectd"],
  "/etc/collectd/conf.d/token-scanning-service.conf" => ["collectd"],
  "/etc/collectd/conf.d/turboscan.conf" => ["collectd"],
  "/etc/collectd/conf.d/write_prometheus.conf" => ["collectd"],

  "/etc/consul.d/server/config.hcl" => ["consul"],
  "/etc/consul.d/server/acl.hcl" => ["consul"],
  "/etc/consul-replicate.hcl" => ["consul-replicate"],
  "/etc/consul-template.d/config.hcl" => ["consul-template"],
  "/etc/nomad.d/config.hcl" => ["nomad"],
  "/etc/nomad.d/identity" => ["nomad-cleanup-required"],

  "/etc/sysctl.d/90-github-customer.conf" => ["systemd-sysctl"],
  "/etc/syslog-ng/syslog-ng.conf" => ["syslog-ng"],

  "/etc/samplicator.conf" => ["samplicator"],
  "/etc/default/samplicator" => ["samplicator"],

  "/opt/graphite/conf/gunicorn.conf" => ["graphite-web"],
  "/opt/graphite/webapp/graphite/local_settings.py" => ["graphite-web"],

  "/etc/postfix/main.cf" => ["postfix"],
  "/etc/postfix/transport" => ["postfix"],
  "/etc/postfix/vmailbox" => ["postfix"],
  "/etc/postfix/smtp_sasl_password_maps" => ["postfix"],

  "/etc/mysql/conf.d/tuning.cnf" => ["mysql"],
  "/etc/mysql/conf.d/serverid.cnf" => ["mysql"],
  "/etc/elasticsearch/elasticsearch.yml" => ["elasticsearch"],
  "/etc/elasticsearch/log4j2.properties" => ["elasticsearch"],
  "/etc/elasticsearch/jvm.options" => ["elasticsearch"],
  "/etc/redis/redis.conf" => ["redis"],

  "/etc/orchestrator.conf.json" => ["orchestrator"],
  "/etc/profile.d/orchestrator-client.sh" => ["orchestrator"],

  "/etc/telegraf/telegraf.conf" => ["telegraf"],

  "/etc/wireguard/tun0.conf" => ["wireguard"],

  "/etc/udev/rules.d/99-ghe-io-scheduler.rules" => [],

  "/etc/enterprise-manage/internal-api-key.checksum" => ["enterprise-manage"],

  "/etc/cluster/cluster.conf.checksum" => ["ghes-manage-gateway"],
  "/etc/ghes-manage-gateway/hostname.checksum" => ["ghes-manage-gateway"],
  "/etc/ghes-manage-agent/hmac-key.checksum" => ["ghes-manage-agent"],
  "/etc/ghes-manage-gateway/mysql-password.checksum" => ["ghes-manage-gateway"],

  ## render configapply.json last as it might have dependencies on previous files
  "/etc/github/configapply.json" => [],

  "/lib/systemd/system/cluster-rebalance.service" => [],
  "/lib/systemd/system/cluster-rebalance.timer" => [],
}.freeze

EAP_SERVICES  = %w[].freeze

BASE_SERVICES = %w[
  chrony
  collectd
  consul
  dnsmasq
  docker
  hostname
  nomad
  ssl-certificate
  syslog-ng
  systemd-sysctl
].freeze

FAKE_SERVICES = %w[
  hostname
  ssl-certificate
].freeze

SYS_SYSTEMD_SERVICES = %w[
  enterprise-manage
  ghes-manage-agent
  ghes-manage-gateway
  ghes-manage-gateway-consul
  nomad-jobs
  numad
  wireguard
  fluent-bit
].freeze

SYS_NOMAD_SERVICES = %w[
  haproxy-frontend
  haproxy-cluster-proxy
  haproxy-data-proxy
  alambic
  consul-template
  elasticsearch
  graphite-web
  kafka-lite
  mysql
  nes
  postfix
  redis
  nginx
  telegraf
]

# This group is for containerized services, no longer in
# CONFIG_FILES, above, that need to remain in APP_SERVICES.
# If the service is in SERVICE_SOCKETS below, and also
# in a container, it needs to be here.
APP_NOMAD_SERVICES = %w[
  alambic
  alive
  authnd
  authzd
  babeld
  codeload
  github-ernicorn
  github-gitauth
  github-resqued
  github-timerd
  github-unicorn
  grafana
  graphite-web
  hookshot-go
  kredz
  kredz-hydro-consumer
  kredz-varz
  lfs-server
  mail-replies
  notebooks
  treelights
  viewscreen
]

CLUSTER_SERVICES = %w[].freeze

TOGGLE_SERVICES = %w[snmpd].freeze

# Services in the "right side" of CONFIG_FILES are included in ALL_SERVICES
CONFIG_FILE_SERVICES = CONFIG_FILES.values.flatten

ALL_SYSTEMD_SERVICES = (CONFIG_FILE_SERVICES + SYS_SYSTEMD_SERVICES + BASE_SERVICES + CLUSTER_SERVICES + TOGGLE_SERVICES - SYS_NOMAD_SERVICES - FAKE_SERVICES).uniq

ALL_SERVICES = ALL_SYSTEMD_SERVICES + APP_NOMAD_SERVICES + SYS_NOMAD_SERVICES

APP_SERVICES = ALL_SERVICES - SYS_SYSTEMD_SERVICES - SYS_NOMAD_SERVICES - BASE_SERVICES - CLUSTER_SERVICES - TOGGLE_SERVICES

SYS_SERVICES = SYS_SYSTEMD_SERVICES + SYS_NOMAD_SERVICES

APP_SYSTEMD_SERVICES = APP_SERVICES - APP_NOMAD_SERVICES

DNA_ALIASES = { "snmpd" => "snmp" }.freeze

SERVICES_MAP = JSON.parse(File.read("/usr/local/share/enterprise/services_map.json"))

NOMAD_ROLES = ["mssql-server", "actions-server", "launch-server"]

# service => socket that needs to be connectable signaling the service started
SYSTEMD_SERVICE_SOCKETS = {
}.freeze

NOMAD_SERVICE_SOCKETS = {
  "github-unicorn" => "127.0.0.1:4327",
  "github-gitauth" => "127.0.0.1:4328",
  "graphite-web" => "127.0.0.1:8000"
}.freeze

HOTRELOAD_SERVICES = %w[
  wireguard
].freeze

# These services don't have an [Install] section so we shouldn't
# try to `systemctl enable` or `systemctl disable` them
NO_INSTALL_SERVICES = %w[
  systemd-sysctl
].freeze

BOOT_PAGES = {
  "github-unicorn" => "/data/github/current/public/index.html"
}.freeze

# Everything is measured in kilobytes so hence this factor
GIGABYTE = 1024 * 1024
MEGABYTE = 1024

# main is run from `update-system-config`
def main
  # the exception is handled by the calling update-system-config script, but we
  # intercept here to ensure that shutdown is called to flush the trace
  begin
    run = Enterprise::ConfigApply::Run.new

    # write status json on start with an exit_status of nil/NULL while starting/in-progress
    run.write_config_apply_status_file(exit_status: nil)

    run.instrumentation_init
    run.main
  rescue ConfigApplyException => e
    # handling this exception explicitly as we want to pass it through without modification
    # (since ConfigApplyException inherits from StandardError)
    raise e
  rescue StandardError => e
    raise ConfigApplyException.new(e.message, exit_status: 1)
  rescue SystemExit => e
    raise ConfigApplyException.new(e.message, exit_status: e.status)
  ensure
    # write status json on completion with the failure or success(default) error code
    if $!
      exit_status = $!.respond_to?(:exit_status) ? $!.exit_status : 1
      run.write_config_apply_status_file(exit_status: exit_status, failure_message: $!, backtrace: $!.backtrace)
    else
      run.write_config_apply_status_file
    end

    run.tracer_provider.shutdown unless run.tracer_provider.nil?
  end
end
