from fastapi import APIRouter, HTTPException, Request, status


def register_random_handler(router: APIRouter):
    @router.get("/random")
    async def handle_random(request: Request):
        song = await request.app.state.db.get_random_song()
        if song is None:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND)
        return song
