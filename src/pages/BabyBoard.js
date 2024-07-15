import React, { useContext, useState, useEffect } from 'react';

import { styled } from '@mui/material/styles';
import hash from 'hash.js';
import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import Stack from "@mui/material/Stack";
import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";
import CardHeader from '@mui/material/CardHeader';
import CardContent from '@mui/material/CardContent';
import Table from '@mui/material/Table';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import TableBody from '@mui/material/TableBody';
import Avatar from '@mui/material/Avatar';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import DoneIcon from '@mui/icons-material/Done';

import useTheme from '@mui/styles/useTheme';
import useMediaQuery from '@mui/material/useMediaQuery';
import useActiveWeb3React from "../hooks/useActiveWeb3React";
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import { useLocation } from "react-router-dom";
import { WalletContext, Web3Context } from '../hooks/context';
import { MBABY_CONTRACT, BEP20_ABI, API, META_BABY_TEST_ABI } from '../config';
import { Button } from '@mui/material';


// const baseUrl = "http://localhost:3003/";
const baseUrl = API.SERVER;
const metababyBaseUrl = `${(window.location.origin).toString()}/home?ref=`;

function useQuery() {
    const { search } = useLocation();

    return React.useMemo(() => new URLSearchParams(search), [search]);
}

const StyledToggleButtonGroup = styled(ToggleButtonGroup)(({ theme }) => ({
    backgroundColor: "#0f367d",
    '& .MuiToggleButtonGroup-grouped': {
        border: "none",
        paddingTop: 4,
        paddingBottom: 4,
        '&.Mui-disabled': {
            border: 0,
        },
        "&.Mui-selected": {
            backgroundColor: "#5388EC"
        },
        '&:not(:first-of-type)': {
            borderRadius: theme.shape.borderRadius,
        },
        '&:first-of-type': {
            borderRadius: theme.shape.borderRadius,
        },
    },
}));

