#include "string_buffer.h"
#include "attribute.h"
#include "goomba.h"
#include "goomba_css.h"
#include "goomba_css_helpers.h"
#include "util.h"

VALUE rb_cDocument;
VALUE rb_cDocumentFragment;
VALUE rb_cNode;
VALUE rb_cTextNode;
VALUE rb_cCommentNode;
VALUE rb_cElementNode;

ID g_id_stats;
ID g_id_call;
ID g_id_html;
ID g_id_selector;
ID g_id_halt_further_filters;

/*
 * Max node nesting when parsing HTML documents;
 * matches Nokogiri's/libXML's behavior
 */
#define MAX_DOM_DEPTH 256

GumboOptions g_GoombaDefaultOptions = {8, false, 0, MAX_DOM_DEPTH};

VALUE goomba_node_alloc(VALUE klass, VALUE rb_document, GumboNode *node)
{
	VALUE rb_node = Data_Wrap_Struct(klass, NULL, NULL, node);
	rb_iv_set(rb_node, "@document", rb_document);
	return rb_node;
}

static void goomba_free_document(GoombaDocument *document)
{
    gumbo_destroy_output(document->output);
    xfree((void *)document->buffer);
    xfree(document);
}

static GumboOutput *goomba_parse_fragment(const char *buf, size_t len, GumboTag fragment_ctx)
{
	GumboOptions options = {
		8, /* tab_stop */
		false, /* stop_on_first_error */
		0, /* max errors */
		fragment_ctx, /* fragment_context */
		GUMBO_NAMESPACE_HTML, /* fragment_namespace */
		MAX_DOM_DEPTH /* max_dom_depth */
	};


	return gumbo_parse_with_options(&options, buf, len);
}

VALUE goomba_parse_to_rb(VALUE klass, VALUE rb_text, GumboTag fragment_ctx)
{
    size_t len = RSTRING_LEN(rb_text);
    char *buf = xmalloc(len);
    if (buf)
        memcpy(buf, RSTRING_PTR(rb_text), len);

	GoombaDocument *document = NULL;

	VALUE rb_document = Data_Make_Struct(klass, GoombaDocument,
		NULL, goomba_free_document, document);
        document->output = NULL;
        document->buffer = buf;

	GumboOutput *output = goomba_parse_fragment(buf, len, fragment_ctx);

        document->output = output;

        return rb_document;
}

VALUE goomba_node_to_rb(VALUE rb_document, GumboNode *node)
{
	switch (node->type) {
	case GUMBO_NODE_DOCUMENT:
		rb_raise(rb_eRuntimeError, "unexpected Document node");
		break;

	case GUMBO_NODE_ELEMENT:
	case GUMBO_NODE_TEMPLATE:
	{
		GumboElement *element = &node->v.element;
		VALUE rb_element = goomba_node_alloc(rb_cElementNode, rb_document, node);
		rb_iv_set(rb_element, "@tag", goomba_tag_to_rb(element->tag));
		return rb_element;
	}

	case GUMBO_NODE_TEXT:
	case GUMBO_NODE_WHITESPACE:
	case GUMBO_NODE_CDATA:
		return goomba_node_alloc(rb_cTextNode, rb_document, node);

	case GUMBO_NODE_COMMENT:
		return goomba_node_alloc(rb_cCommentNode, rb_document, node);

	default:
		rb_raise(rb_eRuntimeError, "unimplemented");
	}
}

static VALUE
goomba_children_to_rb(VALUE rb_document, GumboNode *node)
{
	assert(node->type == GUMBO_NODE_ELEMENT || node->type == GUMBO_NODE_TEMPLATE);

	if (node->type == GUMBO_NODE_TEMPLATE) {
		return rb_ary_new();
	} else {
		GumboVector *children = &node->v.element.children;
		VALUE rb_fragment = rb_ary_new_capa((long)children->length);
		unsigned int x;

		for (x = 0; x < children->length; ++x)
			rb_ary_push(rb_fragment, goomba_node_to_rb(rb_document, children->data[x]));

		return rb_fragment;
	}
}

