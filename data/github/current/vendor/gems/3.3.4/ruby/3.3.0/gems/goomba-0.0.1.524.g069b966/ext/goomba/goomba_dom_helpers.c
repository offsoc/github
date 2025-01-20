#include "goomba.h"
#include "vector.h"
#include "util.h"

/*
 * Create a dummy whitespace node to separate an element that
 * has been sanitized out
 */
static GumboNode *dummy_whitespace_node(void)
{
	GumboNode *node = gumbo_create_node(GUMBO_NODE_WHITESPACE);
	node->parse_flags = GUMBO_INSERTION_BY_PARSER;
	node->v.text.text = gumbo_strdup(" ");
	node->v.text.start_pos = kGumboEmptySourcePosition;
	return node;
}

void
goomba_remove_child_at(GumboNode *parent, unsigned int pos_at, bool wrap)
{
	GumboVector *children = &parent->v.element.children;
	unsigned int x;

	if (wrap) {
		GumboNode *whitespace = dummy_whitespace_node();
		whitespace->parent = parent;
		whitespace->index_within_parent = pos_at;
		children->data[pos_at] = whitespace;
	} else {
		gumbo_vector_remove_at(pos_at, children);
	}

	/* Readjust children position */
	for (x = pos_at; x < children->length; ++x) {
		GumboNode *child = children->data[x];
		child->index_within_parent = x;
	}
}

void
goomba_reparent_children_at(GumboNode *parent, GumboVector *new_children,
	unsigned int pos_at, bool wrap)
{
	GumboVector *children = &parent->v.element.children;
	void **new_children_ary;
	unsigned int x, new_children_len;

	if (!new_children->length) {
		goomba_remove_child_at(parent, pos_at, wrap);
		return;
	}

	if (wrap) {
		new_children_len = new_children->length + 2;
		new_children_ary = alloca(new_children_len * sizeof(void*));
		memcpy(new_children_ary + 1,
			new_children->data,
			new_children->length * sizeof(void *));
		new_children_ary[0] = dummy_whitespace_node();
		new_children_ary[new_children_len - 1] = dummy_whitespace_node();
	} else {
		new_children_len = new_children->length;
		new_children_ary = new_children->data;
	}

	gumbo_vector_splice(
		pos_at, 1, new_children_ary, new_children_len,
		children);

	for (x = pos_at; x < children->length; ++x) {
		GumboNode *child = children->data[x];
		child->parent = parent;
		child->index_within_parent = x;
	}
	new_children->length = 0;
}

