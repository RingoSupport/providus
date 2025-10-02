import { useEffect, useState } from "react";
import { Box, Typography, CircularProgress, Paper } from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import axios from "axios";
import { toast } from "react-toastify";

// Helper: convert country name to emoji flag
const getFlagEmoji = (countryCode) => {
	// Ensure countryCode is a string and has at least 2 characters for a valid flag
	if (
		!countryCode ||
		typeof countryCode !== "string" ||
		countryCode.length < 2
	) {
		return "🏳️"; // Default flag for unknown/invalid codes
	}
	return String.fromCodePoint(
		...[...countryCode.toUpperCase()].map((c) => 127397 + c.charCodeAt())
	);
};

const InternationalRates = () => {
	const [loading, setLoading] = useState(false);
	const [rows, setRows] = useState([]);

	useEffect(() => {
		const fetchCountries = async () => {
			setLoading(true);
			try {
				// Define the fields you need
				// The API supports 'name', 'cca2' (for flag), 'status' (to filter unassigned)
				// We'll implicitly get 'name.common' and 'cca2' from 'name' and 'flags' fields
				const requestedFields = "name,cca2"; // Requesting only name and cca2 for the flag

				// Construct the URL with the fields query parameter
				// Note: The restcountries API documentation specifies 'fields' takes a comma-separated string.
				// We are requesting 'name' (which includes common, official, etc.) and 'cca2' for the flag.
				// The API implicitly provides name.common if 'name' is requested.
				const response = await axios.get(
					`https://restcountries.com/v3.1/all?fields=${requestedFields}`
				);

				// Filter out Nigeria and map the data
				const filtered = response.data
					.filter((country) => country.name?.common !== "Nigeria") // Use optional chaining for safety
					.map((country, index) => ({
						id: index + 1,
						name: country.name?.common || "Unknown Country", // Use optional chaining
						flag: getFlagEmoji(country.cca2 || "UN"), // Use optional chaining
						rate: "₦160 / SMS", // Static rate as per your existing code
					}));

				setRows(filtered.sort((a, b) => a.name.localeCompare(b.name)));
			} catch (err) {
				console.error("Error fetching country list:", err);
				toast.error("Failed to load country list");
			} finally {
				setLoading(false);
			}
		};

		fetchCountries();
	}, []);

	const columns = [
		{ field: "id", headerName: "#", width: 60 },
		{
			field: "flag",
			headerName: "Flag",
			width: 100,
			renderCell: (params) => (
				<span style={{ fontSize: "1.5rem" }}>{params.value}</span>
			),
		},
		{ field: "name", headerName: "Country", width: 200 },
		{
			field: "rate",
			headerName: "Rate",
			width: 150,
			cellClassName: "font-bold text-[#7F5C0A]",
		},
	];

	return (
		<Box className='p-6 text-[#7F5C0A]'>
			<Typography variant='h5' fontWeight='bold'>
				🌍 International SMS Rates
			</Typography>

			<Paper elevation={3} sx={{ p: 4, mt: 3 }}>
				{loading ? (
					<Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
						<CircularProgress />
					</Box>
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
						}}
					/>
				)}
			</Paper>
		</Box>
	);
};

export default InternationalRates;
