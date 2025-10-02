import { useState, useEffect } from "react";
import axios from "axios";
import { TextField, Button, Paper, Box, Typography } from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import LoadingSpinner from "../components/Loading";
import { toast } from "react-toastify";

const AuditLogs = () => {
	const [fullname, setFullname] = useState("");
	const [logs, setLogs] = useState([]);
	const [loading, setLoading] = useState(false);

	const token = localStorage.getItem("providustoken");

	const fetchAuditLogs = async (filter = "") => {
		setLoading(true);
		try {
			const response = await axios.get(
				`https://providus.approot.ng/server/audit_logs.php${filter}`,
				{
					headers: {
						Authorization: `Bearer ${token}`,
					},
				}
			);
			if (response.data.status && response.data.data.length > 0) {
				const dataWithSerial = response.data.data.map((log, index) => ({
					...log,
					serial: index + 1,
				}));
				setLogs(dataWithSerial);
			} else {
				toast.info("No audit logs found.");
				setLogs([]);
			}
		} catch (err) {
			console.error("Failed to fetch audit logs", err);
			toast.error("Failed to load audit logs.");
			setLogs([]);
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		fetchAuditLogs();
	}, []);

	const handleSearch = async (e) => {
		e.preventDefault();
		const name = fullname.trim();
		if (!name) {
			toast.error("Please enter a full name");
			return;
		}
		const filter = `?fullname=${encodeURIComponent(name)}`;
		fetchAuditLogs(filter);
	};

	const columns = [
		{ field: "serial", headerName: "ID", width: 70 },
		{ field: "full_name", headerName: "User", width: 180 },
		{ field: "action_type", headerName: "Action", width: 160 },
		{ field: "resource_type", headerName: "Resource", width: 130 },
		{ field: "status", headerName: "Status", width: 110 },
		{ field: "ip_address", headerName: "IP Address", width: 150 },
		{
			field: "created_at",
			headerName: "Date",
			width: 200,
			valueFormatter: (params) => new Date(params).toLocaleString(),
		},
	];

	return (
		<Box className='p-4 text-[#7F5C0A]'>
			<Typography variant='h5' gutterBottom fontWeight='bold'>
				📜 Audit Trail Logs
			</Typography>

			<form onSubmit={handleSearch} className='flex items-center gap-4 mb-6'>
				<TextField
					label='Filter by full name'
					variant='outlined'
					size='small'
					value={fullname}
					onChange={(e) => setFullname(e.target.value)}
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
						rows={logs}
						columns={columns}
						getRowId={(row) => row.serial} // Use serial as unique ID
						pageSize={10}
						rowsPerPageOptions={[10, 25, 50]} // Only show 10 per page
						disableSelectionOnClick
						pageSizeOptions={[10, 20, 50, 100]}
						showToolbar
						initialState={{
							pagination: {
								paginationModel: { pageSize: 10 },
							},
							sorting: {
								sortModel: [{ field: "created_at", sort: "desc" }],
							},
						}}
					/>
				</Paper>
			)}
		</Box>
	);
};

export default AuditLogs;
