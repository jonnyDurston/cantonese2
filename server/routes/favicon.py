from fastapi.responses import FileResponse


async def favicon():
    return FileResponse("static/images/favicon.ico")
