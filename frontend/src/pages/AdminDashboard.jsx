import { useState, useEffect } from "react";
import {
  Box,
  Typography,
  CircularProgress,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from "@mui/material";
import api from "../services/api";

const AdminDashboard = () => {
  const [calculations, setCalculations] = useState([]);
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [calcResponse, usersResponse] = await Promise.all([
          api.get("/calculations/all"),
          api.get("/users"), // You'll need to create this endpoint
        ]);
        setCalculations(calcResponse.data);
        setUsers(usersResponse.data);
      } catch (error) {
        console.error("Failed to fetch data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Admin Dashboard
      </Typography>

      <Box sx={{ mb: 4 }}>
        <Typography variant="h6" gutterBottom>
          Registered Users
        </Typography>
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Role</TableCell>
                <TableCell>Joined</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>{user.name}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell sx={{ textTransform: "capitalize" }}>
                    {user.role}
                  </TableCell>
                  <TableCell>
                    {new Date(user.createdAt).toLocaleDateString()}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>

      <Box>
        <Typography variant="h6" gutterBottom>
          All Calculations
        </Typography>
        {isLoading ? (
          <CircularProgress />
        ) : (
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>User</TableCell>
                  <TableCell>Type</TableCell>
                  <TableCell>Date</TableCell>
                  <TableCell align="right">Emissions (kg CO₂e)</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {calculations.map((calc) => (
                  <TableRow key={calc.id}>
                    <TableCell>{calc.user.name}</TableCell>
                    <TableCell sx={{ textTransform: "capitalize" }}>
                      {calc.type}
                    </TableCell>
                    <TableCell>
                      {new Date(calc.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell align="right">
                      {calc.result.toFixed(1)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Box>
    </Box>
  );
};

export default AdminDashboard;
