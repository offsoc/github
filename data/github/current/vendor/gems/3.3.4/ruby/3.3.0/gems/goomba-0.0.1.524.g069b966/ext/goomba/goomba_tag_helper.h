static bool
element_is_rcdata(GumboTag tag)
{ 
	switch (tag) {
	case GUMBO_TAG_STYLE:
	case GUMBO_TAG_SCRIPT:
	case GUMBO_TAG_XMP:
	case GUMBO_TAG_IFRAME:
	case GUMBO_TAG_NOEMBED:
	case GUMBO_TAG_NOFRAMES:
	case GUMBO_TAG_PLAINTEXT:
		return true;

	default:
		return false;
	}
}

static bool
element_is_void(GumboTag tag)
{
	switch (tag) {
	case GUMBO_TAG_AREA:
	case GUMBO_TAG_BASE:
	case GUMBO_TAG_BASEFONT:
	case GUMBO_TAG_BGSOUND:
	case GUMBO_TAG_BR:
	case GUMBO_TAG_COL:
	case GUMBO_TAG_EMBED:
	case GUMBO_TAG_FRAME:
	case GUMBO_TAG_HR:
	case GUMBO_TAG_IMG:
	case GUMBO_TAG_INPUT:
	case GUMBO_TAG_KEYGEN:
	case GUMBO_TAG_LINK:
	case GUMBO_TAG_MENUITEM:
	case GUMBO_TAG_META:
	case GUMBO_TAG_PARAM:
	case GUMBO_TAG_SOURCE:
	case GUMBO_TAG_TRACK:
	case GUMBO_TAG_WBR:
		return true;

	default:
		return false;
	}
}

