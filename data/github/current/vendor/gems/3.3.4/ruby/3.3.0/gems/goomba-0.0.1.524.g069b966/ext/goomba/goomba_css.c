// _GNU_SOURCE required for strcasestr
#define _GNU_SOURCE 1

#include <string.h>
#include <assert.h>
#include <stdio.h>

#include "goomba_css.h"
#include "goomba_css_helpers.h"
#include "gumbo.h"
#include "util.h"
#include "strbuf.h"

#define READ_BYTE(s) (*(*s)++)

#ifdef GOOMBA_CSS_JIT
#	include "jit/css_jit.in"
bool css_selector_can_jit(void) { return true; }
#else
void css_selector_jit(CSS_Selector *selector) {}
bool css_selector_can_jit(void) { return false; }
#endif

static bool select_one(const uint8_t **, const GumboNode *);
static void skip_one(const uint8_t **);

static bool get_node_tag(const GumboNode *node, bool with_ns, const char **data, size_t *length)
{
	const char *s;
	GumboStringPiece tag = {
		node->v.element.original_tag.data,
		node->v.element.original_tag.length,
	};

	assert(is_element(node));

	gumbo_tag_from_original_text(&tag);

	if (tag.data == NULL)
		return false;

	*data = tag.data;
	*length = tag.length;

	if (!with_ns) {
		s = memchr(*data, ':', *length);
		if (s) {
			*length -= (s - *data) + 1;
			*data = s + 1;
		}
	}

	return true;
}

static inline bool select_all(const uint8_t **select, const GumboNode *node)
{
	return true;
}

static inline bool select_any_element(const uint8_t **select, const GumboNode *node)
{
	return is_element(node);
}

static inline bool compare_node_tag(const GumboNode *node, const char *tag, size_t tag_len)
{
	const char *node_tag;
	size_t node_tag_len;

	/* We ignore the namespace here, per css3-selectors §6.1.1:
	 * > E
	 * >   if no default namespace has been declared for selectors,
	 * >   this is equivalent to *|E. [...]
	 * i.e. we treat an element selector on its own without respect
	 * to namespace, such that a plain "E" selector matches an "E"
	 * tag in any namespace, and we leave it up to an explicit
	 * SELECT_NS to enforce a namespace.
	 */
	if (!get_node_tag(node, false, &node_tag, &node_tag_len))
		return false;

	if (node_tag_len != tag_len)
		return false;

	return memcmp(node_tag, tag, tag_len) == 0;
}

static inline bool select_element(const uint8_t **select, const GumboNode *node)
{
	const char *tag;
	uint8_t tag_num = READ_BYTE(select);

	if (!is_element(node))
		return false;

	if (node->v.element.tag == GUMBO_TAG_UNKNOWN) {
		tag = gumbo_normalized_tagname(tag_num);
		return compare_node_tag(node, tag, strlen(tag));
	}

	return node->v.element.tag == tag_num;
}

static inline bool select_element_custom(const uint8_t **select, const GumboNode *node)
{
	const char *tag = (const char *)(*select);
	size_t tag_len = strlen(tag);
	(*select) += tag_len + 1;

	if (!is_element(node))
		return false;

	return compare_node_tag(node, tag, tag_len);
}

static inline bool select_text(const uint8_t **select, const GumboNode *node)
{
	return node->type == GUMBO_NODE_TEXT || node->type == GUMBO_NODE_WHITESPACE;
}

static inline bool select_comment(const uint8_t **select, const GumboNode *node)
{
	return node->type == GUMBO_NODE_COMMENT;
}

static inline bool select_ns(const uint8_t **select, const GumboNode *node)
{
	const char *ns = (const char *)(*select),
		*node_tag;
	size_t ns_len = strlen(ns),
		node_tag_len;
	(*select) += ns_len + 1;

	if (!is_element(node))
		return false;

	if (!get_node_tag(node, true, &node_tag, &node_tag_len))
		return false;

	if (node_tag_len <= ns_len + 1)
		return false;

	if (memcmp(node_tag, ns, ns_len) != 0)
		return false;

	return node_tag[ns_len] == ':';
}

static inline bool select_ns_any(const uint8_t **select, const GumboNode *node)
{
	/* No-op due to comment above in compare_node_tag. */
	return true;
}

static inline bool select_attribute(const uint8_t **select, const GumboNode *node)
{
	const char *attr = (const char *)(*select);
	(*select) += strlen(attr) + 1;

	return (is_element(node) &&
			gumbo_get_attribute(&node->v.element.attributes, attr));
}

