#include "goomba.h"
#include "goomba_css.h"

typedef struct {
	VALUE rb_document;
	GoombaSelector *selector;
} SelectData;

static inline void
yield_node(SelectData *sel, GumboNode *node)
{
	if (goomba_selector_match(sel->selector, node))
		rb_yield(goomba_node_to_rb(sel->rb_document, node));
}

static void
goomba_node_select(SelectData *sel, GumboNode *node)
{
	switch (node->type) {
	case GUMBO_NODE_DOCUMENT:
		rb_raise(rb_eRuntimeError, "unexpected Document node");
		break;

	case GUMBO_NODE_ELEMENT:
	case GUMBO_NODE_TEMPLATE:
	{
		yield_node(sel, node);

		if (node->type != GUMBO_NODE_TEMPLATE) {
			GumboVector *children = &node->v.element.children;
			unsigned int x;

			for (x = 0; x < children->length; ++x)
				goomba_node_select(sel, children->data[x]);
		}

		break;
	}

	case GUMBO_NODE_TEXT:
	case GUMBO_NODE_COMMENT:
		yield_node(sel, node);
		break;

	default:
		break;
	}
}

static VALUE rb_goomba_select_1(GumboNode *node, VALUE rb_selector, VALUE rb_document, bool only_children)
{
	SelectData data;

	data.rb_document = rb_document;
	data.selector = NULL;

	rb_selector = rb_goomba_selector_coerce(rb_selector);
	Data_Get_Struct(rb_selector, GoombaSelector, data.selector);

	if (only_children) {
		GumboVector *children = &node->v.element.children;
		unsigned int x;
		for (x = 0; x < children->length; ++x)
			goomba_node_select(&data, children->data[x]);
	} else {
		goomba_node_select(&data, node);
	}

	RB_GC_GUARD(rb_selector);
	return Qnil;
}

VALUE rb_goomba_select(VALUE rb_self, VALUE rb_selector)
{
	GumboNode *node;
	VALUE rb_document;
	bool only_children;

	if (!rb_block_given_p()) {
		return rb_funcall(rb_self, rb_intern("to_enum"),
				2, CSTR2SYM("select"), rb_selector);
	}


	if (rb_obj_is_kind_of(rb_self, rb_cDocument)) {
                GumboOutput *output = document_get_output(rb_self);
		rb_document = rb_self;
		node = output->root;
		only_children = false;
	} else if (rb_obj_is_kind_of(rb_self, rb_cDocumentFragment)) {
                GumboOutput *output = document_get_output(rb_self);
		rb_document = rb_self;
		node = output->root;
		only_children = true;
	} else if (rb_obj_is_kind_of(rb_self, rb_cElementNode)) {
		Data_Get_Struct(rb_self, GumboNode, node);
		rb_document = rb_iv_get(rb_self, "@document");
		only_children = true;
	} else {
		rb_raise(rb_eRuntimeError, "#select called on an unexpected node type");
	}

	return rb_goomba_select_1(node, rb_selector, rb_document, only_children);
}

static void
goomba_node_find_names(VALUE rb_document, VALUE rb_name_map,
	GumboNode *node, bool map_to_nodes)
{
	if (node->type == GUMBO_NODE_ELEMENT || node->type == GUMBO_NODE_TEMPLATE) {
		GumboVector *attributes = &node->v.element.attributes;
		unsigned int x;

		for (x = 0; x < attributes->length; ++x) {
			GumboAttribute *attr = attributes->data[x];
			if (!strcmp(attr->name, "id") ||
				!strcmp(attr->name, "name")) {
				rb_hash_aset(rb_name_map,
					rb_enc_str_new_cstr(attr->value, rb_utf8_encoding()),
					map_to_nodes ?
						goomba_node_to_rb(rb_document, node) :
						Qtrue
				);
			}
		}

		if (node->type != GUMBO_NODE_TEMPLATE) {
			GumboVector *children = &node->v.element.children;
			for (x = 0; x < children->length; ++x)
				goomba_node_find_names(rb_document, rb_name_map,
						children->data[x], map_to_nodes);
		}
	}
}

VALUE
rb_goomba_find_names(VALUE rb_self, bool map_to_nodes)
{
	VALUE rb_name_map = rb_hash_new();
        GumboOutput *output = document_get_output(rb_self);
	goomba_node_find_names(rb_self, rb_name_map, output->root, map_to_nodes);
	return rb_name_map;
}