static void
goomba_node_text_content(GumboStringBuffer *out, GumboNode *node)
{
	switch (node->type) {
	case GUMBO_NODE_ELEMENT:
	{
		GumboVector *children = &node->v.element.children;
		unsigned int x;
		for (x = 0; x < children->length; ++x)
			goomba_node_text_content(out, children->data[x]);
		break;
	}

	case GUMBO_NODE_WHITESPACE:
	case GUMBO_NODE_TEXT:
	case GUMBO_NODE_CDATA:
		strbuf_puts(out, node->v.text.text);
		break;

	default:
		break;
	}
}

static VALUE
rb_goomba_parse_and_sanitize(int argc, VALUE *argv, VALUE klass, GumboTag fragment_ctx)
{
	VALUE rb_text, rb_sanitizer, rb_fragment, rb_stats = Qnil, rb_opts;
	int gather_stats = 0;
	double begin;

	rb_scan_args(argc, argv, "11:", &rb_text, &rb_sanitizer, &rb_opts);

	if (!NIL_P(rb_opts)) {
		gather_stats = RTEST(rb_hash_lookup(rb_opts, CSTR2SYM("gather_stats")));
	}

	goomba_strcheck(rb_text);
	begin = goomba_get_ms();
	rb_fragment = goomba_parse_to_rb(klass, rb_text, fragment_ctx);

	if (gather_stats) {
		rb_stats = rb_ary_new();
		rb_ivar_set(rb_fragment, g_id_stats, rb_stats);
		goomba_stats(rb_stats, "Document#parse", 1, goomba_get_ms() - begin);
	}

	if (!NIL_P(rb_sanitizer)) {
		GoombaSanitizer *sanitizer = NULL;

		if (!rb_obj_is_kind_of(rb_sanitizer, rb_cSanitizer))
			rb_raise(rb_eTypeError, "expected a Goomba::Sanitizer instance");

		GumboOutput *output = document_get_output(rb_fragment);
		Data_Get_Struct(rb_sanitizer, GoombaSanitizer, sanitizer);

		begin = goomba_get_ms();

		if (fragment_ctx == GUMBO_TAG_LAST) {
			goomba_node_sanitize(sanitizer, output->document);
		} else {
			goomba_node_sanitize(sanitizer, output->root);
		}

		if (gather_stats)
			goomba_stats(rb_stats, "Document#sanitize", 1, goomba_get_ms() - begin);
	}
	return rb_fragment;
}

static VALUE
rb_goomba_doc_parse(int argc, VALUE *argv, VALUE klass)
{
	return rb_goomba_parse_and_sanitize(argc, argv, klass, GUMBO_TAG_LAST);
}

static VALUE
rb_goomba_doc_fragment_parse(int argc, VALUE *argv, VALUE klass)
{
	return rb_goomba_parse_and_sanitize(argc, argv, klass, GUMBO_TAG_DIV);
}

static VALUE
rb_goomba_doc_root(VALUE rb_self)
{
        GumboOutput *output = document_get_output(rb_self);
	return goomba_node_to_rb(rb_self, output->root);
}

static VALUE
rb_goomba_doc_fragment_children_load(VALUE rb_self)
{
        GumboOutput *output = document_get_output(rb_self);
	return goomba_children_to_rb(rb_self, output->root);
}

static VALUE
rb_goomba_element_to_html(VALUE rb_self)
{
	GumboStringBuffer out;
	GumboNode *node;

	Data_Get_Struct(rb_self, GumboNode, node);
	strbuf_init(&out);
	goomba_node_serialize(&out, node);

	return strbuf_to_rb(&out, true);
}

static VALUE
rb_goomba_element_to_s(VALUE rb_self)
{
	GumboStringBuffer out;
	GumboNode *node;

	Data_Get_Struct(rb_self, GumboNode, node);
	strbuf_init(&out);
	goomba_element_to_s(&out, &node->v.element);

	return strbuf_to_rb(&out, true);
}

static VALUE
rb_goomba_element_inner_html(VALUE rb_self)
{
	GumboStringBuffer out;
	GumboNode *node;
	GumboVector *children;
	unsigned int x;

	Data_Get_Struct(rb_self, GumboNode, node);
	strbuf_init(&out);

	children = &node->v.element.children;
	for (x = 0; x < children->length; ++x)
		goomba_node_serialize(&out, children->data[x]);

	return strbuf_to_rb(&out, true);
}

