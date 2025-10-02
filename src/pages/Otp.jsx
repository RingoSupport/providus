// src/pages/OtpPage.jsx
import React, { useEffect, useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import axios from "axios";
import { AuthContext } from "../context/AuthContext";
import { encryptData } from "../utils/crypto";
import { AiFillBank } from "react-icons/ai";

const SecureAccessSVG = () => (
	<svg
		width='260'
		height='350'
		viewBox='0 0 260 350'
		fill='none'
		xmlns='http://www.w3.org/2000/svg'
		className='block max-w-full h-auto'
	>
		<rect
			x='10'
			y='10'
			width='240'
			height='330'
			rx='25'
			ry='25'
			fill='#7F5C0A'
		/>
		<rect
			x='80'
			y='120'
			width='100'
			height='120'
			rx='15'
			ry='15'
			fill='#FDB813'
		/>
		<path
			d='M130 50 C90 50 80 80 80 110 V120 H70 V150 H190 V120 H180 V110 C180 80 170 50 130 50 Z'
			fill='#FDB813'
		/>
		<path
			d='M130 55 C95 55 85 85 85 115 V120 H90 V140 H170 V120 H175 V115 C175 85 165 55 130 55 Z'
			fill='#7F5C0A'
		/>
		<circle cx='130' cy='180' r='12' fill='#7F5C0A' />
		<rect x='125' y='190' width='10' height='25' rx='3' ry='3' fill='#7F5C0A' />
		<text
			x='130'
			y='270'
			fontFamily='Arial, sans-serif'
			fontSize='22'
			fontWeight='700'
			fill='white'
			textAnchor='middle'
			letterSpacing='0.5'
		>
			Secure Access
		</text>
		<text
			x='130'
			y='298'
			fontFamily='Arial, sans-serif'
			fontSize='22'
			fontWeight='700'
			fill='white'
			textAnchor='middle'
			letterSpacing='0.5'
		>
			to Your SMS Portal
		</text>
	</svg>
);

const OtpPage = () => {
	const navigate = useNavigate();
	const { login } = useContext(AuthContext);

	const [otp, setOtp] = useState("");
	const [loading, setLoading] = useState(false);
	const email = localStorage.getItem("providus_email");

	const handleSubmit = async (e) => {
		e.preventDefault();
		setLoading(true);

		const tempToken = sessionStorage.getItem("providus_token");

		try {
			const { data } = await axios.post(
				"https://providusbulk.approot.ng/otp.php",
				{ otp },
				{ headers: { Authorization: `Bearer ${tempToken}` } }
			);

			if (data.status) {
				const encryptedRole = encryptData(data.role);
				login(data.token, encryptedRole, email);
				toast.success("OTP verified!");
				navigate("/dashboard");
			} else {
				const msg = data.message || "Invalid OTP.";
				toast.error(msg);
				localStorage.clear();
				sessionStorage.clear();

				if (msg.toLowerCase().includes("otp has expired")) {
					toast.info("Your OTP has expired. Please log in again.");
				}
				navigate("/");
			}
		} catch (err) {
			console.error("OTP verification error:", err);
			toast.error("Verification failed. Please try again.");
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		if (localStorage.getItem("providus_token")) {
			navigate("/dashboard", { replace: true });
		}
		if (!email) {
			navigate("/login", { replace: true });
		}
	}, [navigate, email]);

	return (
		<div className='min-h-screen flex flex-col items-center bg-white text-[#7F5C0A] font-inter'>
			{/* Header */}
			<div className='py-6 text-center flex items-center justify-center gap-2 text-3xl font-bold'>
				<AiFillBank className='text-[#FDB813]' />
				<span>PROVIDUS BANK</span>
			</div>

			{/* Content */}
			<div className='flex flex-1 flex-col md:flex-row items-center justify-center p-6 w-full max-w-6xl'>
				{/* SVG Side */}
				<div className='hidden md:flex w-full md:w-1/2 bg-[#7F5C0A] rounded-lg shadow-lg overflow-hidden p-6 mr-6 items-center justify-center'>
					<SecureAccessSVG />
				</div>

				{/* Form Side */}
				<div className='w-full md:w-1/2 flex items-center justify-center p-6 bg-white rounded-lg shadow-lg'>
					<div className='w-full max-w-md'>
						<h2 className='text-3xl font-extrabold mb-6 text-center text-[#7F5C0A]'>
							Verify OTP
						</h2>
						<p className='text-base text-gray-700 text-center mb-6'>
							An OTP was sent to{" "}
							<strong className='text-[#FDB813]'>
								{email || "your email"}
							</strong>
							. It will expire in 5 minutes.
						</p>
						<form onSubmit={handleSubmit} className='space-y-6'>
							<input
								id='otp'
								type='text'
								value={otp}
								onChange={(e) => setOtp(e.target.value)}
								placeholder='Enter OTP'
								className='w-full px-5 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-3 focus:ring-[#FDB813] transition duration-200 ease-in-out text-lg'
								required
								maxLength='6'
								pattern='\d{6}'
								title='Please enter a 6-digit OTP'
							/>
							<button
								type='submit'
								disabled={loading}
								className='w-full py-3 bg-[#FDB813] text-[#7F5C0A] font-bold rounded-lg hover:bg-[#e0a80f] focus:outline-none focus:ring-3 focus:ring-[#7F5C0A] transition duration-200 ease-in-out transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed'
							>
								{loading ? "Verifying…" : "Verify OTP"}
							</button>
						</form>
					</div>
				</div>
			</div>
		</div>
	);
};

export default OtpPage;
