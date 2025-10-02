// src/context/AuthContext.jsx
import React, {
	createContext,
	useState,
	useEffect,
	useCallback,
	useRef,
} from "react";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

export const AuthContext = createContext();
const INACTIVITY_TIMEOUT_MS = 60 * 60 * 1000;
const SESSION_TIMEOUT_MS = 30 * 60 * 60 * 1000;
const REFRESH_THRESHOLD_MS = 20 * 60 * 1000;

const prefix = "providus_";
const key = (name) => `${prefix}${name}`;

export const AuthProvider = ({ children }) => {
	const navigate = useNavigate();

	// Hydrate state from localStorage with prefix
	const [token, setToken] = useState(() => localStorage.getItem(key("token")));
	const [role, setRole] = useState(() => localStorage.getItem(key("role")));
	const [userEmail, setUserEmail] = useState(() =>
		localStorage.getItem(key("email"))
	);

	// Ensure login_time exists if token exists
	useEffect(() => {
		const hasToken = !!localStorage.getItem(key("token"));
		const hasLoginTime = !!localStorage.getItem(key("login_time"));

		if (hasToken && !hasLoginTime) {
			localStorage.setItem(key("login_time"), Date.now().toString());
		}
	}, []);

	const [isAuthenticated, setIsAuthenticated] = useState(
		() => !!localStorage.getItem(key("token"))
	);

	/* ------------------------------------------------------------------ */
	/*  Login / logout helpers                                            */
	/* ------------------------------------------------------------------ */
	const login = useCallback((newToken, encryptedRole, email) => {
		localStorage.setItem(key("login_time"), Date.now().toString());
		localStorage.setItem(key("token"), newToken);
		localStorage.setItem(key("role"), encryptedRole);
		localStorage.setItem(key("email"), email);
		sessionStorage.clear();
		setToken(newToken);
		setIsAuthenticated(true);
		toast.success("Logged in successfully!");
	}, []);

	const sessionCheckRef = useRef(null);
	const inactivityTimerRef = useRef(null);

	const clearSessionInterval = () => {
		if (sessionCheckRef.current) {
			clearInterval(sessionCheckRef.current);
			sessionCheckRef.current = null;
		}
	};

	const logout = useCallback(
		(message = "You have been logged out.") => {
			if (inactivityTimerRef.current) clearTimeout(inactivityTimerRef.current);
			clearSessionInterval();

			// Only clear keys starting with prefix
			Object.keys(localStorage).forEach((k) => {
				if (k.startsWith(prefix)) localStorage.removeItem(k);
			});
			Object.keys(sessionStorage).forEach((k) => {
				if (k.startsWith(prefix)) sessionStorage.removeItem(k);
			});

			setToken(null);
			setRole(null);
			setUserEmail(null);
			setIsAuthenticated(false);
			toast.info(message);
			navigate("/", { replace: true });
		},
		[navigate]
	);

	const refreshToken = useCallback(async () => {
		try {
			const oldToken = localStorage.getItem(key("token"));
			if (!oldToken) {
				return toast.error("No token found");
			}
			const res = await fetch(
				"https://providusbulk.approot.ng/refresh_token.php",
				{
					method: "POST",
					headers: {
						Authorization: `Bearer ${oldToken}`,
					},
				}
			);
			const data = await res.json();
			if (data?.token) {
				localStorage.setItem(key("token"), data.token);
				setToken(data.token);
			} else {
				throw new Error("Invalid token response");
			}
		} catch (err) {
			console.error("Token refresh failed:", err);
			logout("Session expired. Please log in again.");
		}
	}, [logout]);

	/* ------------------------------------------------------------------ */
	/*  Inactivity timeout                                                */
	/* ------------------------------------------------------------------ */
	const resetInactivityTimer = useCallback(() => {
		if (inactivityTimerRef.current) {
			clearTimeout(inactivityTimerRef.current);
		}
		if (isAuthenticated) {
			inactivityTimerRef.current = setTimeout(() => {
				logout("You were logged out due to inactivity.");
			}, INACTIVITY_TIMEOUT_MS);
		}
	}, [isAuthenticated, logout]);

	useEffect(() => {
		const events = ["mousemove", "keydown", "touchstart", "scroll"];
		events.forEach((e) => window.addEventListener(e, resetInactivityTimer));

		resetInactivityTimer();

		return () => {
			events.forEach((e) =>
				window.removeEventListener(e, resetInactivityTimer)
			);
			if (inactivityTimerRef.current) clearTimeout(inactivityTimerRef.current);
		};
	}, [resetInactivityTimer]);

	/* ------------------------------------------------------------------ */
	/*  24-hour session timeout                                           */
	/* ------------------------------------------------------------------ */
	useEffect(() => {
		if (!isAuthenticated || !token) return;

		const checkSession = () => {
			const loginTime = parseInt(localStorage.getItem(key("login_time")), 10);
			if (Number.isNaN(loginTime)) return;

			if (Date.now() - loginTime > SESSION_TIMEOUT_MS) {
				logout("Your session has expired. Please log in again.");
			}
		};

		checkSession();
		sessionCheckRef.current = setInterval(checkSession, 5 * 1000);

		return () => clearSessionInterval();
	}, [isAuthenticated, token, logout]);

	useEffect(() => {
		if (!isAuthenticated || !token) return;

		const checkTokenExpiry = () => {
			try {
				const payloadBase64 = token.split(".")[1];
				const payloadJson = atob(payloadBase64);
				const payload = JSON.parse(payloadJson);

				if (!payload.exp) return;

				const now = Date.now();
				const expTime = payload.exp * 1000;
				const timeLeft = expTime - now;

				if (timeLeft < REFRESH_THRESHOLD_MS && timeLeft > 0) {
					refreshToken();
				}
			} catch (err) {
				console.error("Failed to parse token:", err);
			}
		};

		const interval = setInterval(checkTokenExpiry, 30 * 1000);
		checkTokenExpiry();

		return () => clearInterval(interval);
	}, [isAuthenticated, token, refreshToken]);

	return (
		<AuthContext.Provider
			value={{ isAuthenticated, token, role, userEmail, login, logout }}
		>
			{children}
		</AuthContext.Provider>
	);
};
