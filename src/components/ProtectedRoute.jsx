import { Navigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { Box, CircularProgress } from "@mui/material"; // Import Material-UI components
import { useContext } from "react";

const ProtectedRoute = ({ children }) => {
	const { isAuthenticated } = useContext(AuthContext);

	// if (loadingAuth) {
	// 	// Show a loading indicator while authentication status is being determined
	// 	return (
	// 		<Box
	// 			sx={{
	// 				display: "flex",
	// 				justifyContent: "center",
	// 				alignItems: "center",
	// 				minHeight: "100vh",
	// 			}}
	// 		>
	// 			<CircularProgress />
	// 		</Box>
	// 	);
	// }
	console.log(isAuthenticated);

	if (!isAuthenticated) {
		// If not authenticated after loading, redirect to login
		return <Navigate to='/login' replace />;
	}

	// If authenticated, render the children
	return children;
};

export default ProtectedRoute;
