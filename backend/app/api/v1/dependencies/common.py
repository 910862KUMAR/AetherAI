from fastapi import Query


def get_pagination(
    page: int = Query(1, ge=1),
    size: int = Query(20, ge=1, le=100),
):
    return {
        "page": page,
        "size": size,
        "offset": (page - 1) * size,
    }