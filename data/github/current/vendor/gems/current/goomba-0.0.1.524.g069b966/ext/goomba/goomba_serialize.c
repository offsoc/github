#include "goomba.h"
#include "goomba_css.h"
#include "goomba_tag_helper.h"
#include "util.h"

static VALUE rb_cSerializer;

enum {
	BEFORE_BEGIN = 0,
	AFTER_BEGIN = 1,
	BEFORE_END = 2,
	AFTER_END = 3
};

typedef struct {
	VALUE rb_result;
} GoombaReplace;

typedef struct {
	VALUE rb_filter;
	VALUE rb_selector;
	bool halt_further_filters;
	int filter_matches;
	int total_calls;
	double total_elapsed;
} Filter;

typedef struct {
	Filter *filters;
	long filter_count;
	VALUE rb_document;
	VALUE rb_current_text;
	GumboStringBuffer current_text;
	GumboStringBuffer out;
	double total_elapsed;
} GoombaSerializer;

static void
serialize_node(GumboStringBuffer *out, GoombaSerializer *serial, long n, GumboNode *node);

static GumboTag
fragment_context_for_node(GoombaSerializer *serial, GumboNode *node)
{
	assert(serial);

	if (node->parent && node->parent->type == GUMBO_NODE_DOCUMENT) {
		GumboOutput *document = document_get_output(serial->rb_document);
		if (document->fragment_context != GUMBO_TAG_LAST)
			return document->fragment_context;
	}
	return node->v.element.tag;
}

void
goomba_escape_html(GumboStringBuffer *out, const char *src,
	long size, bool in_attribute)
{
	static const char HTML_ESCAPE_TABLE[] = {
		0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
		0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
		0, 0, 1, 0, 0, 0, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0,
		0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 3, 0, 4, 0,
		0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
		0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
		0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
		0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
		0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
		0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
		0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
		0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
		0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
		0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
		0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
		0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
	};

	static const char *HTML_ESCAPES[] = {
		"",
		"&quot;",
		"&amp;",
		"&lt;",
		"&gt;"
	};

	long i = 0, org, esc = 0;
	const uint8_t *keys = (const uint8_t *)src;

	for (i = 0; i < size; ++i) {
		org = i;
		while (i < size && (esc = HTML_ESCAPE_TABLE[(int)keys[i]]) == 0)
			i++;

		if (i > org)
			strbuf_put(out, src + org, i - org);

		/* escaping */
		if (unlikely(i >= size))
			break;

		/*
		 * SPEC: The standard says that '"' should not be
		 * escaped unless inside an attribute
		 */
		if (!in_attribute && keys[i] == '"') {
			strbuf_put(out, "\"", 1);
			continue;
		}

		strbuf_puts(out, HTML_ESCAPES[esc]);
	}
}


static void
goomba_tag_name_serialize(GumboStringBuffer *out, GumboElement *element)
{
	assert(element->tag <= GUMBO_TAG_LAST);

	if (element->tag == GUMBO_TAG_UNKNOWN) {
		/*
		 * Gumbo's tokenizer lowercases tag names but then throws them
		 * away. If they were preserved we wouldn't have to do our own
		 * lowercasing here.
		 */

		unsigned int x;
		GumboStringPiece tag_name = element->original_tag;
		gumbo_tag_from_original_text(&tag_name);

		gumbo_string_buffer_reserve(out->length + tag_name.length, out);
		for (x = 0; x < tag_name.length; ++x)
			out->data[out->length + x] = gumbo_tolower(tag_name.data[x]);
		out->length += tag_name.length;
	} else {
		strbuf_puts(out, gumbo_normalized_tagname(element->tag));
	}
}

static void
goomba_start_tag_serialize(GumboStringBuffer *out, GumboElement *element)
{
	GumboVector *attributes = &element->attributes;
	unsigned int x;

	strbuf_put(out, "<", 1);
	goomba_tag_name_serialize(out, element);

	for (x = 0; x < attributes->length; ++x) {
		GumboAttribute *attr = attributes->data[x];

		strbuf_putv(out, 3, " ", attr->name, "=\"");
		goomba_escape_html(out, attr->value, strlen(attr->value), true);
		strbuf_put(out, "\"", 1);
	}

	strbuf_put(out, ">", 1);
}

