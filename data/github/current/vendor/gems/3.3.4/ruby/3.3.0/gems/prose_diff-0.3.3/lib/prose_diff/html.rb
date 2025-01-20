module ProseDiff

  def html(before_html, after_html, options = {})
    doc = ProseDiff::Diff.new(before_html, after_html, options).document
    doc.css('body').children.to_html
  end

  module_function :html

end