static VALUE
rb_goomba_element_text_content(VALUE rb_self)
{
	GumboStringBuffer out;
	GumboNode *node;
	Data_Get_Struct(rb_self, GumboNode, node);
	strbuf_init(&out);
	goomba_node_text_content(&out, node);
	return strbuf_to_rb(&out, true);
}

static VALUE
rb_goomba_text_content(VALUE rb_self)
{
	GumboNode *node;
	Data_Get_Struct(rb_self, GumboNode, node);
	return rb_enc_str_new_cstr(node->v.text.text, rb_utf8_encoding());
}

static VALUE
rb_goomba_text_to_html(VALUE rb_self)
{
	VALUE rb_html = rb_attr_get(rb_self, g_id_html);

	if (NIL_P(rb_html)) {
		GumboStringBuffer out;
		GumboNode *node;

		Data_Get_Struct(rb_self, GumboNode, node);
		strbuf_init(&out);
		goomba_escape_html(&out, node->v.text.text, strlen(node->v.text.text), false);

		rb_html = strbuf_to_rb(&out, true);
		rb_ivar_set(rb_self, g_id_html, rb_html);
	}
	return rb_html;
}

static VALUE
rb_goomba_element_attr_get(VALUE rb_self, VALUE rb_key)
{
	GumboNode *node;
	GumboVector *attributes;
	GumboAttribute *attr;

	Data_Get_Struct(rb_self, GumboNode, node);
	attributes = &node->v.element.attributes;

	attr = gumbo_get_attribute(attributes, StringValueCStr(rb_key));
	if (!attr)
		return Qnil;
	return rb_enc_str_new_cstr(attr->value, rb_utf8_encoding());
}

static VALUE
rb_goomba_element_attr_set(VALUE rb_self, VALUE rb_key, VALUE rb_value)
{
	GumboNode *node;
	Data_Get_Struct(rb_self, GumboNode, node);
	gumbo_element_set_attribute(&node->v.element,
		StringValueCStr(rb_key),
		StringValueCStr(rb_value));
	return rb_value;
}

static VALUE
rb_goomba_element_attr_remove(VALUE rb_self, VALUE rb_key)
{
	GumboNode *node;
	Data_Get_Struct(rb_self, GumboNode, node);
	gumbo_element_remove_attribute(&node->v.element, StringValueCStr(rb_key));
	return Qnil;
}

static VALUE
rb_goomba_element_attributes(VALUE rb_self)
{
	GumboNode *node;
	GumboVector *attributes;
	GumboAttribute *attr;
	VALUE result;

	Data_Get_Struct(rb_self, GumboNode, node);
	attributes = &node->v.element.attributes;
	result = rb_hash_new();

	for (int i = 0; i < attributes->length; ++i) {
		attr = attributes->data[i];
		rb_hash_aset(result, rb_enc_str_new_cstr(attr->name, rb_utf8_encoding()), rb_enc_str_new_cstr(attr->value, rb_utf8_encoding()));
	}

	return result;
}

static VALUE
rb_goomba_element_children_load(VALUE rb_self)
{
	GumboNode *node;
	Data_Get_Struct(rb_self, GumboNode, node);

	return goomba_children_to_rb(rb_iv_get(rb_self, "@document"), node);
}

static VALUE
rb_goomba_name_map(VALUE rb_self)
{
	return rb_goomba_find_names(rb_self, true);
}

static VALUE
rb_goomba_name_set(VALUE rb_self)
{
	return rb_goomba_find_names(rb_self, false);
}

static GumboNode *parent_element(GumboNode *child)
{
	return child->parent && is_element(child->parent) ?
		child->parent : NULL;
}

static VALUE
rb_goomba_node_parent(VALUE rb_self)
{
	GumboNode *node, *parent;
	Data_Get_Struct(rb_self, GumboNode, node);
	parent = parent_element(node);

	if (!parent)
		return Qnil;

	return goomba_node_to_rb(
		rb_iv_get(rb_self, "@document"), parent);
}

