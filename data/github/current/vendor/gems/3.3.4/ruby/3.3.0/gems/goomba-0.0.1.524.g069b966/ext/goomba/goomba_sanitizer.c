#include <ruby/util.h>
#include "goomba.h"
#include "attribute.h"
#include "util.h"
#include "string_buffer.h"
#include "vector.h"
#include "util.h"

typedef struct {
	st_table *tags_visited;
} context;

static void
sanitize_node(const GoombaSanitizer *sanitizer, context *ctx, GumboNode *node);

static int
free_each_element_sanitizer(st_data_t _unused1, st_data_t _ef, st_data_t _unused2)
{
	GoombaElementSanitizer *ef = (GoombaElementSanitizer *)_ef;
	GoombaProtocolSanitizer *proto;
	(void)_unused1;
	(void)_unused2;

	proto = ef->protocols;
	while (proto) {
		GoombaProtocolSanitizer *next = proto->next;
		xfree(proto->name);
		string_set_free(&proto->allowed);
		xfree(proto);
		proto = next;
	}

	string_set_free(&ef->attr_allowed);
	string_set_free(&ef->attr_required);
	string_set_free(&ef->class_allowed);
	xfree(ef);

	return ST_CONTINUE;
}

void
goomba_sanitizer_free(void *_sanitizer)
{
	GoombaSanitizer *sanitizer = _sanitizer;

	string_set_free(&sanitizer->attr_allowed);
	string_set_free(&sanitizer->class_allowed);
	string_set_free(&sanitizer->custom_tags);
	string_set_free(&sanitizer->extended_tags);

	st_foreach(sanitizer->element_sanitizers, &free_each_element_sanitizer, 0);
	st_free_table(sanitizer->element_sanitizers);

	xfree(sanitizer->name_prefix);
	xfree(sanitizer);
}

GoombaSanitizer *
goomba_sanitizer_new(void)
{
	GoombaSanitizer *sanitizer = xcalloc(1, sizeof(GoombaSanitizer));

	string_set_init(&sanitizer->attr_allowed);
	string_set_init(&sanitizer->class_allowed);
	string_set_init(&sanitizer->custom_tags);

	// Fixed list of tags that gumbo doesn't support
	// To allow more tags, insert them into extended_tags
	string_set_init(&sanitizer->extended_tags);
	string_set_insert(&sanitizer->extended_tags, "dialog");
	string_set_insert(&sanitizer->extended_tags, "picture");
	string_set_insert(&sanitizer->extended_tags, "slot");
	sanitizer->element_sanitizers = st_init_numtable();

	return sanitizer;
}

static GoombaElementSanitizer *
try_find_element(const GoombaSanitizer *sanitizer, GumboTag tag)
{
	st_data_t data;

	if (st_lookup(sanitizer->element_sanitizers, (st_data_t)tag, (st_data_t *)&data))
		return (GoombaElementSanitizer *)data;

	return NULL;
}

GoombaElementSanitizer *
goomba_sanitizer_get_element(GoombaSanitizer *sanitizer, GumboTag t)
{
	GoombaElementSanitizer *ef = try_find_element(sanitizer, t);

	if (ef == NULL) {
		ef = xmalloc(sizeof(GoombaElementSanitizer));
		ef->max_nested = 0;
		string_set_init(&ef->attr_allowed);
		string_set_init(&ef->attr_required);
		string_set_init(&ef->class_allowed);
		ef->protocols = NULL;
		st_insert(sanitizer->element_sanitizers, (st_data_t)t, (st_data_t)ef);
	}

	return ef;
}

GoombaProtocolSanitizer *goomba_element_sanitizer_get_proto(
		GoombaElementSanitizer *element, const char *protocol_name)
{
	GoombaProtocolSanitizer *proto = element->protocols;

	while (proto) {
		if (!strcmp(proto->name, protocol_name))
			return proto;

		proto = proto->next;
	}

	proto = xmalloc(sizeof(GoombaProtocolSanitizer));
	proto->name = ruby_strdup(protocol_name);
	string_set_init(&proto->allowed);
	proto->next = element->protocols;

	element->protocols = proto;
	return proto;
}

static bool
sanitize_attributes(const GoombaSanitizer *sanitizer, GumboElement *element);

static void
remove_child(GumboNode *parent, GumboNode *child, unsigned int pos, uint8_t flags)
{
	bool wrap_whitespace = (flags & GOOMBA_SANITIZER_WRAP_WS);

	if ((flags & GOOMBA_SANITIZER_REMOVE_CONTENTS)) {
		goomba_remove_child_at(parent, pos, wrap_whitespace);
	} else {
		goomba_reparent_children_at(parent,
				&child->v.element.children, pos, wrap_whitespace);
	}

	gumbo_destroy_node(child);
}