const Dashboard = () => {

    const { isOpenWallet, setIsOpenWallet } = useContext(WalletContext);
    const theme = useTheme();
    const web3 = useContext(Web3Context);
    const { account, active } = useActiveWeb3React();
    const [refid, setRefid] = useState('');
    const [isInvite, setisInvite] = useState(false);
    const [copied, setCopied] = useState(false);
    const [referralCount, setReferralCount] = useState(0);
    const [referralComAmount, setReferralCommission] = useState(0);

    const isMobile = useMediaQuery((theme) => theme.breakpoints.down('sm'));

    const [balance, setBalance] = useState({
        mbaby: {
            usd: 0,
            token: 0
        },
        btcb: {
            usd: 0,
            token: 0
        }
    });

    const [period, setPeriod] = React.useState('left');
    const [current, setcurrent] = React.useState('');

    const handleChartPeriod = (event, newPeriod) => {
        setPeriod(newPeriod);
    };

    useEffect(() => {
        if (!account) return;
        console.log(current, account);
        if (current != '' && account != current) {
            setisInvite(false);
        }
        setcurrent(account);
    }, [account])

    useEffect(() => {
        if (!active) {
            return;
        }
        console.log(account, isInvite)
        if (account && isInvite) {
            const refId = hash.sha256().update(account).digest('hex').toLowerCase();
            setRefid(refId);
            fetch(`${baseUrl}registerReferralId`,
                {
                    method: "post",
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        refId,
                        walletAddress: account
                    })
                }
            ).then(resp => {
                return resp.json();
            }).then(result => {

                console.log(result);
            }).catch(err => {
                console.log(err);
            })
        }
    }, [isInvite, active]);

    // useEffect(() => {
    //     console.log(account);
    //     if (account) {
    //         fetch(`${baseUrl}getReferral?account=${account}`)
    //             .then(resp => {
    //                 return resp.json();
    //             })
    //             .then((result) => {
    //                 const objs = result.result;
    //                 const arr = objs.map(ele => {
    //                     return { date: ele.created_at, account: ele.to_address }
    //                 });
    //                 console.log(arr);
    //                 setRows(arr);
    //             })
    //     }
    // }, [account])


    useEffect(() => {
        if (web3.eth && active && account) {
            // setisInvite(true);
            const mBaby = new web3.eth.Contract(BEP20_ABI, MBABY_CONTRACT);
            const mBabyCore = new web3.eth.Contract(META_BABY_TEST_ABI, MBABY_CONTRACT);
            mBaby.methods.balanceOf(account).call().then(result => {
                setBalance(prevState => ({
                    ...prevState,
                    mbaby: {
                        usd: 0,
                        token: Number(Number(result / 10 ** 18).toFixed(2))
                    }
                }));
            });
            mBabyCore.methods.referralCommissionAmount(account).call().then(commission => {
                console.log(commission);
                setReferralCommission(commission)
            });
            mBabyCore.methods.referralsCount(account).call().then(refcount => {
                console.log(refcount);
                setReferralCount(refcount)
            });
        }
    }, [web3, account, active])

    function claimReferralAmount() {
        if (web3.eth && active && account) {
            const mBaby = new web3.eth.Contract(META_BABY_TEST_ABI, MBABY_CONTRACT);
            mBaby.methods.claimReferralCommission().send({ from: account }).then(result => {
                console.log(result);
            })
        } else {
            setisInvite(true);
            setIsOpenWallet(true);
        }
    }


    return (
        <Box sx={{
            padding: theme => theme.spacing(2, 6),
            height: "100%",
            overflow: "auto",
            [theme.breakpoints.down("sm")]: {
                padding: theme.spacing(1, 1)
            }
        }}>
            <Container>
                <Grid container spacing={4}>
                    <Grid item xs={12} md={3.5}>
                        {isMobile && (
                            <>
                                <Stack direction={{ xs: "column", sm: "row" }} sx={{ mb: 2 }} spacing={2} alignItems={{ xs: "stretch", sm: "center" }}>
                                    <Stack direction="row" alignItems="center" sx={{
                                        borderRadius: 1,
                                        flexGrow: 1,
                                        p: 1,
                                        pl: 2,
                                        pr: 2,
                                        bgcolor: "#0F367D"
                                    }}>
                                        <Stack sx={{ pl: 2, flexGrow: 1 }} justifyContent="space-between">
                                            <Typography sx={{ textAlign: "center" }}>
                                                Total Value Locked (TVL)
                                            </Typography>
                                            <Typography sx={{
                                                fontSize: 26,
                                                fontWeight: 600,
                                                textAlign: "center"
                                            }}>
                                                $0.00
                                            </Typography>
                                            <Typography variant="caption" sx={{
                                                textAlign: "center"
                                            }}>
                                                Across all pools
                                            </Typography>
                                        </Stack>
                                    </Stack>
                                    <Stack direction="row" alignItems="center" sx={{
                                        borderRadius: 1,
                                        flexGrow: 1,
                                        p: 1,
                                        pl: 2,
                                        pr: 2,
                                        bgcolor: "#0F367D"
                                    }}>
                                        <Stack sx={{ pl: 2, flexGrow: 1 }} justifyContent="space-between">
                                            <Typography sx={{ textAlign: "center" }}>
                                                Total <Box component="b" sx={{
                                                    color: theme => theme.palette.primary.main
                                                }}>
                                                    MBABY
                                                </Box> Locked
                                            </Typography>
                                            <Typography sx={{
                                                fontSize: 26,
                                                fontWeight: 600,
                                                textAlign: "center"
                                            }}>
                                                0.00
                                            </Typography>
                                            <Typography variant="caption" sx={{
                                                textAlign: "center"
                                            }}>
                                                Across all pools
                                            </Typography>
                                        </Stack>
                                    </Stack>
                                </Stack>
                                <Card sx={{ mb: 2 }}>
                                    <CardContent>
                                        <Typography variant="h5" sx={{ color: "primary.main" }}>
                                            BNB/MBABY
                                        </Typography>
                                        <Typography variant="caption" sx={{ color: "text.secondary" }}>
                                            Pancakeswap V2
                                        </Typography>
                                        <Stack
                                            sx={{ pt: 1, pb: 1 }}
                                            direction="row"
                                            justifyContent={"space-between"}
                                            alignItems="center"
                                        >
                                            <Typography variant='h4' sx={{ fontWeight: 600 }}>
                                                0.00
                                            </Typography>
                                            <StyledToggleButtonGroup
                                                value={period}
                                                exclusive
                                                onChange={handleChartPeriod}
                                                aria-label="Chart Period"
                                            >
                                                <ToggleButton value="left" aria-label="left aligned">
                                                    24h
                                                </ToggleButton>
                                                <ToggleButton value="center" aria-label="centered">
                                                    7D
                                                </ToggleButton>
                                                <ToggleButton value="right" aria-label="right aligned">
                                                    1M
                                                </ToggleButton>
                                                <ToggleButton value="justify" aria-label="justified">
                                                    1Y
                                                </ToggleButton>
                                            </StyledToggleButtonGroup>
                                        </Stack>
                                        {/*  <Box
                                            component="img"
                                            sx={{
                                                mt: 4,
                                                mb: 2,
                                                width: "100%",
                                                pl: 1,
                                                pr: 1
                                            }}
                                            src={require("../assets/img/dashboard/chart.png")}
                                            alt="Chart"
                                        /> */}
                                    </CardContent>
                                </Card>
                            </>
                        )}
                        <Card sx={{ mb: 2, background: 'linear-gradient(235deg, rgb(51, 111, 245) 4.05%, rgba(17, 81, 225, 0.32) 103.52%), rgb(7, 28, 60)', borderRadius: '24px' }}>
                            <CardContent>
                                <Typography sx={{ textAlign: 'center', fontSize: 24, fontWeight: 600, lineHeight: '26px' }} color="text.primary">
                                    My Referral Link
                                </Typography>
                                {refid === '' || !isInvite ?
                                    <Button sx={{ mt: 2, display: 'flex', justifyContent: 'center', mx: 'auto' }} onClick={() => {
                                        setisInvite(true);
                                        if (!account) {
                                            setIsOpenWallet(true)
                                        }
                                    }}>Invite Friends</Button> :
                                    <>
                                        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2, whiteSpace: 'nowrap', overflow: 'hidden' }}>
                                            <Box sx={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgb(14, 51, 130)', borderRadius: '8px', border: '1px solid white', padding: '4px', }}>
                                                <Typography sx={{ fontSize: '14px' }} noWrap>
                                                    {metababyBaseUrl}{refid}
                                                </Typography>
                                                <Box sx={{ display: 'flex', alignItems: 'center', pl: 1 }}>
                                                    {!copied ?
                                                        <ContentCopyIcon width='24' onClick={() => {
                                                            navigator.clipboard.writeText(`${metababyBaseUrl}${refid}`)
                                                            setCopied(true);
                                                            setTimeout(() => {
                                                                setCopied(false);
                                                            }, 500);
                                                        }
                                                        } /> :
                                                        <DoneIcon></DoneIcon>
                                                    }
                                                </Box>
                                            </Box>
                                        </Box>
                                    </>
                                }


                            </CardContent>
                        </Card>
                        <Stack direction="row" sx={{
                            borderColor: "#36415F",
                            borderWidth: 1,
                            borderStyle: "solid",
                            borderRadius: 1,
                            p: 1,
                            mb: 2
                        }}>
                            <Card sx={{
                                backgroundColor: "rgba(255, 255, 255, .075)",
                                boxShadow: "none",
                                lineHeight: 0
                            }}>
                                <Box
                                    component="img"
                                    src={require("../assets/img/mbaby.png")}
                                    alt="Meta"
                                    sx={{ height: 68, padding: 4 / 8 }}
                                />
                            </Card>
                            <Stack sx={{ pl: 2 }} justifyContent="space-between">
                                <Typography>
                                    MY <Box component="b" sx={{
                                        color: theme => theme.palette.primary.main
                                    }}>
                                        MBABY
                                    </Box> Balance
                                </Typography>
                                <Typography variant="caption">
                                    {balance.mbaby?.token?.toLocaleString()}
                                </Typography>
                                <Typography>
                                    {balance.mbaby?.usd?.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}
                                </Typography>
                            </Stack>
                        </Stack>
                        <Stack direction="row" sx={{
                            borderColor: "#36415F",
                            borderWidth: 1,
                            borderStyle: "solid",
                            borderRadius: 1,
                            p: 1,
                            mb: 2
                        }}>
                            <Card sx={{
                                backgroundColor: "rgba(255, 255, 255, .075)",
                                boxShadow: "none",
                                lineHeight: 0
                            }}>
                                <Box
                                    component="img"
                                    src={require("../assets/img/dashboard/btcb.png")}
                                    alt="Btcb"
                                    sx={{
                                        height: 68,
                                        padding: 10 / 8
                                    }}
                                />
                            </Card>
                            <Stack sx={{ pl: 2 }} justifyContent="space-between">
                                <Typography>
                                    MY <Box component="b" sx={{
                                        color: theme => theme.palette.orangebtc.main
                                    }}>
                                        BTCB
                                    </Box> Balance
                                </Typography>
                                <Typography variant="caption">
                                    {balance.btcb?.token?.toLocaleString()}
                                </Typography>
                                <Typography>
                                    {balance.btcb?.usd?.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}
                                </Typography>
                            </Stack>
                        </Stack>
                        <Card sx={{ mb: 2 }}>
                            <CardHeader
                                avatar={
                                    <Avatar
                                        aria-label="recipe"
                                        src={require("../assets/img/dashboard/BTC-MBABY.png")}
                                        alt="MBABY_BTC"
                                        sx={{
                                            bgcolor: "rgba(255, 255, 255, .075)",
                                            p: 0.5,
                                            ["& img"]: {
                                                height: "100%",
                                                width: "100%",
                                            }
                                        }}
                                    />
                                }
                                sx={{
                                    bgcolor: "#0F367D"
                                }}
                                title="Dividends"
                                titleTypographyProps={{
                                    sx: {
                                        fontSize: theme => theme.spacing(2.125)
                                    }
                                }}
                            />
                            <CardContent>
                                <Table>
                                    <TableHead>
                                        <TableRow>
                                            <TableCell sx={{
                                                fontSize: 14,
                                                padding: 1,
                                                pt: 0,
                                                pb: 0,
                                                border: "none"
                                            }}>
                                                BTCB Earned
                                            </TableCell>
                                            <TableCell sx={{
                                                fontSize: 14,
                                                padding: 1,
                                                pt: 0,
                                                pb: 0,
                                                border: "none"
                                            }}>
                                                MBABY Earned
                                            </TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        <TableRow>
                                            <TableCell sx={{
                                                fontSize: 14,
                                                padding: 1,
                                                pt: 0,
                                                pb: 0,
                                                border: "none"
                                            }}>
                                                0
                                            </TableCell>
                                            <TableCell sx={{
                                                fontSize: 14,
                                                padding: 1,
                                                pt: 0,
                                                pb: 0,
                                                border: "none"
                                            }}>
                                                0
                                            </TableCell>
                                        </TableRow>
                                    </TableBody>
                                </Table>
                            </CardContent>
                        </Card>
                        <Card sx={{ mb: 2 }}>
                            <CardHeader
                                avatar={
                                    <Avatar
                                        aria-label="recipe"
                                        src={require("../assets/img/dashboard/stake.png")}
                                        alt="MBABY_BTC"
                                        sx={{
                                            bgcolor: "rgba(255, 255, 255, .075)",
                                            p: 0.5,
                                            ["& img"]: {
                                                height: "unset",
                                                width: "unset"
                                            }
                                        }}
                                    />
                                }
                                sx={{
                                    bgcolor: "#0F367D"
                                }}
                                title="Staking Rewards"
                                titleTypographyProps={{
                                    sx: {
                                        fontSize: theme => theme.spacing(2.125)
                                    }
                                }}
                            />
                            <List>
                                <ListItem>
                                    <ListItemIcon>
                                        <Avatar
                                            aria-label="recipe"
                                            src={require("../assets/img/dashboard/bear.png")}
                                            alt="MBABY_BTC"
                                            sx={{
                                                bgcolor: "rgba(255, 255, 255, .075)",
                                                p: 0.5,
                                            }}
                                        />
                                    </ListItemIcon>
                                    <ListItemText
                                        primary="NFB Pool"
                                        secondary="0 MBABY"
                                    />
                                </ListItem>
                                <ListItem>
                                    <ListItemIcon>
                                        <Avatar
                                            aria-label="recipe"
                                            src={require("../assets/img/dashboard/milk-bottle.png")}
                                            alt="MBABY_BTC"
                                            sx={{
                                                bgcolor: "rgba(255, 255, 255, .075)",
                                                p: 0.5,
                                            }}
                                        />
                                    </ListItemIcon>
                                    <ListItemText
                                        primary="MBABY Pool #1"
                                        secondary="0 MBABY"
                                    />
                                </ListItem>
                                <ListItem>
                                    <ListItemIcon>
                                        <Avatar
                                            aria-label="recipe"
                                            src={require("../assets/img/dashboard/milk-bottle.png")}
                                            alt="MBABY_BTC"
                                            sx={{
                                                bgcolor: "rgba(255, 255, 255, .075)",
                                                p: 0.5,
                                            }}
                                        />
                                    </ListItemIcon>
                                    <ListItemText
                                        primary="MBABY Pool #2"
                                        secondary="0 MBABY"
                                    />
                                </ListItem>
                            </List>
                        </Card>
                        <Card sx={{ mb: 2 }}>
                            <CardHeader
                                avatar={
                                    <Avatar
                                        aria-label="recipe"
                                        src={require("../assets/img/dashboard/people.png")}
                                        alt="MBABY_BTC"
                                        sx={{
                                            bgcolor: "rgba(255, 255, 255, .075)",
                                            p: 0.5
                                        }}
                                    />
                                }
                                sx={{
                                    bgcolor: "#0F367D"
                                }}
                                title="Referral Rewards"
                                titleTypographyProps={{
                                    sx: {
                                        fontSize: theme => theme.spacing(2.125)
                                    }
                                }}
                            />
                            <CardContent>
                                <Table>
                                    <TableHead>
                                        <TableRow>
                                            <TableCell sx={{
                                                fontSize: 14,
                                                padding: 1,
                                                pt: 0,
                                                pb: 0,
                                                border: "none"
                                            }}>
                                                Referrals
                                            </TableCell>
                                            <TableCell sx={{
                                                fontSize: 14,
                                                padding: 1,
                                                pt: 0,
                                                pb: 0,
                                                border: "none"
                                            }}>
                                                Earned
                                            </TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        <TableRow>
                                            <TableCell sx={{
                                                fontSize: 14,
                                                padding: 1,
                                                pt: 0,
                                                pb: 0,
                                                border: "none"
                                            }}>
                                                {referralCount}
                                            </TableCell>
                                            <TableCell sx={{
                                                fontSize: 14,
                                                padding: 1,
                                                pt: 0,
                                                pb: 0,
                                                border: "none"
                                            }}>
                                                {referralComAmount} MBABY
                                            </TableCell>
                                        </TableRow>
                                    </TableBody>
                                </Table>
                                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
                                    <Button variant="contained" color="secondary" onClick={claimReferralAmount}>WITHDRAW</Button>
                                </Box>
                            </CardContent>
                        </Card>
                    </Grid>
                    <Grid item xs={12} md={8.5}>
                        {!isMobile && (
                            <>
                                <Stack direction={{ xs: "column", sm: "row" }} sx={{ mb: 2 }} spacing={2} alignItems={{ xs: "stretch", sm: "center" }}>
                                    <Stack direction="row" alignItems="center" sx={{
                                        borderRadius: 1,
                                        flexGrow: 1,
                                        p: 1,
                                        pl: 2,
                                        pr: 2,
                                        bgcolor: "#0F367D"
                                    }}>
                                        <Stack sx={{ pl: 2, flexGrow: 1 }} justifyContent="space-between">
                                            <Typography sx={{ textAlign: "center" }}>
                                                Total Value Locked (TVL)
                                            </Typography>
                                            <Typography sx={{
                                                fontSize: 26,
                                                fontWeight: 600,
                                                textAlign: "center"
                                            }}>
                                                $0.00
                                            </Typography>
                                            <Typography variant="caption" sx={{
                                                textAlign: "center"
                                            }}>
                                                Across all pools
                                            </Typography>
                                        </Stack>
                                    </Stack>
                                    <Stack direction="row" alignItems="center" sx={{
                                        borderRadius: 1,
                                        flexGrow: 1,
                                        p: 1,
                                        pl: 2,
                                        pr: 2,
                                        bgcolor: "#0F367D"
                                    }}>
                                        <Stack sx={{ pl: 2, flexGrow: 1 }} justifyContent="space-between">
                                            <Typography sx={{ textAlign: "center" }}>
                                                Total <Box component="b" sx={{
                                                    color: theme => theme.palette.primary.main
                                                }}>
                                                    MBABY
                                                </Box> Locked
                                            </Typography>
                                            <Typography sx={{
                                                fontSize: 26,
                                                fontWeight: 600,
                                                textAlign: "center"
                                            }}>
                                                0.00
                                            </Typography>
                                            <Typography variant="caption" sx={{
                                                textAlign: "center"
                                            }}>
                                                Across all pools
                                            </Typography>
                                        </Stack>
                                    </Stack>
                                </Stack>
                                <Card sx={{ mb: 2 }}>
                                    <CardContent>
                                        <Typography variant="h5" sx={{ color: "primary.main" }}>
                                            BNB/MBABY
                                        </Typography>
                                        <Typography variant="caption" sx={{ color: "text.secondary" }}>
                                            Pancakeswap V2
                                        </Typography>
                                        <Stack
                                            sx={{ pt: 1, pb: 1 }}
                                            direction="row"
                                            justifyContent={"space-between"}
                                            alignItems="center"
                                        >
                                            <Typography variant='h4' sx={{ fontWeight: 600 }}>
                                                0.00
                                            </Typography>
                                            <StyledToggleButtonGroup
                                                value={period}
                                                exclusive
                                                onChange={handleChartPeriod}
                                                aria-label="Chart Period"
                                            >
                                                <ToggleButton value="left" aria-label="left aligned">
                                                    24h
                                                </ToggleButton>
                                                <ToggleButton value="center" aria-label="centered">
                                                    7D
                                                </ToggleButton>
                                                <ToggleButton value="right" aria-label="right aligned">
                                                    1M
                                                </ToggleButton>
                                                <ToggleButton value="justify" aria-label="justified">
                                                    1Y
                                                </ToggleButton>
                                            </StyledToggleButtonGroup>
                                        </Stack>
                                        {/*    <Box
                                            component="img"
                                            sx={{
                                                mt: 4,
                                                mb: 2,
                                                width: "100%",
                                                pl: 1,
                                                pr: 1
                                            }}
                                            src={require("../assets/img/dashboard/chart.png")}
                                            alt="Chart"
                                        /> */}
                                    </CardContent>
                                </Card>
                            </>
                        )}
                        <Card>
                            <CardContent>
                                <Typography variant="h5">
                                    My Non-Fungible Babies (NFBs)
                                </Typography>
                                <Grid container spacing={6} sx={{ mt: 2 }}>
                                    <Grid item xs={12} md={6} lg={4}>
                                        <Card component={Stack} sx={{
                                            bgcolor: "#5E4247",
                                            position: "relative",
                                            overflow: "visible"
                                        }}>
                                            <Box
                                                component="img"
                                                src={require("../assets/img/dashboard/nfb.png")}
                                                alt="NFB"
                                                sx={{
                                                    margin: "auto",
                                                    mt: 1,
                                                    mb: 1,
                                                    opacity: 0.3
                                                }}
                                            />
                                            <Typography
                                                component="span"
                                                sx={{
                                                    bgcolor: "#FFE187",
                                                    color: "#00215E",
                                                    p: 0.5,
                                                    textAlign: "center",
                                                    fontSize: 16,
                                                    fontWeight: 600,
                                                    borderBottomLeftRadius: 6,
                                                    borderBottomRightRadius: 6,
                                                }}
                                            >
                                                0.00 MBABY
                                            </Typography>
                                            <Typography
                                                component="span"
                                                sx={{
                                                    bgcolor: "#FFE187",
                                                    color: "#00215E",
                                                    p: 0.5,
                                                    pl: 1.5,
                                                    pr: 1.5,
                                                    top: -8,
                                                    left: -8,
                                                    boxShadow: theme => theme.shadows[4],
                                                    textAlign: "center",
                                                    fontSize: 14,
                                                    fontWeight: 700,
                                                    position: "absolute",
                                                    borderRadius: 1
                                                }}
                                            >
                                                #1
                                            </Typography>
                                            <Typography
                                                component="span"
                                                sx={{
                                                    bgcolor: "#FFE187",
                                                    color: "#00215E",
                                                    p: 0.5,
                                                    pl: 1.5,
                                                    pr: 1.5,
                                                    top: -8,
                                                    right: -8,
                                                    fontSize: 12,
                                                    boxShadow: theme => theme.shadows[4],
                                                    textAlign: "center",
                                                    position: "absolute",
                                                    borderRadius: 1
                                                }}
                                            >
                                                Rarity: 0.00%
                                            </Typography>
                                        </Card>
                                    </Grid>
                                    <Grid item xs={12} md={6} lg={4}>
                                        <Card component={Stack} sx={{
                                            bgcolor: "#5E4247",
                                            position: "relative",
                                            overflow: "visible"
                                        }}>
                                            <Box
                                                component="img"
                                                src={require("../assets/img/dashboard/nfb.png")}
                                                alt="NFB"
                                                sx={{
                                                    margin: "auto",
                                                    mt: 1,
                                                    mb: 1,
                                                    opacity: 0.3
                                                }}
                                            />
                                            <Typography
                                                component="span"
                                                sx={{
                                                    bgcolor: "#FFE187",
                                                    color: "#00215E",
                                                    p: 0.5,
                                                    textAlign: "center",
                                                    fontSize: 16,
                                                    fontWeight: 600,
                                                    borderBottomLeftRadius: 6,
                                                    borderBottomRightRadius: 6,
                                                }}
                                            >
                                                0.00 MBABY
                                            </Typography>
                                            <Typography
                                                component="span"
                                                sx={{
                                                    bgcolor: "#FFE187",
                                                    color: "#00215E",
                                                    p: 0.5,
                                                    pl: 1.5,
                                                    pr: 1.5,
                                                    top: -8,
                                                    left: -8,
                                                    boxShadow: theme => theme.shadows[4],
                                                    textAlign: "center",
                                                    fontSize: 14,
                                                    fontWeight: 700,
                                                    position: "absolute",
                                                    borderRadius: 1
                                                }}
                                            >
                                                #2
                                            </Typography>
                                            <Typography
                                                component="span"
                                                sx={{
                                                    bgcolor: "#FFE187",
                                                    color: "#00215E",
                                                    p: 0.5,
                                                    pl: 1.5,
                                                    pr: 1.5,
                                                    top: -8,
                                                    right: -8,
                                                    fontSize: 12,
                                                    boxShadow: theme => theme.shadows[4],
                                                    textAlign: "center",
                                                    position: "absolute",
                                                    borderRadius: 1
                                                }}
                                            >
                                                Rarity: 0.00%
                                            </Typography>
                                        </Card>
                                    </Grid>
                                    <Grid item xs={12} md={6} lg={4}>
                                        <Card component={Stack} sx={{
                                            bgcolor: "#5E4247",
                                            position: "relative",
                                            overflow: "visible"
                                        }}>
                                            <Box
                                                component="img"
                                                src={require("../assets/img/dashboard/nfb.png")}
                                                alt="NFB"
                                                sx={{
                                                    margin: "auto",
                                                    mt: 1,
                                                    mb: 1,
                                                    opacity: 0.3
                                                }}
                                            />
                                            <Typography
                                                component="span"
                                                sx={{
                                                    bgcolor: "#FFE187",
                                                    color: "#00215E",
                                                    p: 0.5,
                                                    textAlign: "center",
                                                    fontSize: 16,
                                                    fontWeight: 600,
                                                    borderBottomLeftRadius: 6,
                                                    borderBottomRightRadius: 6,
                                                }}
                                            >
                                                0.00 MBABY
                                            </Typography>
                                            <Typography
                                                component="span"
                                                sx={{
                                                    bgcolor: "#FFE187",
                                                    color: "#00215E",
                                                    p: 0.5,
                                                    pl: 1.5,
                                                    pr: 1.5,
                                                    top: -8,
                                                    left: -8,
                                                    boxShadow: theme => theme.shadows[4],
                                                    textAlign: "center",
                                                    fontSize: 14,
                                                    fontWeight: 700,
                                                    position: "absolute",
                                                    borderRadius: 1
                                                }}
                                            >
                                                #3
                                            </Typography>
                                            <Typography
                                                component="span"
                                                sx={{
                                                    bgcolor: "#FFE187",
                                                    color: "#00215E",
                                                    p: 0.5,
                                                    pl: 1.5,
                                                    pr: 1.5,
                                                    top: -8,
                                                    right: -8,
                                                    fontSize: 12,
                                                    boxShadow: theme => theme.shadows[4],
                                                    textAlign: "center",
                                                    position: "absolute",
                                                    borderRadius: 1
                                                }}
                                            >
                                                Rarity: 0.00%
                                            </Typography>
                                        </Card>
                                    </Grid>
                                </Grid>
                            </CardContent>
                        </Card>
                    </Grid>
                </Grid>
            </Container>
        </Box>
    )
}

export default Dashboard;