static bool select_attribute_value_core(const uint8_t **select, const GumboNode *node, bool insensitive)
{
	uint8_t mode = READ_BYTE(select);
	const char *attr, *value;
	GumboAttribute *a;

	attr = (const char *)(*select);
	(*select) += strlen(attr) + 1;

	value = (const char *)(*select);
	(*select) += strlen(value) + 1;

	if (value[0] == '\0' && mode != '=')
		return false;

	if (!is_element(node))
		return false;

	a = gumbo_get_attribute(&node->v.element.attributes, attr);
	if (!a)
		return false;

	switch (mode) {
	case '=':
    if (insensitive)
      return !strcasecmp(a->value, value);
    else
      return !strcmp(a->value, value);
	case '^':
		return css_starts_with(a->value, value, insensitive);
	case '$':
		return css_ends_with(a->value, value, insensitive);
	case '*':
    if (insensitive)
      return strcasestr(a->value, value) != NULL;
    else
      return strstr(a->value, value) != NULL;
	case '|':
		return css_starts_with_class(a->value, value, insensitive);
	case '~':
		return css_value_contains(a->value, value, insensitive);
	default:
		assert(0);
		return false;
	}
}

static bool select_attribute_value(const uint8_t **select, const GumboNode *node)
{
  return select_attribute_value_core(select, node, false);
}

static bool select_attribute_value_insensitive(const uint8_t **select, const GumboNode *node)
{
  return select_attribute_value_core(select, node, true);
}

static inline bool select_ns_attribute_any(const uint8_t **select, const GumboNode *node)
{
	const char *ns = (const char *)(*select);
	unsigned long ns_len = strlen(ns);
	(*select) += ns_len + 1;

	if (!is_element(node))
		return false;

	const GumboVector *attributes = &node->v.element.attributes;
	for (unsigned int i = 0; i < attributes->length; ++i) {
		const GumboAttribute *attr = attributes->data[i];
		if (strlen(attr->name) > ns_len + 1 &&
		    memcmp(attr->name, ns, ns_len) == 0 &&
		    attr->name[ns_len] == ':')
			return true;
	}

	return false;
}

static bool check_number(unsigned int n, uint8_t _an, uint8_t _b)
{
	if (_an == 0)
		return (n == _b);
	return ((n - _b) % _an) == 0;
}

static bool select_pseudo_nth(const uint8_t **select, const GumboNode *node)
{
	enum PseudoClass_PositionNth pclass;
	uint8_t an, b;
	unsigned int child_pos;

	pclass = READ_BYTE(select);
	an = READ_BYTE(select);
	b = READ_BYTE(select);

	if (!css_has_parent(node) || !is_element(node))
		return false;

	switch (pclass) {
	case PSEUDO_NTH_CHILD:
		child_pos = find_nth_child(node);
		break;

	case PSEUDO_NTH_LAST_CHILD:
		child_pos = find_nth_last_child(node);
		break;

	case PSEUDO_NTH_OF_TYPE:
		child_pos = find_nth_of_type(node);
		break;

	case PSEUDO_NTH_LAST_OF_TYPE:
		child_pos = find_nth_last_of_type(node);
		break;

	default:
		assert(0);
	}

	return check_number(child_pos, an, b);
}

static bool select_pseudo_empty(const uint8_t **select, const GumboNode *node)
{
	return css_node_is_empty(node);
}

static bool select_pseudo_root(const uint8_t **select, const GumboNode *node)
{
	return !css_has_parent(node);
}

static bool select_pseudo_custom(const uint8_t **select, const GumboNode *node)
{
	enum PseudoClass_Custom pclass = READ_BYTE(select);
	unsigned int children_count;

	if (!css_has_parent(node))
		return false;

	children_count = node->parent->v.element.children.length;

	switch (pclass) {
	case PSEUDO_C_FIRST_CHILD_NODE:
		return (node->index_within_parent == 0);

	case PSEUDO_C_LAST_CHILD_NODE:
		return (node->index_within_parent == children_count - 1);

	case PSEUDO_C_ONLY_CHILD_NODE:
		return (children_count == 1);
	}
	assert(0);
}

static bool select_pseudo_position(const uint8_t **select, const GumboNode *node)
{
	enum PseudoClass_Position pclass = READ_BYTE(select);

	if (!css_has_parent(node) || !is_element(node))
		return false;

	switch (pclass) {
	case PSEUDO_FIRST_CHILD:
		return is_first_child(node);

	case PSEUDO_LAST_CHILD:
		return is_last_child(node);

	case PSEUDO_FIRST_OF_TYPE:
		return is_first_of_type(node);

	case PSEUDO_LAST_OF_TYPE:
		return is_last_of_type(node);

	case PSEUDO_ONLY_CHILD:
		return is_only_child(node);

	case PSEUDO_ONLY_OF_TYPE:
		return is_only_of_type(node);
	}
	assert(0);
}