static VALUE
update_current_text(GoombaSerializer *serial, GumboNode *node)
{
	GumboStringBuffer *escaped_text = &serial->current_text;
	VALUE rb_text = serial->rb_current_text;

	strbuf_clear(escaped_text);
	goomba_escape_html(escaped_text, node->v.text.text, strlen(node->v.text.text), false);

	DATA_PTR(rb_text) = node;
	rb_ivar_set(rb_text, g_id_html, strbuf_to_rb(escaped_text, false));

	return rb_text;
}

static inline bool
filter_matches(const Filter *f, GumboNode *node, int match)
{
	if ((f->filter_matches & match) == 0)
		return false;

	if (!NIL_P(f->rb_selector))
		return goomba_selector_match(DATA_PTR(f->rb_selector), node);

	return true;
}

static void
check_replace_result(GoombaReplace *replace, VALUE rb_result);

static void
serialize_replacement_node(GumboStringBuffer *out, GoombaSerializer *serial, long n,
	GumboNode *node, bool apply_filters);

static void
process_text_node_1(GumboStringBuffer *out, GoombaSerializer *serial,
	long n, GumboNode *node, GumboNode *parent)
{
	Filter *filters = serial->filters;
	const long filter_count = serial->filter_count;

	VALUE rb_result = Qnil;
	VALUE rb_node = update_current_text(serial, node);
	GoombaReplace replace = {rb_node};
	GumboOutput *replace_with_fragment = NULL;
	VALUE rb_result_class;

	for (; n < filter_count; ++n) {
		Filter *f = &filters[n];
		if (filter_matches(f, node, MATCHES_TEXT)) {
			double begin = goomba_get_ms();
			rb_result = rb_funcall(f->rb_filter, g_id_call, 1, rb_node);
			f->total_elapsed += (goomba_get_ms() - begin);
			f->total_calls++;
			check_replace_result(&replace, rb_result);
			if (replace.rb_result != rb_node)
				break;
		}
	}

	if (n == filter_count) {
		strbuf_put(out,
			serial->current_text.data,
			serial->current_text.length);
		return;
	}

	if (replace.rb_result == Qfalse)
		return;

	if (rb_type(replace.rb_result) == T_STRING) {
		goomba_strcheck(replace.rb_result);
		replace.rb_result = goomba_parse_to_rb(
			rb_cDocumentFragment, replace.rb_result,
			fragment_context_for_node(serial, node->parent));
	}

	Check_Type(replace.rb_result, T_DATA);
	rb_result_class = rb_class_of(replace.rb_result);

	/*
	 * Otherwise, check if we got a new Node object,
	 * or a whole document fragment
	 */
	if (rb_result_class == rb_cElementNode || rb_result_class == rb_cTextNode) {
		node = DATA_PTR(replace.rb_result);
	} else if (rb_result_class == rb_cDocumentFragment) {
		replace_with_fragment = document_get_output(replace.rb_result);
	} else {
		rb_raise(rb_eTypeError,
				"Expected a String, Node, or DocumentFragment as replacement "
				"for the existing node");
	}

	/*
	 * Iterate through the returned fragment and apply the remaining filters
	 * to each chunk of text in it
	 */
	if (replace_with_fragment) {
		unsigned int i;
		GumboVector *children = &replace_with_fragment->root->v.element.children;

		for (i = 0; i < children->length; ++i) {
			GumboNode *child = children->data[i];
			if (child->type == GUMBO_NODE_TEXT) {
				process_text_node_1(out, serial, n + 1, child, parent);
			} else {
				/*
				 * TODO: as a design decision, we're not recursing with the
				 * filters on the chunks of HTML returned by this
				 * text filter. We may want to change this in the future
				 */
				serialize_node(out, NULL, 0, child);
			}
		}
	} else {
		serialize_replacement_node(out, serial, 0, node, false);
	}
}

static void
process_text_node(GumboStringBuffer *out, GoombaSerializer *serial, GumboNode *node)
{
	process_text_node_1(out, serial, 0, node, node->parent);
}

static void
check_replace_result_1(GoombaReplace *replace, VALUE rb_result)
{
	switch (rb_type(rb_result)) {
	case T_NIL:
		break;

	case T_FALSE:
		replace->rb_result = Qfalse;
		break;

	case T_STRING:
	case T_DATA:
		replace->rb_result = rb_result;
		break;

	default:
		rb_raise(rb_eTypeError,
			"expected a String, DocumentFragment or Element");
	}
}

