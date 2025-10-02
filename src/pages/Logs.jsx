import { useState } from "react";
import {
	Box,
	Button,
	Tab,
	Tabs,
	TextField,
	Typography,
	Paper,
} from "@mui/material";
import dayjs from "dayjs";
import { toast } from "react-toastify";
import { MdDownload } from "react-icons/md"; // Material Design

const Logs = () => {
	const [tab, setTab] = useState(0);
	const [date, setDate] = useState(dayjs().format("YYYY-MM-DD"));

	const handleDownload = async () => {
		if (!date) {
			toast.error("Please select a date");
			return;
		}

		const link = document.createElement("a");
		link.href = ` https://providus.approot.ng/server/logDownload.php?date=${encodeURIComponent(
			date
		)}`;
		link.setAttribute("download", `providus_statistics_${date}.csv`);
		document.body.appendChild(link);
		link.click();
		document.body.removeChild(link);
		toast.success("CSV download started.");
	};

	return (
		<Box className='p-6 text-[#7F5C0A]'>
			<Typography variant='h5' fontWeight='bold' gutterBottom>
				🗂 Logs
			</Typography>

			<Paper elevation={3} sx={{ mt: 2 }}>
				<Tabs
					value={tab}
					onChange={(_, newValue) => setTab(newValue)}
					indicatorColor='primary'
					textColor='primary'
				>
					<Tab label='Daily Download' />
					<Tab label='File Download' />
				</Tabs>

				<Box sx={{ p: 3 }}>
					{tab === 0 && (
						<Box>
							<Typography variant='subtitle1' gutterBottom>
								Download statistics CSV for a specific date
							</Typography>

							<form className='flex flex-col sm:flex-row items-center gap-4 mt-4'>
								<TextField
									label='Select Date'
									type='date'
									value={date}
									onChange={(e) => setDate(e.target.value)}
									InputLabelProps={{ shrink: true }}
								/>
								<Button
									variant='contained'
									startIcon={<MdDownload />}
									onClick={handleDownload}
									sx={{
										bgcolor: "#FDB813",
										color: "#7F5C0A",
										fontWeight: "bold",
										minWidth: 160,
									}}
								>
									Download CSV
								</Button>
							</form>
						</Box>
					)}

					{tab === 1 && (
						<Box>
							<Typography variant='subtitle1'>
								Coming soon: Download previously exported files.
							</Typography>
						</Box>
					)}
				</Box>
			</Paper>
		</Box>
	);
};

export default Logs;
