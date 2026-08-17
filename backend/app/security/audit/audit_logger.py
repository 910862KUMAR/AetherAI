import logging

logger = logging.getLogger("aetherai.audit")


def log_event(
    user_id: str,
    action: str,
    resource: str,
    ip_address: str,
) -> None:
    """
    Audit log.
    """

    logger.info(
        "USER=%s ACTION=%s RESOURCE=%s IP=%s",
        user_id,
        action,
        resource,
        ip_address,
    )