import React, {useEffect, useState} from 'react';
import ContractService from "../services/contractService";
import Spinner from './spinner';

const Market = () => {
    const [offers, setOffers] = useState([]);
    const [allowedValue, setAllowedValue] = useState(0);
    const [isLoading, setIsLoading] = useState(false)
    const [isBuying, setIsBuying] = useState(false)

    const account = sessionStorage.getItem("userID");

    const fetchOffers = async () => {
        ContractService.fetchOffers().then((currentOffers)=>{
            setOffers(currentOffers);
            setIsLoading(false);
        });
    };

    useEffect(() => {
        setIsLoading(true);
        ContractService.checkApprovalCBC(account).then((val) => {
            setAllowedValue(val);
        });
        fetchOffers();
    }, []);

    const onBuyToken = async (tokenId, price) => {
        setIsBuying(true);
        if(allowedValue > parseInt(price)){
            ContractService.buyToken(account, tokenId).then(()=>{
                setIsBuying(false);
                fetchOffers();
            })
        }else{
            ContractService.approveMarketplace(account).then(()=>{
                ContractService.checkApprovalCBC(account).then((val) => {
                    setAllowedValue(val);
                });
                setIsBuying(false);
            })
        }
    }

    return (
        <div className="App-content">
            {offers.length === 0 &&
                <span>There are no available offers</span>
            }
            {offers.length > 0 && (
                isLoading ?
                    <Spinner />
                :
                <div className='dashboard__list list_market'>
                    {offers.map((offer) => (
                        <div key={offer.tokenId} className='dashboard__card'>
                            <div className='dashboard__cardHeader'>
                            <span className='marketHeader'>{`${offer.def.name}`}</span>
                            <span className='dashboard__cardID'>{`Card ID: ${offer.cardId}`}</span>
                            </div>
                            <img src={offer.urlImg}
                            alt={`Card ${offer.def.name}`}
                            style={{maxHeight: '500px'}
                            }/>
                            <span className='marketHeader'>{`Rarity: ${offer.rarity === "1" ? 'Common' : offer.rarity === "2" ? 'Rare' : 'Legendary'}`}</span>
                            
                            <p className='market'>Price: <span className='market'>{`${(offer.offer[1] * 1e-18).toFixed(2)}CBC`}</span></p>
                            {!isBuying ?
                                <button className='dashboard__buy' onClick={() => onBuyToken(offer.tokenId.split('_')[0], offer.offer[1])}>{(allowedValue > parseInt(offer.offer[1])) ? 'Buy' : 'Approve Marketplace'}</button> 
                                :
                                <div className='loadBuy'>
                                    <Spinner />
                                    <span>Check Metamask!</span>
                                </div>
                            }
                        </div>
                    ))}
                </div>)
            }
        </div>
    );
};
export default Market;
