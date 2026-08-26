import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";
import authService from "../services/authService";

const ACCESS_TOKEN_KEY = "aetherai_access_token";
const REFRESH_TOKEN_KEY = "aetherai_refresh_token";
const USER_KEY = "aetherai_user";

const AuthContext = createContext(null);

function isTokenValid(token) {
  if (!token) {
    return false;
  }

  try {
    const parts = token.split(".");

    if (parts.length !== 3) {
      return false;
    }

    const payload = JSON.parse(
      atob(
        parts[1]
          .replace(/-/g, "+")
          .replace(/_/g, "/")
      )
    );

    if (!payload.exp) {
      return false;
    }

    return payload.exp * 1000 > Date.now();
  } catch {
    return false;
  }
}

function getInitialAuthState() {
  const storedToken = localStorage.getItem(ACCESS_TOKEN_KEY);

  if (!isTokenValid(storedToken)) {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    localStorage.removeItem(USER_KEY);

    return {
      token: null,
      user: null,
    };
  }

  let storedUser = null;

  try {
    const userData = localStorage.getItem(USER_KEY);

    if (userData) {
      storedUser = JSON.parse(userData);
    }
  } catch {
    localStorage.removeItem(USER_KEY);
  }

  return {
    token: storedToken,
    user: storedUser,
  };
}

function AuthProvider({ children }) {
  const initialState = getInitialAuthState();

  const [user, setUser] = useState(initialState.user);
  const [accessToken, setAccessToken] = useState(
    initialState.token
  );

  const login = useCallback((authData) => {
    const token =
      authData?.access_token ||
      authData?.accessToken;

    const refreshToken =
      authData?.refresh_token ||
      authData?.refreshToken;

    if (!token || !isTokenValid(token)) {
      return false;
    }

    const userData = {
      id: authData?.user_id || null,
      fullName: authData?.full_name || "",
      email: authData?.email || "",
      isActive: authData?.is_active ?? true,
      isVerified: authData?.is_verified ?? false,
    };

    localStorage.setItem(
      ACCESS_TOKEN_KEY,
      token
    );

    if (refreshToken) {
      localStorage.setItem(
        REFRESH_TOKEN_KEY,
        refreshToken
      );
    }

    localStorage.setItem(
      USER_KEY,
      JSON.stringify(userData)
    );

    setAccessToken(token);
    setUser(userData);

    return true;
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    localStorage.removeItem(USER_KEY);

    setAccessToken(null);
    setUser(null);
  }, []);

  const register = useCallback((userData) => {
    return authService.registerUser(userData);
  }, []);

  const value = useMemo(
    () => ({
      user,
      accessToken,
      isAuthenticated: Boolean(accessToken),
      login,
      logout,
      register,
      setUser,
    }),
    [
      user,
      accessToken,
      login,
      logout,
      register,
    ]
  );

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error(
      "useAuth must be used within an AuthProvider"
    );
  }

  return context;
}

export default AuthProvider;
