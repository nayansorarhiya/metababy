import React, { useEffect, useState } from "react";

import Box from "@mui/material/Box";

import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import Container from '@mui/material/Container';
import { Card, CardActions, CardContent, Typography } from "@mui/material";
import { useLocation } from "react-router-dom";
import Web3 from "web3";
import useActiveWeb3React from "../hooks/useActiveWeb3React";
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import ShareIcon from '@mui/icons-material/Share';

const baseUrl = "http://localhost:3003/";




function useQuery() {
    const { search } = useLocation();

    return React.useMemo(() => new URLSearchParams(search), [search]);
}

const Referral = () => {
    const [rows, setRows] = useState([]);
    const query = useQuery();
    const { account } = useActiveWeb3React()
    useEffect(() => {
        const ref = query.get("ref");
        if (ref && account) {
            if (Web3.utils.isAddress(ref)) {
                fetch(`${baseUrl}registerReferral`,
                    {
                        method: "post",
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({
                            from: ref,
                            to: account
                        })
                    }
                ).then(resp => {
                    console.log(ref);
                })
            }
        }
    }, [query, account]);

    useEffect(() => {
        console.log(account);
        if (account) {
            fetch(`${baseUrl}getReferral?account=${account}`)
                .then(resp => {
                    return resp.json();
                })
                .then((result) => {
                    const objs = result.result;
                    const arr = objs.map(ele => {
                        return { date: ele.created_at, account: ele.to_address }
                    });
                    console.log(arr);
                    setRows(arr);
                })
        }
    }, [account])

    return (
        <Container maxWidth="lg">
            {/* <Box sx={{ "display": "flex", justifyContent: "space-between", padding: "20px", }}>
                <Box sx={{ width: '50%' }}>
                    <Box>
                        <Typography sx={{ wordWrap: 'break-word', fontSize: '40px', fontWeight: 600, lineHeight: '48px' }}>
                            Invite your friends. Earn cryptocurrency together
                        </Typography>
                    </Box>
                    <Box sx={{ pt: 2, }}>
                        <Typography sx={{ fontSize: '16px', fontWeight: 400, lineHeight: '20px' }}>
                            <span>Earn up to
                                <span style={{ color: '#FFDB1C' }} > 20% </span>
                                from friends’ swap commission on Biswap and
                                <span style={{ color: '#FFDB1C' }} > 5% </span>
                                from their earnings on Farms &amp; Launchpools
                            </span>

                        </Typography>
                    </Box>
                </Box>
                <Box sx={{ minWidth: '40%' }}>
                    <Card sx={{ minWidth: '200px', background: 'linear-gradient(235deg, rgb(51, 111, 245) 4.05%, rgba(17, 81, 225, 0.32) 103.52%), rgb(7, 28, 60)', borderRadius: '24px' }}>
                        <CardContent>
                            <Typography sx={{ fontSize: 24, fontWeight: 600, lineHeight: '26px' }} color="text.primary">
                                My Referral Link
                            </Typography>
                            <Box sx={{ display: 'flex', mt: 2, whiteSpace: 'nowrap', overflow: 'hidden' }}>
                                <Box sx={{ width: { xs: '100%', sm: '80%', md: '90%', lg: '100%' }, minWidth: '150px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgb(14, 51, 130)', borderRadius: '8px', border: '1px solid white', padding: '8px 12px', }}>
                                    <Typography sx={{ fontSize: '14px' }} noWrap>
                                        https://biswap.org?ref=1d4d576c7b3063a0020d
                                    </Typography>
                                    <Box sx={{ display: 'flex', alignItems: 'center', pl: 1 }}>
                                        <ContentCopyIcon width='24' />
                                    </Box>
                                </Box>
                                <Box sx={{ background: 'rgb(14, 51, 130)', borderRadius: '8px', border: '1px solid white', ml: 1 }}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', p: 1 }}>
                                        <ShareIcon width='24' />
                                    </Box>
                                </Box>
                            </Box>

                        </CardContent>

                    </Card>
                </Box>
            </Box> */}
            <Box sx={{ "display": "flex", justifyContent: "space-between", padding: "20px" }}>
                <Typography variant="h5" component="h4">
                    Referral List
                </Typography>
            </Box>
            <TableContainer component={Paper}>
                <Table sx={{ minWidth: 650 }} aria-label="simple table">
                    <TableHead>
                        <TableRow>
                            <TableCell>Date</TableCell>
                            <TableCell align="right">Wallet Address</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {rows.map((row, i) => (
                            <TableRow
                                key={i}
                                sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                            >
                                <TableCell align="right">{row.date}</TableCell>
                                <TableCell align="right">{row.account}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
        </Container>
    )
}

export default Referral;