import { useState, useEffect, useContext } from "react";
import axios from "axios";
import {
	Box,
	Button,
	TextField,
	Dialog,
	DialogTitle,
	DialogContent,
	DialogActions,
	MenuItem,
	IconButton,
	Paper,
	Typography,
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import { toast } from "react-toastify";
import { Edit, Delete } from "@mui/icons-material";
import CircularProgress from "@mui/material/CircularProgress";
import { AuthContext } from "../context/AuthContext";

const roles = [
	{ value: "user", label: "User" },
	{ value: "admin", label: "Admin" },
];

export const CreateUser = () => {
	const [users, setUsers] = useState([]);
	const [loading, setLoading] = useState(false);
	const [modalOpen, setModalOpen] = useState(false);
	const [editingUser, setEditingUser] = useState(null); // null means create mode
	const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
	const [userToDelete, setUserToDelete] = useState(null);
	const confirmDelete = (user) => {
		setUserToDelete(user);
		setDeleteDialogOpen(true);
	};

	const [form, setForm] = useState({
		email: "",
		password: "",
		fullname: "",
		role: "user",
	});

	const handleOpenModal = (user = null) => {
		setEditingUser(user);
		if (user) {
			// Edit mode
			setForm({
				email: user.email,
				password: "", // Require new password if changing
				fullname: user.fullname,
				role: user.role,
			});
		} else {
			// Create mode
			setForm({
				email: "",
				password: "",
				fullname: "",
				role: "user",
			});
		}
		setModalOpen(true);
	};

	const handleCloseModal = () => {
		setModalOpen(false);
		setEditingUser(null);
	};

	const handleChange = (e) => {
		setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
	};

	const handleSubmit = async () => {
		const url = editingUser
			? `https://providus.approot.ng/server/editUsers.php?id=${editingUser.id}`
			: `https://providus.approot.ng/server/createUser.php`;

		if (!form.email || (!editingUser && !form.password)) {
			toast.error("Email and password are required.");
			return;
		}

		try {
			const response = await axios.post(url, form, {
				headers: {
					Authorization: `Bearer ${token}`,
				},
			});
			if (response.data.status === "success" || response.data.status) {
				toast.success(
					editingUser ? "User updated successfully" : "User created"
				);
				handleCloseModal();
				fetchUsers();
			} else {
				toast.error(response.data.message || "Operation failed.");
			}
		} catch (err) {
			toast.error("Server error.");
		}
	};

	const handleConfirmDelete = async () => {
		if (!userToDelete) return;
		console.log(userToDelete);

		try {
			const res = await axios.delete(
				`https://providus.approot.ng/server/deleteUser.php?id=${userToDelete.id}`,
				{
					headers: { Authorization: `Bearer ${token}` },
				}
			);
			console.log(res.data);
			if (res.data.status) {
				toast.success("User deleted");
				fetchUsers();
			} else {
				toast.error("Failed to delete user");
			}
		} catch (err) {
			toast.error("Server error deleting user");
		} finally {
			setDeleteDialogOpen(false);
			setUserToDelete(null);
		}
	};

	const token = localStorage.getItem("providus_token");

	const columns = [
		{ field: "serial", headerName: "ID", width: 70 },
		{ field: "fullname", headerName: "Full Name", width: 180 },
		{ field: "email", headerName: "Email", width: 200 },
		{ field: "role", headerName: "Role", width: 100 },
		{
			field: "actions",
			headerName: "Actions",
			width: 180,
			renderCell: (params) => (
				<Box display='flex' gap={1}>
					<Button
						variant='outlined'
						size='small'
						color='primary'
						onClick={() => handleOpenModal(params.row)}
					>
						Edit
					</Button>
					<Button
						variant='outlined'
						size='small'
						color='error'
						onClick={() => confirmDelete(params.row)}
					>
						Delete
					</Button>
				</Box>
			),
		},
	];

	const fetchUsers = async () => {
		setLoading(true);
		try {
			const res = await axios.get(
				`https://providus.approot.ng/server/getUsers.php`,
				{
					headers: {
						Authorization: `Bearer ${token}`,
					},
				}
			);
			console.log(res.data);
			if (res.data.status === "success") {
				const usersWithId = res.data.users.map((user, index) => ({
					...user,
					serial: index + 1,
				}));
				setUsers(usersWithId);
			} else {
				toast.error("Failed to fetch users");
			}
		} catch (err) {
			toast.error("Server error fetching users");
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		fetchUsers();
	}, []);
	return (
		<Box className='p-6 text-[#7F5C0A]'>
			<Box className='flex justify-between items-center mb-4'>
				<Typography variant='h5' fontWeight='bold'>
					User Management
				</Typography>
				<Button
					variant='contained'
					onClick={() => handleOpenModal()}
					sx={{ bgcolor: "#FDB813", color: "#7F5C0A", fontWeight: "bold" }}
				>
					Add User
				</Button>
			</Box>

			<Paper elevation={3} sx={{ p: 2 }}>
				<DataGrid
					rows={users}
					columns={columns}
					getRowId={(row) => row.serial}
					pageSize={10}
					rowsPerPageOptions={[10]}
					// loading={loading}
				/>
			</Paper>

			<Dialog
				open={modalOpen}
				onClose={handleCloseModal}
				fullWidth
				maxWidth='sm'
			>
				<DialogTitle>
					{editingUser ? "Edit User" : "Create New User"}
				</DialogTitle>
				<DialogContent className='space-y-4 p-6'>
					<TextField
						fullWidth
						label='Email'
						name='email'
						value={form.email}
						onChange={handleChange}
					/>
					<TextField
						fullWidth
						label='Password'
						name='password'
						type='password'
						value={form.password}
						onChange={handleChange}
						placeholder={editingUser ? "Leave blank to keep existing" : ""}
					/>
					<TextField
						fullWidth
						label='Full Name'
						name='fullname'
						value={form.fullname}
						onChange={handleChange}
					/>
					<TextField
						select
						fullWidth
						label='Role'
						name='role'
						value={form.role}
						onChange={handleChange}
					>
						{roles.map((option) => (
							<MenuItem key={option.value} value={option.value}>
								{option.label}
							</MenuItem>
						))}
					</TextField>
				</DialogContent>
				<DialogActions>
					<Button onClick={handleCloseModal}>Cancel</Button>
					<Button
						variant='contained'
						sx={{ bgcolor: "#FDB813", color: "#7F5C0A", fontWeight: "bold" }}
						onClick={handleSubmit}
					>
						{editingUser ? "Update" : "Create"}
					</Button>
				</DialogActions>
			</Dialog>
			<Dialog
				open={deleteDialogOpen}
				onClose={() => setDeleteDialogOpen(false)}
			>
				<DialogTitle>Confirm Deletion</DialogTitle>
				<DialogContent>
					<Typography>
						Are you sure you want to delete{" "}
						<strong>{userToDelete?.fullname || "this user"}</strong>?
					</Typography>
				</DialogContent>
				<DialogActions>
					<Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
					<Button
						variant='contained'
						color='error'
						onClick={handleConfirmDelete}
					>
						Delete
					</Button>
				</DialogActions>
			</Dialog>
		</Box>
	);
};
