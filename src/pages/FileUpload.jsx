import React, { useState } from "react";
import axios from "axios";
import { Button } from "@mui/material";
import { TextField } from "@mui/material";
import { UploadIcon } from "lucide-react";
import { styled } from "@mui/material/styles";
import { toast } from "react-toastify";

const FileUploadServer = () => {
	const [file, setFile] = useState();
	const [text, setText] = useState("");
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState();

	const handleFileChange = (e) => {
		if (e.target.files && e.target.files[0]) {
			setFile(e.target.files[0]);
			setError(null); // Clear previous errors
		}
	};

	const handleSubmit = async (e) => {
		e.preventDefault();
		setLoading(true);
		setError(null);

		if (!file) {
			setError("Please select a file to upload.");
			setLoading(false);
			return;
		}

		if (!text.trim()) {
			setError("Please enter the text message.");
			setLoading(false);
			return;
		}

		const formData = new FormData();
		formData.append("file", file);
		formData.append("text", text);

		try {
			const token = localStorage.getItem("providus_token");
			const response = await axios.post(
				"https://providusbulk.approot.ng//process_file.php", //  Endpoint
				formData,
				{
					headers: {
						"Content-Type": "multipart/form-data", // Important for files
						Authorization: `Bearer ${token}`,
					},
				}
			);
			console.log(response.data);

			if (response.data.status) {
				toast.success(response.data.message || "SMS Queued successfully");

				setFile(null); //clear
				setText("");
			} else {
				setError(response.data.message || "Failed to process file.");
			}
		} catch (err) {
			setError(err.message || "An error occurred during upload.");
		} finally {
			setLoading(false);
		}
	};

	const VisuallyHiddenInput = styled("input")({
		clip: "rect(0 0 0 0)",
		clipPath: "inset(50%)",
		height: 1,
		overflow: "hidden",
		position: "absolute",
		bottom: 0,
		left: 0,
		whiteSpace: "nowrap",
		width: 1,
	});

	return (
		<div className='min-h-screen flex items-center justify-center bg-gray-100 px-4'>
			<div className='w-full max-w-lg bg-white p-8 rounded-lg shadow-md'>
				<h2 className='text-2xl font-bold text-center text-gray-800 mb-6'>
					Upload File for Processing
				</h2>

				{error && (
					<div className='mb-4 text-sm text-red-600 text-center border border-red-500 rounded-md p-2 bg-red-100'>
						<span className='font-semibold'>Error: </span>
						{error}
					</div>
				)}

				<form onSubmit={handleSubmit} className='space-y-6'>
					<div>
						<label
							htmlFor='file'
							className='block text-sm font-medium text-gray-700'
						>
							Upload File (CSV, Excel)
						</label>
						<Button
							component='label'
							variant='outlined'
							className='w-full mt-1'
						>
							<UploadIcon className='mr-2' />
							Choose File
							<VisuallyHiddenInput
								type='file'
								accept='.csv,.xlsx,.xls'
								onChange={handleFileChange}
							/>
						</Button>
						{file && (
							<p className='text-xs text-gray-500 mt-1'>
								Selected file: {file.name}
							</p>
						)}
					</div>

					<div>
						<label
							htmlFor='text'
							className='block text-sm font-medium text-gray-700'
						>
							Text Message
						</label>
						<TextField
							id='text'
							value={text}
							onChange={(e) => setText(e.target.value)}
							placeholder='Enter your SMS message here...'
							className='w-full'
							multiline
							rows={4}
							required
						/>
					</div>

					<Button
						type='submit'
						disabled={loading}
						className='w-full'
						variant='contained'
						color='primary'
					>
						{loading ? "Processing..." : "Upload File"}
					</Button>
				</form>
			</div>
		</div>
	);
};

export default FileUploadServer;