static bool
try_remove_child(
	const GoombaSanitizer *sanitizer, GumboNode *parent, GumboNode *child, unsigned int pos)
{
	if (child->type == GUMBO_NODE_ELEMENT || child->type == GUMBO_NODE_TEMPLATE) {
		GumboTag tag = child->v.element.tag;
		bool should_remove = false;
		uint8_t flags = 0;
		if (tag == GUMBO_TAG_UNKNOWN && (sanitizer->custom_tags.size || sanitizer->extended_tags.size)) {
			GumboStringPiece tag_name = child->v.element.original_tag;
			size_t tag_len;
			gumbo_tag_from_original_text(&tag_name);
			tag_len = tag_name.length;
			if (tag_len > 0 && tag_len < MAX_CUSTOM_TAG_LENGTH) {
				char *custom_tag_name = alloca(tag_len + 1);
				memcpy(custom_tag_name, tag_name.data, tag_len);
				custom_tag_name[tag_len] = '\0';
				if (string_set_contains(&sanitizer->custom_tags, custom_tag_name)) {
					flags = GOOMBA_SANITIZER_ALLOW;
				}
			}
		} else {
			flags = sanitizer->flags[tag];
		}

		if ((flags & GOOMBA_SANITIZER_ALLOW) == 0)
			should_remove = true;

		if (!should_remove) {
			if (!sanitize_attributes(sanitizer, &child->v.element))
				should_remove = true;
		}

		if (should_remove) {
			remove_child(parent, child, pos, flags);
			return true;
		}
	}
	else if (child->type == GUMBO_NODE_COMMENT && !sanitizer->allow_comments) {
		goomba_remove_child_at(parent, pos, false);
		gumbo_destroy_node(child);
		return true;
	}

	return false;
}

static void
sanitize_children(const GoombaSanitizer *sanitizer, context *ctx, GumboNode *parent, GumboVector *children)
{
	unsigned int x;

	for (x = 0; x < children->length; ++x) {
		GumboNode *child = children->data[x];
		GumboTag tag = GUMBO_TAG_LAST;
		st_data_t tag_key = GUMBO_TAG_LAST, n = 0;

		if (child->type == GUMBO_NODE_ELEMENT || child->type == GUMBO_NODE_TEMPLATE) {
			tag = child->v.element.tag;
			tag_key = (st_data_t)tag;

			GoombaElementSanitizer *ef = try_find_element(sanitizer, tag);
			if (ef && ef->max_nested > 0 &&
					st_lookup(ctx->tags_visited, tag_key, (st_data_t *)&n) &&
					n >= ef->max_nested) {
				remove_child(parent, child, x, (tag == GUMBO_TAG_UNKNOWN) ? 0 : sanitizer->flags[tag]);
				x--;
				continue;
			}
		}

		if (try_remove_child(sanitizer, parent, child, x)) {
			x--;
			continue;
		}

		if (tag_key != GUMBO_TAG_LAST) {
			n += 1;
			st_insert(ctx->tags_visited, tag_key, (st_data_t)n);
		}

		sanitize_node(sanitizer, ctx, child);

		if (tag_key != GUMBO_TAG_LAST) {
			n -= 1;
			if (n == 0)
				st_delete(ctx->tags_visited, &tag_key, NULL);
			else
				st_insert(ctx->tags_visited, tag_key, (st_data_t)n);
		}
	}
}

static bool
has_allowed_protocol(const StringSet *protocol_allowed, GumboAttribute *attr)
{
	const char *value = attr->value;
	char *proto;
	long i, len = 0;

	while (value[len] && value[len] != '/' && value[len] != ':')
		len++;

	if (value[len] == '\0' || value[len] == '/')
		return string_set_contains(protocol_allowed, "/");

	/* Make the protocol name case insensitive */
	proto = alloca(len + 1);
	for (i = 0; i < len; ++i)
		proto[i] = gumbo_tolower(value[i]);
	proto[len] = 0;

	return string_set_contains(protocol_allowed, proto);
}

