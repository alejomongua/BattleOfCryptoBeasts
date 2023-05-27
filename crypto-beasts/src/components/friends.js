import React, {useEffect, useState} from 'react';
import Web3 from 'web3';
import ContractService from "../services/contractService";

const ContractInteraction = () => {
    const [offers, setOffers] = useState([]);
    const account = sessionStorage.getItem("userID");
    const [allowedValue, setAllowedValue] = useState(0);


    useEffect(() => {
        ContractService.checkApprovalCBC(account).then((val) => {
            setAllowedValue(val);
        });
        const fetchOffers = async () => {
            const currentOffers = await ContractService.fetchOffers();
            setOffers(currentOffers);
        };

        fetchOffers();
    }, []);

    const buyToken = async (tokenId) => {
        const result = await ContractService.buyToken(account, tokenId);
        console.log(result);
        setOffers(offers => offers.filter(offer => offer.tokenId !== tokenId));
    }

    return (<div> {
        offers.map((offer) => (<div key={
            offer.tokenId
        }>
            <p>Token ID: {
                offer.tokenId
            }</p>
            <p>Price: {
                offer.price
            }</p>
            {
            allowedValue > offer.price ? <button onClick={
                () => buyToken(offer.tokenId)
            }>Buy</button> : <button onClick={
                () => ContractService.approveMarketplace(account)
            }>Approve Marketplace</button>
        } </div>))
    } </div>);
};
export default ContractInteraction;
