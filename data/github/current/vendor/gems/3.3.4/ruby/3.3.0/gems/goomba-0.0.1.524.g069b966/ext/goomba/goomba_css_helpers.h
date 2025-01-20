#ifndef GOOMBA_CSS_HELPERS_H
#include <string.h>
#include <stdint.h>
#include "goomba_css.h"
#include "util.h"

static inline bool is_element(const GumboNode *node)
{
	return node->type == GUMBO_NODE_ELEMENT || node->type == GUMBO_NODE_TEMPLATE;
}

static inline bool css_value_contains(const char *value, const char *needle, bool insensitive)
{
	const char *end = value + strlen(value);
	unsigned long needle_len = strlen(needle);

	while (value < end) {
		while (value < end && gumbo_isspace(*value))
			value++;
		if (value < end) {
			const char *class = value;

			while (value < end && !gumbo_isspace(*value))
				value++;

			if (needle_len == (value - class) &&
          (insensitive
           ? !strncasecmp(class, needle, needle_len)
           : !memcmp(class, needle, needle_len)))
				return true;

			value = value + 1;
		}
	}
	return false;
}

static inline bool css_starts_with(const char *value, const char *needle, bool insensitive)
{
	unsigned long len_value = strlen(value);
	unsigned long len_needle = strlen(needle);
	if (len_needle > len_value)
		return false;
  if (insensitive)
    return !strncasecmp(value, needle, len_needle);
	else
    return !memcmp(value, needle, len_needle);
}

static inline bool css_starts_with_class(const char *value, const char *needle, bool insensitive)
{
	unsigned long len_value = strlen(value);
	unsigned long len_needle = strlen(needle);
	if (len_value == len_needle && (insensitive
                                  ? !strncasecmp(value, needle, len_value)
                                  : !memcmp(value, needle, len_value)))
		return true;
	if (len_needle + 1 > len_value)
		return false;
  if (insensitive)
    return !strncasecmp(value, needle, len_needle) && value[len_needle] == '-';
  else
    return !memcmp(value, needle, len_needle) && value[len_needle] == '-';
}

static inline bool css_ends_with(const char *value, const char *needle, bool insensitive)
{
	unsigned long len_value = strlen(value);
	unsigned long len_needle = strlen(needle);
	if (len_needle > len_value)
		return false;
  if (insensitive)
    return !strncasecmp(value + len_value - len_needle, needle, len_needle);
  else
    return !memcmp(value + len_value - len_needle, needle, len_needle);
}

static inline bool css_node_is_empty(const GumboNode *node)
{
	if (node->type == GUMBO_NODE_ELEMENT) {
		const GumboVector *children = &node->v.element.children;

		if (!children->length)
			return true;

		if (children->length == 1) {
			const GumboNode *first_child = children->data[0];
			if (first_child->type == GUMBO_NODE_COMMENT)
				return true;
		}
	} else if (node->type == GUMBO_NODE_TEMPLATE) {
		return true;
	}
	return false;
}

static inline bool css_has_parent(const GumboNode *node)
{
	return (node->parent && node->parent->type == GUMBO_NODE_ELEMENT);
}

static inline bool is_first_child(const GumboNode *node)
{
	const GumboVector *children = &node->parent->v.element.children;
	unsigned int x;

	for (x = 0; x < children->length; ++x) {
		const GumboNode *sil = children->data[x];
		if (is_element(sil))
			return (sil == node);
	}
	return false;
}

static inline bool is_last_child(const GumboNode *node)
{
	const GumboVector *children = &node->parent->v.element.children;
	unsigned int x;

	for (x = children->length; x > 0; --x) {
		const GumboNode *sil = children->data[x - 1];
		if (is_element(sil))
			return (sil == node);
	}
	return false;
}

static inline bool is_first_of_type(const GumboNode *node)
{
	const GumboVector *children = &node->parent->v.element.children;
	const GumboTag element_tag = node->v.element.tag;
	unsigned int x;

	for (x = 0; x < children->length; ++x) {
		const GumboNode *sil = children->data[x];
		if (is_element(sil) && sil->v.element.tag == element_tag)
			return (sil == node);
	}
	return false;
}

static inline bool is_last_of_type(const GumboNode *node)
{
	const GumboVector *children = &node->parent->v.element.children;
	const GumboTag element_tag = node->v.element.tag;
	unsigned int x;

	for (x = children->length; x > 0; --x) {
		const GumboNode *sil = children->data[x - 1];
		if (is_element(sil) && sil->v.element.tag == element_tag)
			return (sil == node);
	}
	return false;
}

static inline bool is_only_child(const GumboNode *node)
{
	const GumboVector *children = &node->parent->v.element.children;
	unsigned int x;

	for (x = 0; x < children->length; ++x) {
		const GumboNode *sil = children->data[x];
		if (is_element(sil) && sil != node)
			return false;
	}
	return true;
}

static inline bool is_only_of_type(const GumboNode *node)
{
	const GumboVector *children = &node->parent->v.element.children;
	const GumboTag element_tag = node->v.element.tag;
	unsigned int x;

	for (x = 0; x < children->length; ++x) {
		const GumboNode *sil = children->data[x];
		if (is_element(sil) &&
				sil->v.element.tag == element_tag &&
				sil != node)
			return false;
	}
	return true;
}

static inline unsigned int find_nth_child(const GumboNode *node)
{
	const GumboVector *children = &node->parent->v.element.children;
	unsigned int x, i;

	for (x = 0, i = 1; x < children->length; ++x) {
		const GumboNode *sil = children->data[x];
		if (sil == node)
			break;
		if (is_element(sil))
			i++;
	}
	return i;
}

static inline unsigned int find_nth_last_child(const GumboNode *node)
{
	const GumboVector *children = &node->parent->v.element.children;
	unsigned int x, i;

	for (x = children->length, i = 1; x > 0; --x) {
		const GumboNode *sil = children->data[x - 1];
		if (sil == node)
			break;
		if (is_element(sil))
			i++;
	}
	return i;
}

static inline unsigned int find_nth_of_type(const GumboNode *node)
{
	const GumboVector *children = &node->parent->v.element.children;
	const GumboTag element_tag = node->v.element.tag;
	unsigned int x, i;

	for (x = 0, i = 1; x < children->length; ++x) {
		const GumboNode *sil = children->data[x];
		if (sil == node)
			break;
		if (is_element(sil) &&
			sil->v.element.tag == element_tag)
			i++;
	}
	return i;
}

static inline unsigned int find_nth_last_of_type(const GumboNode *node)
{
	const GumboVector *children = &node->parent->v.element.children;
	const GumboTag element_tag = node->v.element.tag;
	unsigned int x, i;

	for (x = children->length, i = 1; x > 0; --x) {
		const GumboNode *sil = children->data[x - 1];
		if (sil == node)
			break;
		if (is_element(sil) &&
			sil->v.element.tag == element_tag)
			i++;
	}
	return i;
}

#endif
