class AetherAIException(Exception):
    def __init__(
        self,
        message: str,
        status_code: int = 500,
    ):
        self.message = message
        self.status_code = status_code
        super().__init__(message)


class ValidationException(AetherAIException):
    def __init__(self, message: str = "Validation Error"):
        super().__init__(message, 400)


class AuthenticationException(AetherAIException):
    def __init__(self, message: str = "Authentication Failed"):
        super().__init__(message, 401)


class AuthorizationException(AetherAIException):
    def __init__(self, message: str = "Access Denied"):
        super().__init__(message, 403)


class ResourceNotFoundException(AetherAIException):
    def __init__(self, message: str = "Resource Not Found"):
        super().__init__(message, 404)


class DatabaseException(AetherAIException):
    def __init__(self, message: str = "Database Error"):
        super().__init__(message, 500)