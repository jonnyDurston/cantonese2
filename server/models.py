from pydantic import BaseModel


class POSTVocabulary(BaseModel):
    cantonese: str
    jyutping: str
    english: str
    tags: list[str] = []


class POSTTag(BaseModel):
    tag_name: str
