module Hydro
  # gRPC generated service files expect Protobuf generated files to be in the
  # load path without prefixes.
  def self.with_generated_files(&block)
    $LOAD_PATH.unshift(File.expand_path("../../generated", __FILE__))
    yield
    $LOAD_PATH.shift
  end
end
