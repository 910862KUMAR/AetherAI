from pathlib import Path

import httpx

from app.core.config.settings import settings


class SupabaseStorageService:

    @classmethod
    def _storage_url(cls, path: str = "") -> str:
        base_url = (
            f"{settings.SUPABASE_URL.rstrip('/')}"
            f"/storage/v1/object"
        )

        if path:
            return f"{base_url}/{path.lstrip('/')}"

        return base_url

    @classmethod
    def _headers(cls) -> dict[str, str]:
        return {
            "Authorization": f"Bearer {settings.SUPABASE_SECRET_KEY}",
            "apikey": settings.SUPABASE_SECRET_KEY,
        }

    @classmethod
    async def upload_file(
        cls,
        file_path: str,
        storage_path: str,
        content_type: str,
    ) -> str:

        path = Path(file_path)

        if not path.exists():
            raise FileNotFoundError(
                f"File not found: {file_path}"
            )

        data = path.read_bytes()

        url = cls._storage_url(
            f"{settings.SUPABASE_STORAGE_BUCKET}/{storage_path}"
        )

        headers = {
            **cls._headers(),
            "Content-Type": content_type,
            "x-upsert": "true",
        }

        async with httpx.AsyncClient(timeout=60.0) as client:
            response = await client.post(
                url,
                content=data,
                headers=headers,
            )

            response.raise_for_status()

        return (
            f"{settings.SUPABASE_STORAGE_BUCKET}/"
            f"{storage_path}"
        )

    @classmethod
    async def download_file(
        cls,
        storage_path: str,
        destination_path: str,
    ) -> str:

        bucket_path = (
            f"{settings.SUPABASE_STORAGE_BUCKET}/"
            f"{storage_path.lstrip('/')}"
        )

        url = cls._storage_url(bucket_path)

        destination = Path(destination_path)

        destination.parent.mkdir(
            parents=True,
            exist_ok=True,
        )

        async with httpx.AsyncClient(timeout=60.0) as client:
            response = await client.get(
                url,
                headers=cls._headers(),
            )

            response.raise_for_status()

        destination.write_bytes(response.content)

        return str(destination)

    @classmethod
    async def delete_file(
        cls,
        storage_path: str,
    ) -> None:

        bucket_path = (
            f"{settings.SUPABASE_STORAGE_BUCKET}/"
            f"{storage_path.lstrip('/')}"
        )

        url = cls._storage_url(bucket_path)

        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.delete(
                url,
                headers=cls._headers(),
            )

            response.raise_for_status()
