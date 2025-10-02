import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import axios from "axios";
import forge from "node-forge";
import { Eye, EyeOff } from "lucide-react"; // Eye icons

const STORAGE_PREFIX = "providus_";

const LoginForm = () => {
	const navigate = useNavigate();
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [showPassword, setShowPassword] = useState(false);
	const [loading, setLoading] = useState(false);

	const encryptPassword = async (password) => {
		try {
			const res = await fetch(
				"https://providusbulk.approot.ng/get_public_key.php"
			);
			const pem = await res.text();
			const publicKey = forge.pki.publicKeyFromPem(pem);
			const encrypted = publicKey.encrypt(password, "RSA-OAEP", {
				md: forge.md.sha1.create(),
			});
			return window.btoa(encrypted);
		} catch (error) {
			console.error("Encryption failed:", error);
			throw error;
		}
	};

	const handleSubmit = async (e) => {
		e.preventDefault();
		setLoading(true);

		try {
			const encryptedPassword = await encryptPassword(password);
			const response = await axios.post(
				"https://providusbulk.approot.ng/login.php",
				{
					email,
					password: encryptedPassword,
				}
			);
			console.log(response);

			if (response.data.status || response.data.success === "success") {
				toast.success("Successfully sent OTP to user");
				localStorage.setItem(STORAGE_PREFIX + "email", email);
				sessionStorage.setItem(STORAGE_PREFIX + "token", response.data.token);
				navigate("/otp");
			} else {
				toast.error(response.data.message || "Invalid credentials.");
			}
		} catch (error) {
			console.error("Login error:", error);
			toast.error("Encryption or login failed.");
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		const token = localStorage.getItem("providus_token");
		if (token) {
			navigate("/dashboard", { replace: true });
		}
	}, [navigate]);

	return (
		<div className='min-h-screen flex items-center justify-center bg-white text-[#7F5C0A] font-inter'>
			<div className='flex w-full max-w-5xl bg-white rounded-lg shadow-lg overflow-hidden border border-[#7F5C0A]/20'>
				{/* Left SVG Illustration */}
				<div className='hidden md:flex w-1/2 bg-[#FDB813]/10 items-center justify-center p-8'>
					<svg
						xmlns='http://www.w3.org/2000/svg'
						viewBox='0 0 640 512'
						className='w-3/4 h-auto'
					>
						<path
							fill='#7F5C0A'
							d='M320 64c-88.37 0-160 71.63-160 160v48h-24c-13.25 0-24 10.75-24 24v192c0 13.25 10.75 24 24 24h368c13.25 0 24-10.75 24-24V296c0-13.25-10.75-24-24-24h-24v-48c0-88.37-71.63-160-160-160zm0 48c61.86 0 112 50.14 112 112v48H208v-48c0-61.86 50.14-112 112-112z'
						/>
					</svg>
				</div>

				{/* Right Login Form */}
				<div className='w-full md:w-1/2 p-8'>
					<h2 className='text-3xl font-bold text-center mb-6'>
						SMS Portal Login
					</h2>
					<form onSubmit={handleSubmit} className='space-y-6'>
						{/* Email */}
						<div>
							<label
								htmlFor='email'
								className='block font-medium text-[#7F5C0A]'
							>
								Email
							</label>
							<input
								type='email'
								id='email'
								value={email}
								onChange={(e) => setEmail(e.target.value)}
								className='w-full p-3 mt-2 border border-[#7F5C0A]/40 rounded-md focus:outline-none focus:ring-2 focus:ring-[#FDB813]'
								required
							/>
						</div>

						{/* Password with toggle */}
						<div>
							<label
								htmlFor='password'
								className='block font-medium text-[#7F5C0A]'
							>
								Password
							</label>
							<div className='relative'>
								<input
									type={showPassword ? "text" : "password"}
									id='password'
									value={password}
									onChange={(e) => setPassword(e.target.value)}
									className='w-full p-3 mt-2 border border-[#7F5C0A]/40 rounded-md focus:outline-none focus:ring-2 focus:ring-[#FDB813] pr-10'
									required
								/>
								<button
									type='button'
									onClick={() => setShowPassword(!showPassword)}
									className='absolute inset-y-0 right-3 flex items-center text-[#7F5C0A]'
								>
									{showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
								</button>
							</div>
						</div>

						{/* Submit */}
						<button
							type='submit'
							disabled={loading}
							className='w-full py-3 mt-4 bg-[#FDB813] text-[#7F5C0A] font-semibold rounded-lg hover:bg-[#e4a512] focus:outline-none focus:ring-2 focus:ring-[#FDB813] disabled:opacity-50 disabled:cursor-not-allowed'
						>
							{loading ? "Signing In..." : "Sign In"}
						</button>
					</form>

					{/* Forgot Password */}
					<div className='mt-4 text-center'>
						<a
							href='/forgot-password'
							className='text-sm text-[#FDB813] hover:underline'
						>
							Forgot Password?
						</a>
					</div>
				</div>
			</div>
		</div>
	);
};

export default LoginForm;