static bool
sanitize_class_attribute(const GoombaSanitizer *sanitizer,
		const GoombaElementSanitizer *element_f, GumboAttribute *attr)
{
	const StringSet *allowed_global = NULL;
	const StringSet *allowed_local = NULL;
	GumboStringBuffer buf;
	int valid_classes = 0;
	char *value, *end;
	
	if (sanitizer->class_allowed.size)
		allowed_global = &sanitizer->class_allowed;

	if (element_f && element_f->class_allowed.size)
		allowed_local = &element_f->class_allowed;

	/* No class filters, so everything goes through */
	if (!allowed_global && !allowed_local)
		return true;

	value = (char *)attr->value;
	end = value + strlen(value);

	while (value < end) {
		while (value < end && gumbo_isspace(*value))
			value++;

		if (value < end) {
			char *class = value;
			bool allowed = false;
			while (value < end && !gumbo_isspace(*value))
				value++;

			*value = 0;

			if (allowed_local &&
				string_set_contains(allowed_local, class))
				allowed = true;

			if (allowed_global &&
				string_set_contains(allowed_global, class))
				allowed = true;

			if (allowed) {
				if (!valid_classes)
					strbuf_init(&buf);
				else
					strbuf_puts(&buf, " ");

				strbuf_puts(&buf, class);
				valid_classes++;
			}

			value = value + 1;
		}
	}

	/* If we've found classes that passed the whitelist,
	 * we need to set the new value in the attribute */
	if (valid_classes) {
		strbuf_put(&buf, "\0", 1);
		gumbo_attribute_set_value(attr, buf.data);
		strbuf_free(&buf);
		return true;
	}

	return false;
}

static void
rewrite_attribute_prefix(GumboAttribute *attr, const char *name_prefix)
{
	char *new_value;
	int prefix_len = strlen(name_prefix);
	int value_len = strlen(attr->value);

	if (!value_len)
		return;

	if (value_len >= prefix_len &&
		!memcmp(attr->value, name_prefix, prefix_len))
		return;

	new_value = alloca(prefix_len + value_len + 1);
	memcpy(new_value, name_prefix, prefix_len);
	memcpy(new_value + prefix_len, attr->value, value_len + 1);

	gumbo_attribute_set_value(attr, new_value);
}

static bool
should_keep_attribute(const GoombaSanitizer *sanitizer,
	const GoombaElementSanitizer *element_f, GumboAttribute *attr)
{
	bool whitelisted = false;

	if (element_f && string_set_contains(&element_f->attr_allowed, attr->name))
		whitelisted = true;

	if (!whitelisted && string_set_contains(&sanitizer->attr_allowed, attr->name))
		whitelisted = true;

	if (!whitelisted)
		return false;
	
	if (strlen(attr->value) > MAX_ATTR_VALUE_LENGTH)
		return false;

	if (element_f && element_f->protocols) {
		GoombaProtocolSanitizer *proto = element_f->protocols;
		while (proto) {
			if (!strcmp(attr->name, proto->name)) {
				if (!has_allowed_protocol(&proto->allowed, attr))
					return false;
				break;
			}
			proto = proto->next;
		}
	}

	if (!strcmp(attr->name, "class")) {
		if (!sanitize_class_attribute(sanitizer, element_f, attr))
			return false;
	}

	if (sanitizer->name_prefix &&
		(!strcmp(attr->name, "id") || !strcmp(attr->name, "name") ||
		!strcmp(attr->name, "aria-labelledby") || !strcmp(attr->name, "aria-describedby"))) {
		rewrite_attribute_prefix(attr, sanitizer->name_prefix);
	}

	return true;
}

static bool
sanitize_attributes(const GoombaSanitizer *sanitizer, GumboElement *element)
{
	GumboVector *attributes = &element->attributes;
	GoombaElementSanitizer *element_f = try_find_element(sanitizer, element->tag);
	unsigned int x;

	for (x = 0; x < attributes->length; ++x) {
		GumboAttribute *attr = attributes->data[x];

		if (!should_keep_attribute(sanitizer, element_f, attr)) {
			gumbo_element_remove_attribute_at(element, x);
			x--;
			continue;
		}
	}

	if (element_f && element_f->attr_required.size) {
		StringSet *required = &element_f->attr_required;

		if (string_set_contains(required, "*")) {
			return attributes->length > 0;
		}

		for (x = 0; x < attributes->length; ++x) {
			GumboAttribute *attr = attributes->data[x];
			if (string_set_contains(required, attr->name))
				return true;
		}

		return false;
	}

	return true;
}

static void
sanitize_node(const GoombaSanitizer *sanitizer, context *ctx, GumboNode *node)
{
	switch (node->type) {
	case GUMBO_NODE_DOCUMENT:
		sanitize_children(sanitizer, ctx, node, &node->v.document.children);
		break;

	case GUMBO_NODE_ELEMENT:
	case GUMBO_NODE_TEMPLATE:
		sanitize_children(sanitizer, ctx, node, &node->v.element.children);
		break;

	case GUMBO_NODE_TEXT:
	case GUMBO_NODE_WHITESPACE:
	case GUMBO_NODE_CDATA:
	case GUMBO_NODE_COMMENT:
		/* Nothing to sanitizer here afaict */
		break;
	}
}

void
goomba_node_sanitize(const GoombaSanitizer *sanitizer, GumboNode *node)
{
	context ctx;
	ctx.tags_visited = st_init_numtable();
	sanitize_node(sanitizer, &ctx, node);
	st_free_table(ctx.tags_visited);
}
