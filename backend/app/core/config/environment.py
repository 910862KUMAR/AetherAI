from enum import Enum

from app.core.config.settings import settings


class Environment(str, Enum):
    DEVELOPMENT = "development"
    TESTING = "testing"
    STAGING = "staging"
    PRODUCTION = "production"


def get_environment() -> Environment:
    """
    Returns the current application environment.
    """

    return Environment(settings.ENVIRONMENT.lower())


def is_development() -> bool:
    return get_environment() == Environment.DEVELOPMENT


def is_testing() -> bool:
    return get_environment() == Environment.TESTING


def is_staging() -> bool:
    return get_environment() == Environment.STAGING


def is_production() -> bool:
    return get_environment() == Environment.PRODUCTION