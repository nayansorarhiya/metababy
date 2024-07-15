import React, { useContext, useEffect, useState } from "react";
import {
    BrowserRouter,
    Routes,
    Route,
    Navigate
} from "react-router-dom";

// ** Import Route Config ** //
import MyRoutes from "./config/constants/routes";

// ** Import Pages ** //
import Page404 from "./pages/404";
import GameDetail from "./pages/GameDetail";

// ** Import Components
import WLayout from "./components/WLayout";
import Referral from "./pages/Referral";
import useActiveWeb3React from "./hooks/useActiveWeb3React";
import { WalletContext, Web3Context } from "./hooks/context";
import { META_BABY_TEST_ABI, MBABY_CONTRACT } from './config';


const AppRouter = () => {

    const { account, active } = useActiveWeb3React();
    const [owner, setOwner] = useState('');
    const web3 = useContext(Web3Context);
    async function ownerCheck() {
        const metaBabyContract = new web3.eth.Contract(META_BABY_TEST_ABI, MBABY_CONTRACT);
        const ownerAddress = await metaBabyContract.methods.owner().call();
        setOwner(ownerAddress);
    }

    return (
        <BrowserRouter>
            <Routes>
                <Route element={<WLayout />}>
                    <Route index exact element={<Navigate to="/home" />} />
                    {Object.values(MyRoutes).filter(routes => routes.layout === "wl").map(route => {
                        ownerCheck();
                        if (route.id == 'babyadmin') {
                            return active && (account == owner) && <Route key={route.id} path={route.id} exact element={route.element} />
                        } else {
                            return <Route key={route.id} path={route.id} exact element={route.element} />
                        }
                    }

                    )}
                    <Route path="/games/:id" exact element={<GameDetail />} />
                </Route>
                <Route path="*" element={<Page404 />} />
            </Routes>
        </BrowserRouter>
    )
}

export default AppRouter;