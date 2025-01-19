"""
Template dependency that will be injected in
"""

from fastapi.templating import Jinja2Templates


templates = Jinja2Templates(directory="web")


def get_jinja_templates():
    """
    Gets jinja templates
    """
    return templates
