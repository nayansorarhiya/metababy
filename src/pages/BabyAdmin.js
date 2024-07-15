import React, { useEffect, useState, useContext } from "react";

import Box from "@mui/material/Box";

import Paper from '@mui/material/Paper';
import Container from '@mui/material/Container';
import { Avatar, Button, Card, CardContent, CardHeader, CircularProgress, Grid, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Tooltip, Typography } from "@mui/material";

import useTheme from '@mui/styles/useTheme';
import { API } from '../config';
import useApi from "../hooks/useApi";
import Row from "../components/Row";

const baseUrl = API.SERVER;


const BabyAdmin = () => {
    const api = useApi();
    const [rows, setRows] = useState([]);
    const theme = useTheme();

   
    async function getPendingRows() {
        const datalist = await api.getPendingRecord();
        const rows = datalist.map((ele,i) => {
            return {
                ...ele,
                pending: false,
                i
            }
        })
        setRows(rows);
    }
    
    useEffect(async () => {
        getPendingRows();
    }, [])

    return (
        <Box sx={{
            padding: theme => theme.spacing(2, 6),
            height: "100%",
            overflow: "auto",
            [theme.breakpoints.down("sm")]: {
                padding: theme.spacing(1, 1)
            }
        }}>
            <Container maxWidth="lg">
                <Box sx={{ mt: 5, mb: 2 }}>
                    <Typography sx={{ fontWeight: 700, fontSize: '20px' }}>Referral Pending List</Typography>
                </Box>
                <TableContainer component={Paper}>
                    <Table sx={{ minWidth: 350 }} aria-label="simple table">
                        <TableHead>
                            <TableRow>
                                <TableCell>Date</TableCell>
                                <TableCell align="center">Referrer</TableCell>
                                <TableCell align="center">User</TableCell>
                                <TableCell align="center">Action</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {rows.length != 0 ? rows.map((row, i) => {
                                return (
                                    <Row key={i} i={i} row={row} />
                                )
                            }) : <TableRow> <TableCell colSpan={4}> <Box sx={{ display: 'flex', justifyContent: 'center' }}>No Account in pending list </Box></TableCell>

                            </TableRow>}

                        </TableBody>
                    </Table>
                </TableContainer>
            </Container>
        </Box>
    )
}

export default BabyAdmin;