static VALUE
rb_goomba_node_previous_sibling(VALUE rb_self)
{
	GumboNode *node, *parent, *sibling;
	Data_Get_Struct(rb_self, GumboNode, node);
	parent = parent_element(node);

	if (!parent || node->index_within_parent == 0)
		return Qnil;

	sibling = parent->v.element.children.data[node->index_within_parent - 1];
	return goomba_node_to_rb(rb_iv_get(rb_self, "@document"), sibling);
}

static VALUE
rb_goomba_node_next_sibling(VALUE rb_self)
{
	GumboNode *node, *parent, *sibling;
	Data_Get_Struct(rb_self, GumboNode, node);
	parent = parent_element(node);

	if (!parent || node->index_within_parent == parent->v.element.children.length - 1)
		return Qnil;

	sibling = parent->v.element.children.data[node->index_within_parent + 1];
	return goomba_node_to_rb(rb_iv_get(rb_self, "@document"), sibling);
}

static VALUE
rb_goomba_node_eq(VALUE rb_self, VALUE rb_other)
{
	return (rb_type(rb_other) == T_DATA &&
			DATA_PTR(rb_other) == DATA_PTR(rb_self)) ?
		Qtrue : Qfalse;
}

static VALUE
rb_goomba_node_hash(VALUE rb_self)
{
	return INT2NUM((uintptr_t)DATA_PTR(rb_self));
}

static VALUE
rb_goomba_node_index_within_parent(VALUE rb_self)
{
	GumboNode *node;
	Data_Get_Struct(rb_self, GumboNode, node);

	return parent_element(node) ?
		INT2FIX(node->index_within_parent) :
		Qnil;
}

static VALUE
rb_goomba_node_is_last_child(VALUE rb_self)
{
	GumboNode *node, *parent;
	Data_Get_Struct(rb_self, GumboNode, node);
	parent = parent_element(node);

	return (parent &&
		node->index_within_parent == parent->v.element.children.length - 1) ?
		Qtrue : Qfalse;
}

static VALUE
rb_goomba_node_nth_ancestor_is(VALUE rb_self, VALUE rb_nth, VALUE rb_tag)
{
	GumboNode *node, *ancestor = NULL;
	GumboTag ancestor_tag = GUMBO_TAG_LAST;
	GoombaSanitizer *sanitizer;
	int n;
	Data_Get_Struct(rb_self, GumboNode, node);
	Data_Get_Struct(rb_self, GoombaSanitizer, sanitizer);

	Check_Type(rb_nth, T_FIXNUM);
	switch (rb_type(rb_tag)) {
	case T_SYMBOL:
	case T_STRING:
		ancestor_tag = goomba_tag_from_rb(sanitizer, rb_tag);
		break;

	case T_DATA:
		if (rb_obj_is_kind_of(rb_tag, rb_cElementNode)) {
			Data_Get_Struct(rb_tag, GumboNode, ancestor);
			break;
		}
		/* fall through */
	default:
		return Qfalse;
	}

	n = FIX2INT(rb_nth);
	while (n--) {
		node = node->parent;
		if (!node || node->type != GUMBO_NODE_ELEMENT)
			return Qfalse;
	}

	return (node == ancestor || node->v.element.tag == ancestor_tag) ?
		Qtrue : Qfalse;
}

static VALUE rb_goomba_node_matches(VALUE rb_self, VALUE rb_selector)
{
	GumboNode *node;
	Data_Get_Struct(rb_self, GumboNode, node);
	rb_selector = rb_goomba_selector_coerce(rb_selector);
	return goomba_selector_match(DATA_PTR(rb_selector), node) ?
		Qtrue : Qfalse;
}

