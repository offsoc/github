module WikiCloth
  class SourceExtension < Extension

    # <source lang="language">source code</source>
    #
    element 'source', :skip_html => true, :run_globals => false do |buffer|
      content = buffer.element_content
      content = $1 if content =~ /^\s*\n(.*)$/m
      content = content.gsub('<','&lt;').gsub('>','&gt;')
      lang_attr = if lang = buffer.element_attributes['lang']
                    %Q{lang="#{lang.downcase}"}
                  end

      %Q(<pre #{lang_attr}>#{content}</pre>)
    end

  end
end