static bool select_not(const uint8_t **select, const GumboNode *node)
{
	if (!is_element(node)) {
		skip_one(select);
		return false;
	}
	return !select_one(select, node);
}

static bool select_and(const uint8_t **select, const GumboNode *node)
{
	uint8_t n, len = READ_BYTE(select);

	for (n = 0; n < len; ++n) {
		if (!select_one(select, node)) {
			for (++n; n < len; ++n)
				skip_one(select);
			return false;
		}
	}
	return true;
}

static bool select_or(const uint8_t **select, const GumboNode *node)
{
	uint8_t n, len = READ_BYTE(select);

	for (n = 0; n < len; ++n) {
		if (select_one(select, node)) {
			for (++n; n < len; ++n)
				skip_one(select);
			return true;
		}
	}
	return false;
}

static bool select_combinator(const uint8_t **select, const GumboNode *node)
{
	const uint8_t *left;
	uint8_t mode = READ_BYTE(select);

	if (!css_has_parent(node)) {
		skip_one(select);
		skip_one(select);
		return false;
	}

	if (!select_one(select, node)) {
		skip_one(select);
		return false;
	}

	left = *select;

	switch (mode) {
	case ' ':
		while (css_has_parent(node)) {
			*select = left;
			if (select_one(select, node->parent))
				return true;
			node = node->parent;
		}
		return false;

	case '>':
		return select_one(select, node->parent);

	case '+':
	case '~':
	{
		GumboVector *children;
		size_t pos;

		children = &node->parent->v.element.children;
		pos = node->index_within_parent;

		if (mode == '+') {
			for (; pos > 0; --pos) {
				GumboNode *child = children->data[pos - 1];
				if (is_element(child))
					return select_one(select, child);
			}
		} else {
			for (; pos > 0; --pos) {
				GumboNode *child = children->data[pos - 1];
				if (is_element(child)) {
					*select = left;
					if (select_one(select, child))
						return true;
				}
			}
		}
		/* Move past the left selector if we haven't already. */
		if (*select == left)
			skip_one(select);
		return false;
	}

	default:
		assert(0);
	}
}

static void skip_one_1(const uint8_t **select, enum SelectionOp op)
{
	uint8_t n, len;

	switch (op) {
	case SELECT_ALL:
	case SELECT_ANY_ELEMENT:
	case SELECT_TEXT:
	case SELECT_COMMENT:
	case SELECT_PSEUDO_ROOT:
	case SELECT_PSEUDO_EMPTY:
	case SELECT_NS_ANY:
		break;
	case SELECT_ELEMENT:
	case SELECT_PSEUDO_POSITION:
	case SELECT_PSEUDO_CUSTOM:
		(*select)++;
		break;
	case SELECT_PSEUDO_NTH:
		(*select) += 3;
		break;
	case SELECT_ATTRIBUTE:
	case SELECT_ELEMENT_CUSTOM:
	case SELECT_NS:
	case SELECT_NS_ATTRIBUTE_ANY:
		(*select) += strlen((char *)*select) + 1;
		break;
	case SELECT_ATTRIBUTE_VALUE:
  case SELECT_ATTRIBUTE_VALUE_INSENSITIVE:
		(*select)++;
		(*select) += strlen((char *)*select) + 1;
		(*select) += strlen((char *)*select) + 1;
		break;
	case SELECT_AND:
	case SELECT_OR:
		len = READ_BYTE(select);
		for (n = 0; n < len; ++n)
			skip_one(select);
		break;
	case SELECT_NOT:
		skip_one(select);
		break;
	case SELECT_COMBINATOR:
		(*select)++;
		skip_one(select);
		skip_one(select);
		break;
	}
}

static void skip_one(const uint8_t **select)
{
	enum SelectionOp op = READ_BYTE(select);
	skip_one_1(select, op);
}

