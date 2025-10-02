import axios from "axios";
import { useEffect, useState } from "react";
import {
	PieChart,
	Pie,
	Cell,
	Tooltip,
	BarChart,
	Bar,
	XAxis,
	YAxis,
	CartesianGrid,
	Legend,
	ResponsiveContainer,
} from "recharts";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom"; // ⬅️ Import this
import LoadingSpinner from "../components/Loading";

const COLORS = ["#4CAF50", "#F44336", "#FF9800", "#9E9E9E"];

export default function Dashboard() {
	const [items, setItems] = useState([]);
	const [loading, setLoading] = useState(true);
	const [wallet, setWallet] = useState(0);

	const navigate = useNavigate();

	useEffect(() => {
		const token = localStorage.getItem("providus_token");

		if (!token) {
			navigate("/login");
			return;
		}

		const fetchData = async () => {
			setLoading(true);
			try {
				const { data } = await axios.get(
					"https://providus.approot.ng/server/dashboard.php",
					{
						headers: {
							Authorization: `Bearer ${token}`,
						},
					}
				);
				setItems(data.statistics || []);
				setWallet(data.wallet_balance || 0);
			} catch (error) {
				toast.error("Failed to load dashboard data.");
			} finally {
				setLoading(false);
			}
		};

		fetchData();
	}, []);

	if (loading) return <LoadingSpinner />;

	const totalDelivered = items.reduce(
		(sum, i) => sum + parseInt(i.delivered),
		0
	);
	const totalUndelivered = items.reduce(
		(sum, i) => sum + parseInt(i.undelivered),
		0
	);
	const totalPending = items.reduce((sum, i) => sum + parseInt(i.pending), 0);
	const totalOthers = items.reduce(
		(sum, i) =>
			sum +
			(parseInt(i.expired || 0) +
				parseInt(i.rejected || 0) +
				parseInt(i.unknown || 0)),
		0
	);
	const totalSMS =
		totalDelivered + totalUndelivered + totalPending + totalOthers;

	const pieData = [
		{ name: "Delivered", value: totalDelivered },
		{ name: "Undelivered", value: totalUndelivered },
		{ name: "Pending", value: totalPending },
		{ name: "Others", value: totalOthers },
	];

	return (
		<div className='p-8 text-[#7F5C0A] space-y-8'>
			{/* Greeting */}
			<div>
				<h1 className='text-3xl font-bold'>📊 SMS Dashboard</h1>
				<p className='mt-2 text-gray-600'>
					Welcome to the admin panel. Here’s an overview of today's stats.
				</p>
			</div>

			{/* Top Cards */}
			<div className='grid grid-cols-2 md:grid-cols-4 gap-4'>
				<div className='bg-white rounded-lg shadow p-4'>
					<p className='text-sm text-gray-500'>Wallet Balance</p>
					<p className='text-2xl font-bold text-[#FDB813]'>
						₦{Number(wallet).toLocaleString()}
					</p>
				</div>
				<div className='bg-white rounded-lg shadow p-4'>
					<p className='text-sm text-gray-500'>Total SMS</p>
					<p className='text-2xl font-bold'>{totalSMS}</p>
				</div>
				<div className='bg-white rounded-lg shadow p-4'>
					<p className='text-sm text-gray-500'>Delivered</p>
					<p className='text-2xl font-bold text-green-600'>{totalDelivered}</p>
				</div>
				<div className='bg-white rounded-lg shadow p-4'>
					<p className='text-sm text-gray-500'>Undelivered</p>
					<p className='text-2xl font-bold text-red-500'>{totalUndelivered}</p>
				</div>
			</div>

			{/* Statistics Table */}
			<div className='bg-white shadow-md rounded-lg p-4 overflow-x-auto'>
				<h3 className='text-lg font-semibold mb-4'>Network Statistics</h3>
				<table className='min-w-full table-auto text-sm'>
					<thead>
						<tr className='bg-gray-100 text-left'>
							<th className='py-2 px-4'>Network</th>
							<th className='py-2 px-4'>Delivered</th>
							<th className='py-2 px-4'>Pending</th>
							<th className='py-2 px-4'>Undelivered</th>
							<th className='py-2 px-4'>Expired</th>
							<th className='py-2 px-4'>Rejected</th>
							<th className='py-2 px-4'>Unknown</th>
							<th className='py-2 px-4'>Pages</th>
						</tr>
					</thead>
					<tbody>
						{items.map((row) => (
							<tr key={row.id} className='border-b'>
								<td className='py-2 px-4'>{row.network}</td>
								<td className='py-2 px-4'>{row.delivered}</td>
								<td className='py-2 px-4'>{row.pending}</td>
								<td className='py-2 px-4'>{row.undelivered}</td>
								<td className='py-2 px-4'>{row.expired}</td>
								<td className='py-2 px-4'>{row.rejected}</td>
								<td className='py-2 px-4'>{row.unknown}</td>
								<td className='py-2 px-4'>{row.pages}</td>
							</tr>
						))}
					</tbody>
				</table>
			</div>

			{/* Charts */}
			<div className='grid md:grid-cols-2 gap-6'>
				{/* Pie Chart */}
				<div className='bg-white shadow-md rounded-lg p-4'>
					<h3 className='text-lg font-semibold mb-4'>Delivery Breakdown</h3>
					<ResponsiveContainer width='100%' height={300}>
						<PieChart>
							<Pie
								data={pieData}
								dataKey='value'
								nameKey='name'
								cx='50%'
								cy='50%'
								outerRadius={100}
								label
							>
								{pieData.map((entry, index) => (
									<Cell
										key={`cell-${index}`}
										fill={COLORS[index % COLORS.length]}
									/>
								))}
							</Pie>
							<Tooltip />
						</PieChart>
					</ResponsiveContainer>
				</div>

				{/* Bar Chart */}
				<div className='bg-white shadow-md rounded-lg p-4'>
					<h3 className='text-lg font-semibold mb-4'>Messages by Network</h3>
					<ResponsiveContainer width='100%' height={300}>
						<BarChart data={items}>
							<CartesianGrid strokeDasharray='3 3' />
							<XAxis dataKey='network' />
							<YAxis />
							<Tooltip />
							<Legend />
							<Bar dataKey='delivered' fill='#4CAF50' name='Delivered' />
							<Bar dataKey='undelivered' fill='#F44336' name='Undelivered' />
							<Bar dataKey='pending' fill='#FF9800' name='Pending' />
						</BarChart>
					</ResponsiveContainer>
				</div>
			</div>
		</div>
	);
}
