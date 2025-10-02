import { NavLink, Outlet, useNavigate, useLocation } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { AiFillDashboard } from "react-icons/ai";
import {
	MdLogout,
	MdPeople,
	MdInsertDriveFile,
	MdAccountBalanceWallet,
	MdPublic,
	MdExpandLess,
	MdExpandMore,
} from "react-icons/md";
import {
	FiMessageSquare,
	FiUpload,
	FiFileText,
	FiGrid,
	FiMenu,
	FiSend,
	FiUsers,
	FiSearch,
	FiFolderPlus,
	FiBarChart2,
	FiUserPlus,
	FiDownload,
	FiShield,
	FiLayers,
} from "react-icons/fi";
import { useContext, useMemo, useState } from "react";
import { decryptData } from "../utils/crypto";

export default function DashboardLayout() {
	const { logout } = useContext(AuthContext);
	const navigate = useNavigate();
	const location = useLocation();
	const [showSidebar, setShowSidebar] = useState(true);
	const [openDropdown, setOpenDropdown] = useState(null);

	const handleLogout = () => {
		logout();
		navigate("/login");
	};

	const encryptedRole = localStorage.getItem("providus_role"); // or "_x9Rk1"
	const role = encryptedRole ? decryptData(encryptedRole) : null;
	const navItems = useMemo(
		() => [
			{ label: "Dashboard", icon: <AiFillDashboard />, path: "dashboard" },
			{ label: "Messages", icon: <FiMessageSquare />, path: "sms" },
			{
				label: "Bulk SMS",
				icon: <FiLayers />,
				children: [
					{ label: "Dashboard", icon: <FiGrid />, path: "bulksms/dashboard" },
					{
						label: "Upload File",
						icon: <FiUpload />,
						path: "dashboard/send-multiple-sms",
					},
					{
						label: "Uploaded Files",
						icon: <FiFileText />,
						path: "dashboard/uploaded_files",
						roles: ["admin", "super_admin"],
					},
					{ label: "Search", icon: <FiSearch />, path: "dashboard/search" },
					{
						label: "Create SMS Category",
						icon: <FiFolderPlus />,
						path: "dashboard/categories",
					},
					{ label: "Sent Messages", icon: <FiSend />, path: "dashboard/sent" },
					{
						label: "Summary",
						icon: <FiBarChart2 />,
						path: "dashboard/message-summary",
					},
					{
						label: "Logs",
						icon: <MdInsertDriveFile />,
						path: "dashboard/logs",
					},
				],
			},
			{
				label: "Users",
				icon: <MdPeople />,
				path: "dashboard/users",
				roles: ["admin", "super_admin"],
			},
			{
				label: "Create User",
				icon: <FiUserPlus />,
				path: "dashboard/create_user",
				roles: ["admin", "super_admin"],
			},
			{ label: "Logs", icon: <MdInsertDriveFile />, path: "logs" },
			{
				label: "Credit Wallet",
				icon: <MdAccountBalanceWallet />,
				path: "wallet/credit",
			},
			{ label: "Wallet Export", icon: <FiDownload />, path: "wallet-export" },
			{ label: "International Rates", icon: <MdPublic />, path: "rates" },
			{ label: "Audit Logs", icon: <FiShield />, path: "audit-logs" },
		],
		[role]
	);

	const toggleDropdown = (label) => {
		setOpenDropdown((prev) => (prev === label ? null : label));
	};

	// helper: is a section active if any of its children matches current path
	const isSectionActive = (children = []) =>
		children.some((c) => location.pathname.startsWith(`/${c.path}`));

	return (
		<div className='flex min-h-screen bg-gray-100'>
			{/* Sidebar */}
			<div
				className={`transition-all duration-300  ${
					showSidebar ? "w-64" : "w-16"
				} bg-[#7F5C0A] text-white flex-shrink-0 sticky top-0 h-screen overflow-y-auto`}
			>
				<div className='p-4 flex items-center justify-between'>
					<span className='text-white font-bold text-xl flex items-center gap-2'>
						<AiFillDashboard className='text-[#FDB813]' />
						{showSidebar && "PROVIDUS"}
					</span>
					<button
						className='md:hidden text-white'
						onClick={() => setShowSidebar(!showSidebar)}
					>
						<FiMenu size={20} />
					</button>
				</div>

				<nav className='flex flex-col mt-6 space-y-1'>
					{navItems
						.filter((item) => !item.roles || item.roles.includes(role))
						.map((item, idx) => {
							const isDropdown = !!item.children;
							const parentActive =
								(!isDropdown && location.pathname === `/${item.path}`) ||
								(isDropdown && isSectionActive(item.children));

							return (
								<div key={idx}>
									{/* Parent item */}
									<div
										onClick={() =>
											isDropdown
												? toggleDropdown(item.label)
												: navigate(item.path)
										}
										className={`flex items-center justify-between px-6 py-3 cursor-pointer transition font-medium
                    ${
											parentActive
												? "bg-[#FDB813] text-[#7F5C0A]"
												: "hover:bg-[#6f4c08] text-white"
										}`}
									>
										<div className='flex items-center'>
											<span className='text-xl'>{item.icon}</span>
											{showSidebar && (
												<span className='ml-3 truncate'>{item.label}</span>
											)}
										</div>
										{isDropdown && showSidebar && (
											<span
												className={`transition-transform duration-200 ${
													openDropdown === item.label ? "rotate-180" : ""
												}`}
											>
												<MdExpandMore size={20} />
											</span>
										)}
									</div>

									{/* Dropdown */}
									{isDropdown && openDropdown === item.label && showSidebar && (
										<div className='ml-3 mr-2 mt-1 rounded-lg bg-[#6f4c08]/40'>
											<div className='py-2'>
												{item.children
													.filter(
														(sub) => !sub.roles || sub.roles.includes(role)
													)
													.map((subItem, subIdx) => (
														<NavLink
															key={subIdx}
															to={`/${subItem.path}`}
															className={({ isActive }) =>
																`flex items-center gap-3 px-5 py-2.5 text-sm rounded-md mx-2 my-0.5 transition 
                                border-l-4 
                                ${
																	isActive
																		? "bg-[#FDB813] text-[#7F5C0A] border-[#7F5C0A]"
																		: "hover:bg-[#6f4c08] text-white border-transparent"
																}`
															}
															end={false}
														>
															<span className='text-base leading-none'>
																{subItem.icon ?? (
																	<FiSend className='text-base' />
																)}
															</span>
															<span className='truncate'>{subItem.label}</span>
														</NavLink>
													))}
											</div>
										</div>
									)}
								</div>
							);
						})}
				</nav>
			</div>

			{/* Main Content */}
			<div className='flex-1 flex flex-col overflow-hidden'>
				<header className='flex items-center justify-between px-6 py-4 bg-white shadow-sm border-b flex-shrink-0'>
					<h1 className='text-xl font-semibold text-[#7F5C0A]'>
						{location.pathname.replace("/", "").toUpperCase() || "DASHBOARD"}
					</h1>
					<div className='flex items-center gap-4'>
						<span className='hidden md:inline text-sm text-gray-600'>
							Welcome, Admin
						</span>
						<button
							onClick={handleLogout}
							className='flex items-center gap-2 px-3 py-2 text-sm text-white bg-red-600 hover:bg-red-700 rounded'
						>
							<MdLogout size={18} />
							<span className='hidden sm:inline'>Logout</span>
						</button>
					</div>
				</header>

				<main className='flex-1 p-6 bg-gray-50 overflow-y-auto overflow-x-auto'>
					<Outlet />
				</main>
			</div>
		</div>
	);
}
