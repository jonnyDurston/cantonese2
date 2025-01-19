"""
Template dependency that will be injected in
"""

import re
from fastapi.templating import Jinja2Templates


def get_jinja_templates():
    """
    Gets jinja templates
    """
    return templates


colornum_pattern = re.compile(r"\d")


def colornum_format(match):
    """
    Applies different color to each number
    """
    return rf'<span class="jyutping-number-{match.group(0)}">{match.group(0)}</span>'


def colornum(text: str):
    """
    Colors a certain number (used for styled jyutping)
    """
    return re.sub(colornum_pattern, colornum_format, text)


templates = Jinja2Templates(directory="web")
templates.env.filters["colornum"] = colornum
