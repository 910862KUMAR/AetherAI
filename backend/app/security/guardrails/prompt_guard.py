import re

BLOCKED_PATTERNS = [
    r"ignore\s+previous\s+instructions",
    r"system\s+prompt",
    r"developer\s+message",
    r"bypass",
    r"jailbreak",
    r"disable\s+safety",
    r"prompt\s+injection",
]


def validate_prompt(prompt: str) -> str:
    """
    Validate and sanitize user prompts.
    """

    if not prompt or not prompt.strip():
        raise ValueError("Prompt cannot be empty.")

    cleaned_prompt = prompt.strip()

    for pattern in BLOCKED_PATTERNS:
        if re.search(pattern, cleaned_prompt, re.IGNORECASE):
            raise ValueError(
                "Prompt contains restricted content."
            )

    return cleaned_prompt