static void
check_replace_result(GoombaReplace *replace, VALUE rb_result)
{
	switch (rb_type(rb_result)) {
	case T_NIL:
		break;

	case T_FALSE:
		replace->rb_result = Qfalse;
		break;

	default:
		check_replace_result_1(replace, rb_result);
		break;
	}
}

static void
serialize_replacement_element(GumboStringBuffer *out, GoombaSerializer *serial, long n,
	GumboNode *node, bool apply_filters)
{
	GumboElement *element = &node->v.element;

	goomba_start_tag_serialize(out, element);

	if (!element_is_void(element->tag)) {
		if (node->type != GUMBO_NODE_TEMPLATE) {
			GumboVector *children = &element->children;
			unsigned int x;

			for (x = 0; x < children->length; ++x) {
				serialize_node(out, apply_filters ? serial : NULL, n, children->data[x]);
			}
		}

		strbuf_put(out, "</", 2);
		goomba_tag_name_serialize(out, element);
		strbuf_put(out, ">", 1);
	}
}

static void
serialize_replacement_node(GumboStringBuffer *out, GoombaSerializer *serial, long n,
	GumboNode *node, bool apply_filters)
{
	switch (node->type) {
	case GUMBO_NODE_DOCUMENT:
		rb_raise(rb_eRuntimeError, "unexpected Document node");
		break;
	case GUMBO_NODE_COMMENT:
		rb_raise(rb_eRuntimeError, "unexpected Comment node");
		break;
	case GUMBO_NODE_ELEMENT:
	case GUMBO_NODE_TEMPLATE:
		serialize_replacement_element(out, serial, n, node, apply_filters);
		break;
	case GUMBO_NODE_TEXT:
	case GUMBO_NODE_CDATA:
	case GUMBO_NODE_WHITESPACE:
		serialize_node(out, NULL, n, node);
		break;
	}
}

static void
filter_and_serialize_element(GumboStringBuffer *out,
		GoombaSerializer *serial, long n, GumboNode *node)
{
	Filter *filters = serial->filters;
	const long filter_count = serial->filter_count;

	GoombaReplace replace = {Qnil};
	GumboOutput *replace_with_fragment = NULL;
	VALUE rb_node = Qnil, rb_result;
	GumboNode *original_node = node;
	bool matched_here = false;
	bool halt_further_filters = false;
	long parent_match_index = n;

	for (; n < filter_count; ++n) {

		Filter *f = &filters[n];
		if (filter_matches(f, node, MATCHES_ELEMENT)) {
			double begin;

			if (NIL_P(rb_node)) {
				rb_node = goomba_node_to_rb(serial->rb_document, node);
				replace.rb_result = rb_node;
			}

			begin = goomba_get_ms();
			rb_result = rb_funcall(f->rb_filter, g_id_call, 1, rb_node);
			f->total_elapsed += (goomba_get_ms() - begin);
			f->total_calls++;

			check_replace_result(&replace, rb_result);
			if (replace.rb_result != rb_node) {
				matched_here = true;
				halt_further_filters = f->halt_further_filters;
				break;
			}
		}
	}

	if (n < filter_count) {
		VALUE rb_result_class;

		if (replace.rb_result == Qfalse)
			return;
	
		if (rb_type(replace.rb_result) == T_STRING) {
			goomba_strcheck(replace.rb_result);
			replace.rb_result = goomba_parse_to_rb(
				rb_cDocumentFragment, replace.rb_result,
				fragment_context_for_node(serial, node->parent));
		}

		Check_Type(replace.rb_result, T_DATA);
		rb_result_class = rb_class_of(replace.rb_result);

		/*
		 * Otherwise, check if we got a new Node object,
		 * or a whole document fragment
		 */
		if (rb_result_class == rb_cElementNode || rb_result_class == rb_cTextNode) {
			node = DATA_PTR(replace.rb_result);
		} else if (rb_result_class == rb_cDocumentFragment) {
			replace_with_fragment = document_get_output(replace.rb_result);
		} else {
			rb_raise(rb_eTypeError,
					"Expected a String, Node, or DocumentFragment as replacement "
					"for the existing node");
		}
	}

	if (replace_with_fragment) {
		GumboVector *children;
		unsigned int x;
		children = &replace_with_fragment->root->v.element.children;
		for (x = 0; x < children->length; ++x) {
			if (halt_further_filters) {
				serialize_node(out, NULL, 0, children->data[x]);			
			} else {
				serialize_node(out, serial, n+1, children->data[x]);
			}
		}
	} else {
		if (halt_further_filters) {
			serialize_replacement_node(out, NULL, 0, node, node == original_node);
		} else {
			long last_matched_filter_index = matched_here ? n : parent_match_index;
			serialize_replacement_node(out, serial, last_matched_filter_index, node, node == original_node);
		}
	}
}

