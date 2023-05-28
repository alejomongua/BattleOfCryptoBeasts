import Web3 from "web3";
import { useState } from "react";
import { initializeApp } from "firebase/app";
import { getAuth, signOut, onAuthStateChanged } from "firebase/auth";
import AuthService from "./services/authService";
import ContractService from "./services/contractService";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import "./App.css";
import Login from "./components/login";
import Layout from './components/layout';
import Dashboard from './components/dashboard';
import Game from './components/game';
import Store from './components/store';
import NoPage from './components/nopage'
import Market from "./components/market";

const firebaseConfig = {
  apiKey: process.env.REACT_APP_API_KEY,
  authDomain: process.env.REACT_APP_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_PROJECT_ID,
  storageBucket: process.env.REACT_APP_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_APP_ID
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

const App = () => {
  const [loading, setLoading] = useState(false);
  const [address, setAddress] = useState("");
  const [isAuth, setIsAuth] = useState(false);
  const [logOut, setLogOut] = useState(false);
  
  onAuthStateChanged(auth, async (user) => {
    if (user) {
      const uid = user.uid;
      if(!isAuth && !logOut) {
        const cards = await ContractService.getCards(uid)
        sessionStorage.setItem("cards", JSON.stringify(cards));
        sessionStorage.setItem("userID", uid);
        setIsAuth(true);
      }
    } 
  });

  const onPressConnect = async () => {
    setLoading(true);
    try {
      if(!isAuth){
        const downloadMetamaskUrl = process.env.REACT_APP_METAMASK_DOWNLOAD_URL;

        if (window?.ethereum?.isMetaMask) {
          const accounts = await window.ethereum.request({
            method: "eth_requestAccounts",
          });

          const account = Web3.utils.toChecksumAddress(accounts[0]);
          await AuthService.handleLogin(account, auth).then((authAddress)=>{
            if(authAddress.length > 0){
              setLogOut(false);
              setAddress(authAddress);
              setLoading(false);
              window.location.href ='/dashboard';
            }
          });
        }else{
          window.open(downloadMetamaskUrl)
        }
      }else{
        setLoading(false);
        window.location.href = '/dashboard';
      }
    } catch (error) {
      console.log(error);
      setAddress("");
      signOut(auth);
    }

    setLoading(false);
  };

  const onPressLogout = () => {
    setLogOut(true);
    setIsAuth(false);
    setAddress("");
    signOut(auth);
  };

  return (
    <div className="App">
      {
        !isAuth ?
        <Login
          onPressConnect={onPressConnect}
          loading={loading}
        />:
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Layout onLogout={onPressLogout} />}>
              <Route path="/" element={<Navigate to="dashboard" />} />
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="game" element={<Game />} />
              <Route path="market" element={<Market />} />
              <Route path="store" element={<Store />} />
              <Route path="*" element={<NoPage />} />
            </Route>
          </Routes>
        </BrowserRouter>
      }
    </div>
  );
};

export default App;