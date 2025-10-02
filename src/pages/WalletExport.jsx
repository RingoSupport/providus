import { useEffect, useState } from "react";
import {
	Box,
	Button,
	TextField,
	Paper,
	Typography,
	CircularProgress,
} from "@mui/material";
import { MdDownload } from "react-icons/md";
import { DataGrid } from "@mui/x-data-grid";
import axios from "axios";
import { toast } from "react-toastify";

const WalletExport = () => {
	const [startDate, setStartDate] = useState("");
	const [endDate, setEndDate] = useState("");
	const [loading, setLoading] = useState(false);
	const [rows, setRows] = useState([]);

	const defaultSortModel = [
		{
			field: "id",
			sort: "asc",
		},
	];

	const fetchWalletHistory = async () => {
		try {
			setLoading(true);
			let url = " https://providus.approot.ng/server/wallet_history.php";
			const params = [];

			if (startDate) params.push(`start_date=${startDate}`);
			if (endDate) params.push(`end_date=${endDate}`);

			if (startDate && endDate && startDate > endDate) {
				toast.error("Start date cannot be after end date");
				setLoading(false);
				return;
			}

			if (params.length > 0) url += `?${params.join("&")}`;
			const token = localStorage.getItem("providustoken");

			const response = await axios.get(url, {
				headers: {
					Authorization: `Bearer ${token}`,
				},
			});
			if (response.data.status === "success") {
				setRows(response.data.data);
			} else {
				toast.error(response.data.message || "Failed to load wallet history");
			}
		} catch (err) {
			console.error(err);
			toast.error("An error occurred while fetching wallet history");
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		fetchWalletHistory();
	}, []);

	const handleExport = () => {
		let baseUrl =
			" https://providus.approot.ng/server/export_wallet_history.php?export=1";
		const params = [];

		if (startDate) params.push(`start_date=${startDate}`);
		if (endDate) params.push(`end_date=${endDate}`);

		if (startDate && endDate && startDate > endDate) {
			toast.error("Start date cannot be after end date");
			return;
		}

		const finalUrl =
			params.length > 0 ? `${baseUrl}&${params.join("&")}` : baseUrl;

		window.open(finalUrl, "_blank");
	};

	const columns = [
		{ field: "id", headerName: "ID", width: 70 },
		{ field: "full_name", headerName: "Full Name", width: 200 },
		{ field: "amount", headerName: "Amount", width: 120 },
		{ field: "action", headerName: "Action", width: 120 },
		{ field: "reference", headerName: "Reference", width: 200 },
		{ field: "description", headerName: "Description", width: 250 },
		{ field: "balance_after", headerName: "Balance After", width: 160 },
		{ field: "created_at", headerName: "Date", width: 200 },
	];

	return (
		<Box className='p-6 text-[#7F5C0A]'>
			<Typography variant='h5' fontWeight='bold'>
				📦 Wallet History
			</Typography>

			<Paper elevation={3} sx={{ p: 4, mt: 3, mb: 4 }}>
				<Box className='flex flex-col md:flex-row gap-4 items-center'>
					<TextField
						label='Start Date'
						type='date'
						value={startDate}
						onChange={(e) => setStartDate(e.target.value)}
						InputLabelProps={{ shrink: true }}
					/>
					<TextField
						label='End Date'
						type='date'
						value={endDate}
						onChange={(e) => setEndDate(e.target.value)}
						InputLabelProps={{ shrink: true }}
					/>
					<Button
						variant='contained'
						startIcon={<MdDownload />}
						onClick={handleExport}
						sx={{ bgcolor: "#FDB813", color: "#7F5C0A", fontWeight: "bold" }}
					>
						Download CSV
					</Button>
					<Button
						variant='outlined'
						onClick={fetchWalletHistory}
						sx={{
							fontWeight: "bold",
							color: "#7F5C0A",
							borderColor: "#FDB813",
						}}
					>
						Refresh Data
					</Button>
				</Box>
			</Paper>

			{loading ? (
				<CircularProgress />
			) : (
				<DataGrid
					autoHeight
					rows={rows}
					columns={columns}
					getRowId={(row) => row.id}
					pageSizeOptions={[10, 25, 50]}
					initialState={{
						pagination: {
							paginationModel: { pageSize: 10 },
						},
						sorting: {
							sortModel: defaultSortModel,
						},
					}}
				/>
			)}
		</Box>
	);
};

export default WalletExport;
