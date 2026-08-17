import logging
import logging.config

from app.core.logging.logging_config import LOGGING_CONFIG


logging.config.dictConfig(LOGGING_CONFIG)


def get_logger(name: str) -> logging.Logger:
    """
    Returns configured application logger.
    """

    return logging.getLogger(name)