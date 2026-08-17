class RoleService:

    @staticmethod
    async def get_roles():

        return {
            "roles": [
                "admin",
                "user",
            ]
        }