static bool select_one(const uint8_t **select, const GumboNode *node)
{
#define VM_LABEL(sel) &&do_select_##sel
#define VM_DISPATCH(sel) do_select_##sel: return select_##sel(select, node);

	static void *selectors[] = {
		VM_LABEL(all),
		VM_LABEL(and),
		VM_LABEL(or),
		VM_LABEL(not),
		VM_LABEL(combinator),
		VM_LABEL(any_element),
		VM_LABEL(element),
		VM_LABEL(element_custom),
		VM_LABEL(attribute),
		VM_LABEL(attribute_value),
    VM_LABEL(attribute_value_insensitive),
		VM_LABEL(ns_attribute_any),
		VM_LABEL(pseudo_position),
		VM_LABEL(pseudo_custom),
		VM_LABEL(pseudo_nth),
		VM_LABEL(pseudo_root),
		VM_LABEL(pseudo_empty),
		VM_LABEL(ns),
		VM_LABEL(ns_any),
		VM_LABEL(text),
		VM_LABEL(comment),
	};

	uint8_t s = READ_BYTE(select);
	assert((int)s <= SELECT_COMMENT);
	goto *selectors[(int)s];

	VM_DISPATCH(all);
	VM_DISPATCH(and);
	VM_DISPATCH(or);
	VM_DISPATCH(not);
	VM_DISPATCH(combinator);
	VM_DISPATCH(any_element);
	VM_DISPATCH(element);
	VM_DISPATCH(element_custom);
	VM_DISPATCH(attribute);
	VM_DISPATCH(attribute_value);
  VM_DISPATCH(attribute_value_insensitive);
	VM_DISPATCH(ns_attribute_any);
	VM_DISPATCH(pseudo_position);
	VM_DISPATCH(pseudo_custom);
	VM_DISPATCH(pseudo_nth);
	VM_DISPATCH(pseudo_root);
	VM_DISPATCH(pseudo_empty);
	VM_DISPATCH(ns);
	VM_DISPATCH(ns_any);
	VM_DISPATCH(text);
	VM_DISPATCH(comment);
}

bool css_selector_match(const CSS_Selector *s, const GumboNode *node)
{
	if (!s->compiled) {
		const uint8_t *selector = s->bytecode;
		bool match = select_one(&selector, node);
		assert(selector == s->bytecode + s->bytesize);
		return match;
	}
	return s->compiled(node);
}

static int analyze_one(const uint8_t **select);
static int analyze_combinator(const uint8_t **select)
{
	int right_matches, left_matches;
	uint8_t mode = READ_BYTE(select);

	right_matches = analyze_one(select);
	if (!right_matches) {
		skip_one(select);
		return 0x0;
	}

	left_matches = analyze_one(select);
	if (!left_matches)
		return 0x0;

	switch (mode) {
	case ' ':
	case '>':
		return (left_matches & MATCHES_ELEMENT) ? right_matches : 0x0;

	case '+':
	case '~':
		return right_matches;

	default:
		assert(0);
	}
}

static int analyze_one(const uint8_t **select)
{
	uint8_t n, len;
	enum SelectionOp op = READ_BYTE(select);

	switch (op) {
	case SELECT_ALL:
		return MATCHES_ALL;
	case SELECT_TEXT:
		return MATCHES_TEXT;
	case SELECT_COMMENT:
		return 0x0;
	case SELECT_ANY_ELEMENT:
	case SELECT_PSEUDO_ROOT:
	case SELECT_PSEUDO_EMPTY:
	case SELECT_ELEMENT:
	case SELECT_ELEMENT_CUSTOM:
	case SELECT_PSEUDO_POSITION:
	case SELECT_PSEUDO_NTH:
	case SELECT_ATTRIBUTE:
	case SELECT_ATTRIBUTE_VALUE:
	case SELECT_ATTRIBUTE_VALUE_INSENSITIVE:
	case SELECT_NS_ATTRIBUTE_ANY:
	case SELECT_NOT:
	case SELECT_NS:
	case SELECT_NS_ANY:
		skip_one_1(select, op);
		return MATCHES_ELEMENT;
	case SELECT_PSEUDO_CUSTOM:
		skip_one_1(select, op);
		return MATCHES_ALL;
	case SELECT_AND: {
		int m = MATCHES_ALL;
		len = READ_BYTE(select);
		for (n = 0; n < len && m; ++n)
			m &= analyze_one(select);
		for (; n < len; ++n)
			skip_one(select);
		return m;
	}
	case SELECT_OR: {
		int m = 0x0;
		len = READ_BYTE(select);
		for (n = 0; n < len && m != MATCHES_ALL; ++n)
			m |= analyze_one(select);
		for (; n < len; ++n)
			skip_one(select);
		return m;
	}
	case SELECT_COMBINATOR:
		return analyze_combinator(select);
	}
	assert(0);
}

int css_selector_analyze(const CSS_Selector *s)
{
	const uint8_t *selector = s->bytecode;
	if (!selector)
		return 0x0;
	return analyze_one(&selector);
}
