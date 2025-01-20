# frozen_string_literal: true

require "rake/clean"

require "manage"

desc "Generate sample license and package files"
task setup: ["work", "tmp", "tmp/pids", "license.ghl", "unlimited.ghl", "perpetual.ghl", "cluster.ghl", "expired.ghl"]

directory "work"
CLEAN.include "work"

directory "tmp"
directory "tmp/pids"
CLEAN.include "tmp", "tmp/pids"

desc "Generate a test license file"
file "license.ghl" do
  warn "generating license.ghl"
  license = generate_example_license(seats, Time.now + days, license_metadata)
  File.open("license.ghl", "wb") { |f| f << license.to_bin }
end
CLEAN.include "license.ghl"

desc "Generate an unlimited test license file"
file "unlimited.ghl" do
  warn "generating unlimited.ghl"
  license = generate_example_license \
    0, Time.now + (60 * 60 * 24 * 30),
    unlimited_seating: true
  File.open("unlimited.ghl", "wb") { |f| f << license.to_bin }
end
CLEAN.include "unlimited.ghl"

desc "Generate an perpetual test license file"
file "perpetual.ghl" do
  warn "generating perpetual.ghl"
  license = generate_example_license \
    100, Time.now + (60 * 60 * 24 * 30),
    perpetual: true
  File.open("perpetual.ghl", "wb") { |f| f << license.to_bin }
end
CLEAN.include "perpetual.ghl"

desc "Generate an expired license file"
file "expired.ghl" do
  warn "generating expired.ghl"
  license = generate_example_license(seats.to_i, Time.now - days, license_metadata)
  File.open("expired.ghl", "wb") { |f| f << license.to_bin }
end
CLEAN.include "expired.ghl"

desc "Generate an cluster test license file"
file "cluster.ghl" do
  warn "generating cluster.ghl"
  license = generate_example_license \
    100, Time.now + (60 * 60 * 24 * 30),
    cluster_support: true
  File.open("cluster.ghl", "wb") { |f| f << license.to_bin }
end
CLEAN.include "cluster.ghl"

private

def generate_example_license(seats, expire_at, metadata = {})
  customer_sec_key = File.read("examples/customer_sec.gpg")
  customer_pub_key = File.read("examples/customer_pub.gpg")
  license_sec_key  = File.read("examples/license_sec.gpg")
  license_pub_key  = File.read("examples/license_pub.gpg")

  name  = "Test User"
  email = "test@example.com"

  Enterprise::Crypto.customer_vault =
    Enterprise::Crypto::CustomerVault.new(customer_sec_key, customer_pub_key, blank_password: true)

  Enterprise::Crypto.license_vault =
    Enterprise::Crypto::LicenseVault.new(license_sec_key, license_pub_key, blank_password: true)

  customer = Enterprise::Crypto::Customer.generate(name, email)
  license = customer.generate_license(seats, expire_at, support_key, metadata)
end

def license_metadata
  company            = ENV["LICENSE_COMPANY"] || "GitHub"
  ref_number         = ENV["LICENSE_KEY_REFERENCE_NUMBER"] || "deadbeef"
  ssh_access         = !!(ENV["LICENSE_SSH_ACCESS"])
  license_ref_number = ENV["LICENSE_REFERENCE_NUMBER"] || "deadbeef"
  order_ref_number   = ENV["LICENSE_ORDER"] || "deadbeef"
  cluster_support    = !!(ENV["LICENSE_CLUSTER_SUPPORT"])
  advanced_security_enabled = !!(ENV["LICENSE_ADVANCED_SECURITY_ENABLED"])

  {
    reference_number: ref_number,
    order: order_ref_number,
    license: license_ref_number,
    company: company,
    ssh_allowed: ssh_access,
    support_key: support_key,
    cluster_support: cluster_support,
    advanced_security_enabled: advanced_security_enabled
  }
end

def support_key
  false
end

def seats
  (ENV["LICENSE_SEATS"] || 100).to_i
end

def days
  60 * 60 * 24 * (ENV["LICENSE_DAYS"] || 30).to_i
end
