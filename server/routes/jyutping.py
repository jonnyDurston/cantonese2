from re import sub
from fastapi import HTTPException
from pycantonese import characters_to_jyutping


async def jyutping(characters: str):
    """
    Returns the jyutping conversion of a number of Chinese characters
    """
    converted = characters_to_jyutping(characters)
    if None in [i[1] for i in converted]:
        raise HTTPException(400, "Invalid characters entered.")

    print(" ".join([sub(r"(?<=\d)", " ", i[1])[:-1] for i in converted]))

    return {"jyutping": " ".join([sub(r"(?<=\d)", " ", i[1])[:-1] for i in converted])}
