import React, { useContext, useState } from 'react'
import { META_BABY_TEST_ABI, MBABY_CONTRACT } from '../config';
import { Box,Button,CircularProgress, TableCell,TableRow, Tooltip } from "@mui/material";
import { API } from '../config';
import useActiveWeb3React from '../hooks/useActiveWeb3React';
import { Web3Context } from '../hooks/context';

const baseUrl = API.SERVER;

export default function Row({ i, row }) {
    const [pending, setPending] = useState(false);
    const [approved, setApproved] = useState(false);
    const { account, active } = useActiveWeb3React();
    const web3 = useContext(Web3Context);

    const approveReferral = async (_user, _referrer) => {

        setPending(true);
        try {
            const metaBabyContract = new web3.eth.Contract(META_BABY_TEST_ABI, MBABY_CONTRACT);
            const result = await metaBabyContract.methods.recordReferral(_user, _referrer).send({ from: account });
            const resp = await fetch(`${baseUrl}approvePendingRecord`,
                {
                    method: "post",
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        walletAddress: _user
                    })
                }
            );
            await resp.json();
            alert('User Approved Successfully');
            setPending(false);
            setApproved(true)
        } catch (error) {
            alert(`${error.message}`, "error");
            setPending(false);
        }
    }

    return (
        approved ?
            <></> :
            <TableRow
                sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
            >
                <TableCell sx={{ fontSize: { xs: '10px', sm: '12px' } }}>{row.createdAt}</TableCell>

                <TableCell align="center" sx={{ fontSize: { xs: '10px', sm: '12px' } }}>
                    <Tooltip title={row.walletAddress} placement="top">
                        <Box>{row.walletAddress.substring(0, 6)} ... {row.walletAddress.substring(row.walletAddress.length - 6)}</Box>
                    </Tooltip>
                </TableCell>

                <TableCell align="center" sx={{ fontSize: { xs: '10px', sm: '12px' } }}>
                    <Tooltip title={row.directedAddress} placement="top">
                        <Box>{row.directedAddress.substring(0, 6)} ... {row.directedAddress.substring(row.directedAddress.length - 6)}</Box>
                    </Tooltip>
                </TableCell>
                <TableCell align="center" sx={{ fontSize: { xs: '10px', sm: '12px' } }}>
                    {pending ?
                        <CircularProgress style={{ width: '15px', height: '15px' }} />
                        :
                        <Button onClick={async () => {
                            await approveReferral(row.directedAddress, row.walletAddress);
                        }} sx={{ p: 0, fontSize: { xs: '10px', sm: '12px' } }}>
                            Approve
                        </Button>
                    }

                </TableCell>
            </TableRow>
    )
}
