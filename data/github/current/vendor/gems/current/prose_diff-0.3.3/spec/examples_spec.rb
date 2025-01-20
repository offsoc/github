# encoding: utf-8
require 'spec_helper'
require 'timeout'
require 'ruby-prof'

describe 'Example' do
  ProseDiff::Fixture.all.each do |fixture|
    describe fixture.title, :example => fixture.filename do
      options = fixture.options || {}
      fixture.examples.each do |example|
        before_html, after_html = example.before, example.after
        if options[:whitespace] && options[:whitespace] != 'false' && options[:whitespace] != 'no' && options[:whitespace] != ''
          t = ProseDiff::Transformer::WhitespaceAgnostic.new
          bd, ad = Nokogiri::HTML(before_html), Nokogiri::HTML(after_html)
          t.transform_document(bd)
          t.transform_document(ad)
          before_html, after_html = bd.at('body').inner_html(), ad.at('body').inner_html()
        end
        it example.description do
          max_time = (options[:timeout] && options[:timeout].to_f) || 10.0
          if example.pending?
            pending(example.pending_message) do
              begin
                Timeout::timeout(max_time) do
                  actual_diff = ProseDiff.html( before_html, after_html, options )
                  if options[:dump] || example.diff.nil? || example.diff == ''
                    puts nil, example.description, '----------', actual_diff, '----------'
                  else
                    expect(normalize(actual_diff)).to eql(normalize(example.diff))
                  end
                end
              rescue Timeout::Error
                fail "Exceeded maximum allotted time"
              end
            end
          else
            actual_diff = ''
            if options[:profile] && options[:profile] != 'false' && options[:profile] != 'no' && options[:profile] != ''
              result = RubyProf.profile do
                actual_diff = ProseDiff.html( before_html, after_html, options )
              end
              printer_clazz = if options[:profile][0] == options[:profile][0].upcase && RubyProf.const_defined?(options[:profile].to_sym)
                                RubyProf.const_get(options[:profile].to_sym)
                              else
                                RubyProf::FlatPrinter
                              end
              printer = printer_clazz.new(result)
              printer.print(STDOUT, {sort_method: :total_time})
            elsif max_time > 0
              begin
                Timeout::timeout(max_time) do
                  actual_diff = ProseDiff.html( before_html, after_html, options )
                end
              rescue Timeout::Error
                fail "Exceeded maximum allotted time"
              end
            else
              actual_diff = ProseDiff.html( before_html, after_html, options )
            end
            if options[:dump] || normalize(example.diff).nil? || normalize(example.diff) == ''
              puts nil, example.description, '----------', actual_diff, '----------'
            else
              expect(normalize(actual_diff)).to eql(normalize(example.diff))
            end
          end
        end
      end
    end
  end
end