void Init_goomba_document(void)
{
	g_id_stats = rb_intern("@__stats__");
	g_id_call = rb_intern("call");
	g_id_html = rb_intern("html");
	g_id_selector = rb_intern("selector");
	g_id_halt_further_filters = rb_intern("halt_further_filters?");

	rb_cDocument = rb_define_class_under(rb_mGoomba, "Document", rb_cObject);
	rb_undef_alloc_func(rb_cDocument);
	rb_define_singleton_method(rb_cDocument, "new", rb_goomba_doc_parse, -1);
	rb_define_method(rb_cDocument, "root", rb_goomba_doc_root, 0);
	rb_define_method(rb_cDocument, "select", rb_goomba_select, 1);
	rb_define_method(rb_cDocument, "name_map", rb_goomba_name_map, 0);
	rb_define_method(rb_cDocument, "name_set", rb_goomba_name_set, 0);

	rb_cDocumentFragment = rb_define_class_under(rb_mGoomba, "DocumentFragment", rb_cObject);
	rb_undef_alloc_func(rb_cDocumentFragment);
	rb_define_singleton_method(rb_cDocumentFragment, "new", rb_goomba_doc_fragment_parse, -1);
	rb_define_method(rb_cDocumentFragment, "children!", rb_goomba_doc_fragment_children_load, 0);
	rb_define_method(rb_cDocumentFragment, "select", rb_goomba_select, 1);
	rb_define_method(rb_cDocumentFragment, "name_map", rb_goomba_name_map, 0);
	rb_define_method(rb_cDocumentFragment, "name_set", rb_goomba_name_set, 0);

	rb_cNode = rb_define_class_under(rb_mGoomba, "Node", rb_cObject);
	rb_undef_alloc_func(rb_cNode);
	rb_define_method(rb_cNode, "index_within_parent", rb_goomba_node_index_within_parent, 0);
	rb_define_method(rb_cNode, "last_child?", rb_goomba_node_is_last_child, 0);
	rb_define_method(rb_cNode, "nth_ancestor_is?", rb_goomba_node_nth_ancestor_is, 2);
	rb_define_method(rb_cNode, "parent", rb_goomba_node_parent, 0);
	rb_define_method(rb_cNode, "previous_sibling", rb_goomba_node_previous_sibling, 0);
	rb_define_method(rb_cNode, "next_sibling", rb_goomba_node_next_sibling, 0);
	rb_define_method(rb_cNode, "==", rb_goomba_node_eq, 1);
	rb_define_method(rb_cNode, "eql?", rb_goomba_node_eq, 1);
	rb_define_method(rb_cNode, "hash", rb_goomba_node_hash, 0);
	rb_define_method(rb_cNode, "=~", rb_goomba_node_matches, 1);
	rb_define_method(rb_cNode, "matches", rb_goomba_node_matches, 1);

	rb_cTextNode = rb_define_class_under(rb_mGoomba, "TextNode", rb_cNode);
	rb_undef_alloc_func(rb_cTextNode);
	rb_define_method(rb_cTextNode, "text_content", rb_goomba_text_content, 0);
	rb_define_method(rb_cTextNode, "to_html", rb_goomba_text_to_html, 0);
	rb_define_method(rb_cTextNode, "inner_html", rb_goomba_text_to_html, 0);

	rb_cCommentNode = rb_define_class_under(rb_mGoomba, "CommentNode", rb_cNode);
	rb_undef_alloc_func(rb_cTextNode);
	rb_define_method(rb_cCommentNode, "text_content", rb_goomba_text_content, 0);

	rb_cElementNode = rb_define_class_under(rb_mGoomba, "ElementNode", rb_cNode);
	rb_undef_alloc_func(rb_cElementNode);
	rb_define_method(rb_cElementNode, "[]", rb_goomba_element_attr_get, 1);
	rb_define_method(rb_cElementNode, "[]=", rb_goomba_element_attr_set, 2);
	rb_define_method(rb_cElementNode, "remove_attribute", rb_goomba_element_attr_remove, 1);
	rb_define_method(rb_cElementNode, "attributes", rb_goomba_element_attributes, 0);
	rb_define_method(rb_cElementNode, "children!", rb_goomba_element_children_load, 0);
	rb_define_method(rb_cElementNode, "text_content", rb_goomba_element_text_content, 0);
	rb_define_method(rb_cElementNode, "to_html", rb_goomba_element_to_html, 0);
	rb_define_method(rb_cElementNode, "to_s", rb_goomba_element_to_s, 0);
	rb_define_method(rb_cElementNode, "inner_html", rb_goomba_element_inner_html, 0);
	rb_define_method(rb_cElementNode, "select", rb_goomba_select, 1);
}
