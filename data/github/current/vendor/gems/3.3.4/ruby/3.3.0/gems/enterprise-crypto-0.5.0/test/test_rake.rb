require 'helper'
require 'rake'
require 'stringio'
load File.expand_path '../../Rakefile', __FILE__

context "Rake::Application" do
  test "license:create" do
    Rake::Task['license:create'].reenable
    RakeIO.input = StringIO.new [
      "Company Name",
      "customer@company.com",
      "10",
      "", # expires at
      "license.ghl"
    ].join("\n")
    RakeIO.output = StringIO.new
    RakeIO.dir = Dir.mktmpdir

    Rake::Task['license:create'].invoke
    assert File.exist?(File.join(RakeIO.dir, 'license.ghl'))
  end
end
