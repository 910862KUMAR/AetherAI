class UserService:

    async def get_profile(self, user_id: str):
        return {
            "user_id": user_id
        }

    async def update_profile(self, user_id: str):
        return {
            "message": "Profile Updated"
        }