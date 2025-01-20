require "codeowners"
require "codeowners/matcher"
require "benchmark/ips"
require "ruby-prof"
require "set"

codeowners = Codeowners::File.new(File.read("./bench/CODEOWNERS"))
paths = File.read("./bench/diff-paths.txt").split("\n")

for_result = tree_result = graph_result = nil

Benchmark.ips do |x|
  x.report("#for") do
    for_result = codeowners.for(paths)
  end

  x.report("using tree") do
    tree_result = codeowners.for_with_tree(paths)
  end

  x.report("using graph") do
    codeowners.instance_eval { @graph = nil }
    graph_result = codeowners.for_with_graph(paths)
  end

  x.compare!
end

set1 = Set.new(for_result.keys.map(&:identifier))
set2 = Set.new(tree_result.keys.map(&:identifier))
set3 = Set.new(graph_result.keys.map(&:identifier))

if set1 != set2
  $stderr.puts "result sets did not match!"
  tree_results_missing = set1 - set2
  if tree_results_missing.any?
    puts "for_with_tree results are missing:\n  " +
      tree_results_missing.to_a.sort.join("\n  ")
  end
  tree_results_extraneous = set2 - set1
  if tree_results_extraneous.any?
    puts "for_with_tree yielded extra results:\n  " +
      tree_results_extraneous.to_a.sort.join("\n  ")
  end
  exit 1
end

if set1 != set3
  $stderr.puts "result sets did not match!"
  graph_results_missing = set1 - set3
  if graph_results_missing.any?
    puts "graph results are missing:\n  " +
      graph_results_missing.to_a.sort.join("\n  ")
  end
  graph_results_extraneous = set3 - set1
  if graph_results_extraneous.any?
    puts "graph yielded extra results:\n  " +
      graph_results_extraneous.to_a.sort.join("\n  ")
  end
  exit 1
end