static inline void
process_element_node(GumboStringBuffer *out,
		GoombaSerializer *serial, long n, GumboNode *node)
{
	if (serial)
		filter_and_serialize_element(out, serial, n, node);
	else
		serialize_replacement_element(out, NULL, n, node, false);
}

static void
serialize_node(GumboStringBuffer *out, GoombaSerializer *serial, long n, GumboNode *node)
{
	switch (node->type) {
	case GUMBO_NODE_DOCUMENT:
		rb_raise(rb_eRuntimeError, "unexpected Document node");
		break;

	case GUMBO_NODE_ELEMENT:
	case GUMBO_NODE_TEMPLATE:
		process_element_node(out, serial, n, node);
		break;

	case GUMBO_NODE_WHITESPACE:
	{
		GumboText *text = &node->v.text;
		strbuf_puts(out, text->text);
		break;
	}

	case GUMBO_NODE_TEXT:
	case GUMBO_NODE_CDATA:
	{
		GumboText *text = &node->v.text;
		GumboNode *parent = node->parent;

		assert(parent->type == GUMBO_NODE_ELEMENT);

		if (element_is_rcdata(parent->v.element.tag)) {
			strbuf_puts(out, text->text);
		} else if (serial) {
			process_text_node(out, serial, node);
		} else {
			goomba_escape_html(out, text->text, strlen(text->text), false);
		}
		break;
	}

	case GUMBO_NODE_COMMENT:
	{
		GumboText *text = &node->v.text;
		strbuf_putv(out, 3, "<!--", text->text, "-->");
		break;
	}

	default:
		rb_raise(rb_eRuntimeError, "unimplemented");
	}
}

void
goomba_element_to_s(GumboStringBuffer *out, GumboElement *element)
{
	goomba_start_tag_serialize(out, element);
	if (!element_is_void(element->tag)) {
		strbuf_put(out, "</", 2);
		goomba_tag_name_serialize(out, element);
		strbuf_put(out, ">", 1);
	}
}

void
goomba_node_serialize(GumboStringBuffer *out, GumboNode *node)
{
	serialize_node(out, NULL, 0, node);
}

static void
serialize_document(GumboStringBuffer *out, GoombaSerializer *serial,
	GumboDocument *document)
{
	GumboVector *children = &document->children;
	unsigned int i;

	if (document->has_doctype) {
		strbuf_putv(out, 2, "<!DOCTYPE ", document->name);
		if (document->public_identifier && document->public_identifier[0]) {
			strbuf_putv(out, 3,
				" PUBLIC \"", document->public_identifier, "\"");
			if (document->system_identifier && document->system_identifier[0])
				strbuf_putv(out, 3,
					" \"", document->system_identifier, "\"");
		} else if (document->system_identifier && document->system_identifier[0]) {
			strbuf_putv(out, 3,
				" SYSTEM \"", document->system_identifier, "\"");
		}
		strbuf_put(out, ">", 1);
	} else {
		// The sanitize gem adds this doctype if there isn't one present.
		strbuf_puts(out,
			"<!DOCTYPE html PUBLIC \"-//W3C//DTD HTML 4.0 "
			"Transitional//EN\" \"http://www.w3.org/TR/REC-html40/loose.dtd\">"
		);
	}

	for (i = 0; i < children->length; ++i) {
		GumboNode *child = children->data[i];
		serialize_node(out, serial, 0, child);
	}
}

