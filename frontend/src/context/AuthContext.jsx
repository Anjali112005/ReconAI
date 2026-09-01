import React, {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

const AuthContext = createContext(null);

const API_URL =
  import.meta.env.VITE_API_URL ||
  "http://localhost:8000";

// ============================================================
// AUTH PROVIDER
// ============================================================

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  const [token, setToken] = useState(
    localStorage.getItem("reconai_token")
  );

  const [loading, setLoading] = useState(true);

  // ============================================================
  // LOGOUT
  // ============================================================

  const logout = () => {
    localStorage.removeItem("reconai_token");

    setToken(null);
    setUser(null);
  };

  // ============================================================
  // AUTHENTICATED FETCH
  // ============================================================

  const authenticatedFetch = async (
    url,
    options = {}
  ) => {
    const currentToken =
      localStorage.getItem("reconai_token");

    if (!currentToken) {
      throw new Error(
        "You are not logged in."
      );
    }

    const headers = {
      ...(options.headers || {}),
      Authorization: `Bearer ${currentToken}`,
    };

    const response = await fetch(
      url,
      {
        ...options,
        headers,
      }
    );

    if (response.status === 401) {
      logout();

      throw new Error(
        "Your session has expired. Please login again."
      );
    }

    return response;
  };

  // ============================================================
  // AUTHORIZATION HEADERS
  // ============================================================

  const getAuthHeaders = () => {
    const currentToken =
      localStorage.getItem(
        "reconai_token"
      );

    if (!currentToken) {
      return {};
    }

    return {
      Authorization: `Bearer ${currentToken}`,
    };
  };

  // ============================================================
  // LOAD CURRENT USER
  // ============================================================

  const loadCurrentUser = async (
    authToken
  ) => {
    try {
      if (!authToken) {
        setUser(null);
        return null;
      }

      const response = await fetch(
        `${API_URL}/auth/me`,
        {
          method: "GET",

          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error(
          "Authentication expired."
        );
      }

      const userData =
        await response.json();

      setUser(userData);

      return userData;

    } catch (error) {

      console.error(
        "Failed to load current user:",
        error
      );

      localStorage.removeItem(
        "reconai_token"
      );

      setToken(null);
      setUser(null);

      return null;
    }
  };

  // ============================================================
  // INITIALIZE AUTHENTICATION
  // ============================================================

  useEffect(() => {

    const initializeAuth = async () => {

      const savedToken =
        localStorage.getItem(
          "reconai_token"
        );

      if (savedToken) {

        setToken(savedToken);

        await loadCurrentUser(
          savedToken
        );

      }

      setLoading(false);
    };

    initializeAuth();

  }, []);

  // ============================================================
// SIGNUP
// ============================================================

const signup = async ({
  name,
  email,
  password,
}) => {
  try {
    const response = await fetch(
      `${API_URL}/auth/signup`,
      {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          password,
        }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      let errorMessage =
        "Unable to create account.";

      if (Array.isArray(data.detail)) {
        errorMessage = data.detail
          .map((item) => item.msg)
          .join(", ");
      } else if (typeof data.detail === "string") {
        errorMessage = data.detail;
      }

      throw new Error(errorMessage);
    }

    return data;

  } catch (error) {
    console.error(
      "Signup error:",
      error
    );

    throw error;
  }
};

  // ============================================================
  // VERIFY EMAIL
  // ============================================================

  const verifyEmail = async (
    verificationToken
  ) => {

    try {

      if (!verificationToken) {

        throw new Error(
          "Verification link is missing or invalid."
        );

      }

      const response =
        await fetch(
          `${API_URL}/auth/verify-email?token=${encodeURIComponent(
            verificationToken
          )}`,
          {
            method: "GET",
          }
        );

      const data =
        await response.json();

      if (!response.ok) {

        throw new Error(
          data.detail ||
            "Unable to verify your email."
        );
      }

      return data;

    } catch (error) {

      console.error(
        "Email verification error:",
        error
      );

      throw error;
    }
  };

  // ============================================================
  // LOGIN
  // ============================================================

  const login = async (
    email,
    password
  ) => {

    try {

      const response =
        await fetch(
          `${API_URL}/auth/login`,
          {
            method: "POST",

            headers: {
              "Content-Type":
                "application/json",
            },

            body: JSON.stringify({
              email,
              password,
            }),
          }
        );

      const data =
        await response.json();

      if (!response.ok) {

        throw new Error(
          data.detail ||
            "Invalid email or password."
        );
      }

      // --------------------------------------------------------
      // SAVE JWT
      // --------------------------------------------------------

      if (data.access_token) {

        localStorage.setItem(
          "reconai_token",
          data.access_token
        );

        setToken(
          data.access_token
        );
      }

      // --------------------------------------------------------
      // SAVE USER
      // --------------------------------------------------------

      if (data.user) {

        setUser(
          data.user
        );
      }

      return data;

    } catch (error) {

      console.error(
        "Login error:",
        error
      );

      throw error;
    }
  };

  // ============================================================
  // CONTEXT VALUE
  // ============================================================

  const value = {

    user,

    token,

    loading,

    isAuthenticated:
      !!token && !!user,

    signup,

    verifyEmail,

    login,

    logout,

    loadCurrentUser,

    getAuthHeaders,

    authenticatedFetch,

    API_URL,
  };

  // ============================================================
  // PROVIDER
  // ============================================================

  return (
    <AuthContext.Provider
      value={value}
    >
      {children}
    </AuthContext.Provider>
  );
};

// ============================================================
// CUSTOM AUTH HOOK
// ============================================================

export const useAuth = () => {

  const context =
    useContext(AuthContext);

  if (!context) {

    throw new Error(
      "useAuth must be used inside AuthProvider"
    );
  }

  return context;
};