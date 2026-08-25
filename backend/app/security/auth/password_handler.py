import base64
import hashlib
import hmac
import secrets


_SALT_SIZE = 16
_KEY_LENGTH = 64
_N = 2**14
_R = 8
_P = 1


def hash_password(password: str) -> str:
    """
    Securely hash a password using scrypt with a random salt.
    """

    password_bytes = password.encode("utf-8")
    salt = secrets.token_bytes(_SALT_SIZE)

    derived_key = hashlib.scrypt(
        password_bytes,
        salt=salt,
        n=_N,
        r=_R,
        p=_P,
        dklen=_KEY_LENGTH,
    )

    encoded_salt = base64.urlsafe_b64encode(salt).decode("ascii")
    encoded_key = base64.urlsafe_b64encode(derived_key).decode("ascii")

    return (
        f"scrypt${_N}${_R}${_P}"
        f"${encoded_salt}"
        f"${encoded_key}"
    )


def verify_password(
    plain_password: str,
    hashed_password: str,
) -> bool:
    """
    Verify a password against a stored scrypt hash.
    """

    try:
        (
            algorithm,
            n,
            r,
            p,
            encoded_salt,
            encoded_key,
        ) = hashed_password.split("$")

        if algorithm != "scrypt":
            return False

        salt = base64.urlsafe_b64decode(encoded_salt.encode("ascii"))
        expected_key = base64.urlsafe_b64decode(
            encoded_key.encode("ascii")
        )

        actual_key = hashlib.scrypt(
            plain_password.encode("utf-8"),
            salt=salt,
            n=int(n),
            r=int(r),
            p=int(p),
            dklen=len(expected_key),
        )

        return hmac.compare_digest(
            actual_key,
            expected_key,
        )

    except (ValueError, TypeError):
        return False