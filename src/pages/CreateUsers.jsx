import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import axios from "axios";

const colors = {
	errorBg: "#FEE2E2",
	errorBorder: "#FCA5A5",
	errorText: "#DC2626",
	bgWhite: "#FFFFFF",
	primary: "#FEB912", // bright yellow
	primaryHover: "#e4a900", // slightly darker yellow
	primaryRing: "#FFE58A", // light yellow ring glow
	textDark: "#2E444E", // deep teal/charcoal for text
	border: "#D1D5DB", // gray-300 for inputs
	bgLight: "#F9FAFB", // subtle light gray for page background
	bgWhite: "#FFFFFF",
};

const CreateUserPage = () => {
	const [email, setEmail] = useState("");
	const [fullName, setFullName] = useState("");
	const [role, setRole] = useState("");
	const [password, setPassword] = useState("");

	const currentRole = localStorage.getItem("role");

	const handleCreateUser = async (e) => {
		e.preventDefault();

		try {
			const payload = {
				email,
				role,
				password,
				full_name: fullName,
			};

			const token = localStorage.getItem("providus_token");

			const response = await axios.post(
				"https://providusbulk.approot.ng//create_user.php",
				payload,
				{
					headers: {
						Authorization: `Bearer ${token}`,
						"Content-Type": "application/json",
					},
				}
			);

			if (response.data.status) {
				toast.success("User created successfully!");
			} else {
				toast.error(response.data.message || "Failed to create user.");
			}
		} catch (error) {
			toast.error("An error occurred. Please try again later.");
		}
	};

	const allowedRoles = [
		{ value: "admin", label: "Admin" },
		{ value: "customer_support", label: "Customer Support" },
		{ value: "technical_support", label: "Technical Support" },
	];

	if (currentRole === "super_admin") {
		allowedRoles.unshift({ value: "super_admin", label: "Super Admin" });
	}

	return (
		<div
			className='min-h-screen flex items-center justify-center'
			style={{ backgroundColor: colors.bgLight }}
		>
			<div
				className='max-w-md w-full p-8 rounded-lg shadow-lg'
				style={{ backgroundColor: colors.bgWhite }}
			>
				<h2
					className='text-3xl font-semibold text-center mb-6'
					style={{ color: colors.primary }}
				>
					Create User
				</h2>
				<form onSubmit={handleCreateUser} className='space-y-6'>
					<div>
						<label
							htmlFor='fullname'
							className='font-medium'
							style={{ color: colors.textGray }}
						>
							Full Name
						</label>
						<input
							type='text'
							id='fullname'
							value={fullName}
							onChange={(e) => setFullName(e.target.value)}
							className='w-full p-3 mt-2 rounded-md focus:outline-none'
							style={{
								border: `1px solid ${colors.border}`,
								focusRing: colors.primaryRing,
							}}
							required
						/>
					</div>
					<div>
						<label
							htmlFor='email'
							className='font-medium'
							style={{ color: colors.textGray }}
						>
							Email
						</label>
						<input
							type='email'
							id='email'
							value={email}
							onChange={(e) => setEmail(e.target.value)}
							className='w-full p-3 mt-2 rounded-md focus:outline-none'
							style={{
								border: `1px solid ${colors.border}`,
								focusRing: colors.primaryRing,
							}}
							required
						/>
					</div>
					<div>
						<label
							htmlFor='role'
							className='font-medium'
							style={{ color: colors.textGray }}
						>
							Role
						</label>
						<select
							id='role'
							value={role}
							onChange={(e) => setRole(e.target.value)}
							className='w-full p-3 mt-2 rounded-md focus:outline-none'
							style={{
								border: `1px solid ${colors.border}`,
								focusRing: colors.primaryRing,
							}}
							required
						>
							<option value=''>Select Role</option>
							{allowedRoles.map((r) => (
								<option key={r.value} value={r.value}>
									{r.label}
								</option>
							))}
						</select>
					</div>
					<div>
						<label
							htmlFor='password'
							className='font-medium'
							style={{ color: colors.textGray }}
						>
							Password
						</label>
						<input
							type='password'
							id='password'
							value={password}
							onChange={(e) => setPassword(e.target.value)}
							className='w-full p-3 mt-2 rounded-md focus:outline-none'
							style={{
								border: `1px solid ${colors.border}`,
								focusRing: colors.primaryRing,
							}}
							required
						/>
					</div>
					<button
						type='submit'
						className='w-full py-3 mt-4 font-semibold rounded-lg focus:outline-none'
						style={{
							backgroundColor: colors.primary,
							color: colors.bgWhite,
						}}
						onMouseOver={(e) =>
							(e.currentTarget.style.backgroundColor = colors.primaryHover)
						}
						onMouseOut={(e) =>
							(e.currentTarget.style.backgroundColor = colors.primary)
						}
					>
						Create User
					</button>
				</form>
			</div>
		</div>
	);
};

export default CreateUserPage;
