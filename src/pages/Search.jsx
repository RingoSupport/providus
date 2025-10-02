import { useState, useEffect } from "react";
import axios from "axios";
import { TextField, Button, Paper, Box, Typography } from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import LoadingSpinner from "../components/Loading";
import { toast } from "react-toastify";

// Error code descriptions
const errorCodeDescriptions = {
	"000": "Delivered",
	"0dc": "Absent Subscriber",
	206: "Absent Subscriber",
	"21b": "Absent Subscriber",
	"023": "Absent Subscriber",
	"027": "Absent Subscriber",
	"053": "Absent Subscriber",
	"054": "Absent Subscriber",
	"058": "Absent Subscriber",
	439: "Absent subscriber or ported subscriber or subscriber is barred",
	254: "Subscriber's phone inbox is full",
	220: "Subscriber's phone inbox is full",
	120: "Subscriber's phone inbox is full",
	"008": "Subscriber's phone inbox is full",
	255: "Invalid or inactive mobile number or subscriber's phone inbox is full",
	0: "Invalid or inactive mobile number or subscriber's phone inbox is full",
	"20b": "Invalid or inactive mobile number",
	"004": "Invalid or inactive mobile number",
	510: "Invalid or inactive mobile number",
	215: "Invalid or inactive mobile number",
	"20d": "Subscriber is barred on the network",
	130: "Subscriber is barred on the network",
	131: "Subscriber is barred on the network",
	222: "Network operator system failure",
	602: "Network operator system failure",
	306: "Network operator system failure",
	"032": "Network operator system failure or operator not supported",
	"085": "Subscriber is on DND",
	"065": "Message content or senderID is blocked on the promotional route",
	600: "Message content or senderID is blocked on the promotional route",
	"40a": "SenderID not whitelisted on the account",
	"082": "Network operator not supported",
	"00a": "SenderID is restricted by the operator",
	"078": "Restricted message content or senderID is blocked.",
	432: "Restricted message content or senderID is blocked.",
};

const SMSLogs = () => {
	const [number, setNumber] = useState("");
	const [messages, setMessages] = useState([]);
	const [loading, setLoading] = useState(false);

	const mapMessages = (rawMessages) => {
		return rawMessages.map((msg) => {
			const errorDescription =
				errorCodeDescriptions[msg.dlr_request?.toLowerCase?.()] ||
				errorCodeDescriptions[msg.dlr_request] ||
				"N/A";
			return {
				id: msg.id,
				sender: msg.senderid || "N/A",
				recipient: msg.msisdn || "N/A",
				message: msg.text || "N/A",
				status: msg.dlr_status || "N/A",
				network: msg.network || "N/A",
				date_sent: msg.created_at || "N/A",
				dlr_request: msg.dlr_request || "N/A",
				error_description: errorDescription,
			};
		});
	};

	// Fetch all messages on mount
	useEffect(() => {
		const fetchAllMessages = async () => {
			setLoading(true);

			const token = localStorage.getItem("providustoken");

			try {
				const response = await axios.get(
					" https://providus.approot.ng/server/message.php",
					{
						headers: {
							Authorization: `Bearer ${token}`,
						},
					}
				);
				if (
					response.data.status === "success" &&
					response.data.results.length
				) {
					setMessages(mapMessages(response.data.results));
				} else {
					toast.info("No messages found.");
					setMessages([]);
				}
			} catch (error) {
				console.error("Failed to fetch all messages", error);
				toast.error("Failed to load messages.");
			} finally {
				setLoading(false);
			}
		};

		fetchAllMessages();
	}, []);

	const handleSearch = async (e) => {
		e.preventDefault();
		if (!number) {
			toast.error("Please enter a phone number");
			return;
		}

		// Normalize number to start with '234'
		let normalizedNumber = number.trim();
		normalizedNumber = normalizedNumber.replace(/\D/g, ""); // remove non-digits

		if (normalizedNumber.startsWith("0")) {
			normalizedNumber = "234" + normalizedNumber.slice(1);
		} else if (normalizedNumber.startsWith("234")) {
			// already normalized
		} else if (
			normalizedNumber.length === 10 &&
			normalizedNumber.startsWith("9")
		) {
			normalizedNumber = "234" + normalizedNumber;
		} else if (normalizedNumber.length === 10) {
			normalizedNumber = "234" + normalizedNumber;
		} else {
			toast.error("Invalid phone number format");
			return;
		}

		setLoading(true);

		const token = localStorage.getItem("providustoken");

		try {
			const response = await axios.get(
				` https://providus.approot.ng/server/searchMessages.php?phone=${encodeURIComponent(
					normalizedNumber
				)}`,
				{
					headers: {
						Authorization: `Bearer ${token}`,
					},
				}
			);

			if (
				response.data.status === "success" &&
				response.data.results.length > 0
			) {
				setMessages(mapMessages(response.data.results));
			} else if (
				response.data.status === "success" &&
				response.data.results.length === 0
			) {
				toast.info("No messages found for this number");
				setMessages([]);
			} else {
				toast.error("Error fetching messages");
				setMessages([]);
			}
		} catch (error) {
			console.error("Search failed", error);
			toast.error("Search failed. Please try again.");
			setMessages([]);
		} finally {
			setLoading(false);
		}
	};

	const columns = [
		{ field: "id", headerName: "ID", width: 70 },
		{ field: "sender", headerName: "Sender", width: 120 },
		{ field: "recipient", headerName: "Recipient", width: 180 },
		{ field: "message", headerName: "Message", flex: 1 },
		{ field: "status", headerName: "Status", width: 120 },
		{ field: "network", headerName: "Network", width: 120 },
		{ field: "date_sent", headerName: "Date Sent", width: 180 },
		{ field: "dlr_request", headerName: "Error Code", width: 120 },
		{ field: "error_description", headerName: "Error Description", flex: 1 },
	];

	return (
		<Box className='p-4 text-[#7F5C0A]'>
			<Typography variant='h5' gutterBottom fontWeight='bold'>
				🔍 Search SMS Logs by Phone Number
			</Typography>

			<form onSubmit={handleSearch} className='flex items-center gap-4 mb-6'>
				<TextField
					label='Enter phone number'
					variant='outlined'
					size='small'
					value={number}
					onChange={(e) => setNumber(e.target.value)}
				/>
				<Button
					type='submit'
					variant='contained'
					sx={{ bgcolor: "#FDB813", color: "#7F5C0A", fontWeight: "bold" }}
				>
					Search
				</Button>
			</form>

			{loading ? (
				<LoadingSpinner />
			) : (
				<Paper elevation={3} sx={{ p: 2 }}>
					<DataGrid
						rows={messages}
						columns={columns}
						getRowId={(row) => row.id}
						loading={loading}
						pageSize={10}
						rowsPerPageOptions={[10, 25, 50]}
						disableSelectionOnClick
						showToolbar
						pagination
					/>
				</Paper>
			)}
		</Box>
	);
};

export default SMSLogs;