static void
rb_goomba_serializer_store_stats(GoombaSerializer *serial)
{
	VALUE rb_document = serial->rb_document;
	VALUE rb_stats = rb_attr_get(rb_document, g_id_stats);
	long i;
	char buffer[256];

	if (NIL_P(rb_stats))
		return;

	goomba_stats(rb_stats, "Document#serialize", 1, serial->total_elapsed);

	for (i = 0; i < serial->filter_count; ++i) {
		Filter *f = &serial->filters[i];

		if (!f->total_calls)
			continue;

		strcpy(buffer, rb_obj_classname(f->rb_filter));
		strcat(buffer, "#call");
		goomba_stats(rb_stats, buffer, f->total_calls, f->total_elapsed);
	}
}

static void
rb_goomba_serializer_free(GoombaSerializer *serial)
{
	xfree(serial->filters);
	strbuf_free(&serial->out);
	strbuf_free(&serial->current_text);
	xfree(serial);
}

static void
rb_goomba_serializer_mark(GoombaSerializer *serial)
{
	long i;

	rb_gc_mark(serial->rb_document);
	rb_gc_mark(serial->rb_current_text);

	for (i = 0; i < serial->filter_count; ++i) {
		Filter *f = &serial->filters[i];
		rb_gc_mark(f->rb_filter);
		rb_gc_mark(f->rb_selector);
	}
}

static VALUE
rb_goomba_serializer_to_html(VALUE rb_self)
{
	VALUE rb_result;
	GoombaSerializer *serial = NULL;
	double begin;

	Data_Get_Struct(rb_self, GoombaSerializer, serial);

	VALUE rb_document = serial->rb_document;
	GumboOutput *output = document_get_output(rb_document);

	begin = goomba_get_ms();

	if (rb_obj_is_kind_of(rb_document, rb_cDocumentFragment)) {
		GumboVector *children = &output->root->v.element.children;
		unsigned int x;
		for (x = 0; x < children->length; ++x)
			serialize_node(&serial->out, serial, 0, children->data[x]);
	} else {
		serialize_document(&serial->out, serial, &output->document->v.document);
	}

	serial->total_elapsed = (goomba_get_ms() - begin);
	rb_result = strbuf_to_rb(&serial->out, false);
	rb_goomba_serializer_store_stats(serial);

	return rb_result;
}

static VALUE rb_goomba_serializer_new(VALUE rb_klass, VALUE rb_document, VALUE rb_filters)
{
	VALUE rb_serializer;
	GoombaSerializer *serial = NULL;

	rb_serializer = Data_Make_Struct(rb_klass, GoombaSerializer,
		rb_goomba_serializer_mark, rb_goomba_serializer_free, serial);

	strbuf_init(&serial->out);
	strbuf_init(&serial->current_text);

	serial->rb_document = rb_document;
	serial->rb_current_text = goomba_node_alloc(rb_cTextNode, rb_document, NULL);

	if (!NIL_P(rb_filters)) {
		long i;
		Check_Type(rb_filters, T_ARRAY);

		serial->filters = xcalloc(RARRAY_LEN(rb_filters), sizeof(Filter));
		serial->filter_count = RARRAY_LEN(rb_filters);

		for (i = 0; i < serial->filter_count; ++i) {
			Filter *f = &serial->filters[i];
			VALUE rb_filter = RARRAY_AREF(rb_filters, i);

			f->rb_filter = rb_filter;
			f->rb_selector = Qnil;
			f->filter_matches = MATCHES_ELEMENT | MATCHES_TEXT;

			f->halt_further_filters = false;
			if (rb_respond_to(rb_filter, g_id_halt_further_filters)) {
				VALUE rb_halt_further_filters = rb_funcall(rb_filter, g_id_halt_further_filters, 0);
				if (RTEST(rb_halt_further_filters)) {
					f->halt_further_filters = true;
				}
			}

			if (!rb_respond_to(rb_filter, g_id_selector))
				continue;

			f->rb_selector = rb_funcall(rb_filter, g_id_selector, 0);
			rb_goomba_selector_check(f->rb_selector);
			f->filter_matches = css_selector_analyze(
					&((GoombaSelector *)DATA_PTR(f->rb_selector))->match);
		}
	}

	return rb_serializer;
}

void Init_goomba_serializer(void)
{
	rb_cSerializer = rb_define_class_under(rb_mGoomba, "Serializer", rb_cObject);
	rb_undef_alloc_func(rb_cSerializer);
	rb_define_singleton_method(rb_cSerializer, "new", rb_goomba_serializer_new, 2);
	rb_define_method(rb_cSerializer, "to_html", rb_goomba_serializer_to_html, 0);
}
