import '../App.css';
import { React, useEffect, useMemo, useState } from 'react';
import ContractService from "../services/contractService";
import Spinner from './spinner';

const Dashboard = () => {
  const [cards, setCards] = useState([]);
  const [selectedCard, setSelectedCard] = useState(undefined);
  const [isLoading, setIsLoading] = useState(true);
  const [isBuying, setIsBuying] = useState(false);
  const [eventText, setEventText] = useState("Buy Booster Pack");
  const [event, setEvent] = useState(1);
  const account = sessionStorage.getItem("userID");

  const getCards = () =>{
    setIsLoading(true);
    ContractService.getCards(account).then(cards=>{
      sessionStorage.setItem("cards", JSON.stringify(cards));
      setCards(cards);
      setSelectedCard(cards[0]);
      setIsLoading(false);
    });
  }

  const buyBoosterPack = async () =>{
    setIsBuying(true);
    if(event === 0){
      ContractService.approve(account).then(()=>{
        setIsBuying(false);
      });
    }else{
      const cardType = Math.floor(Math.random() * (3 - 1 + 1) + 1);
      ContractService.buyBoosterPack(account, cardType).then(()=>{
        getCards();
        setIsBuying(false);
      });
    }
  }

  useEffect(() => {
      if (account) {
        getCards()
      }
  }, [account]);

  useEffect(()=>{
    ContractService.checkAllowance(account).then((val)=>{
      console.log(val)
      if(parseInt(val)<(50 * 10 ** 18)){
        setEventText("Approve Allowance");
        setEvent(0);
      }else{
        setEventText("Buy Booster Pack");
        setEvent(1);
      }
    });
  },[])

  return (
    <div className="App">
      <div className='dashboard'>
        {
          isLoading && 
          <Spinner />
        }
        {/*Listado de carta */}
        {
          cards.length === 0 &&
          <div>
            <span>What are you waiting for?? <br/> Buy your first BoosterPack!!</span>
            <div>
              {!isBuying && !isLoading ?
                <button className='dashboard__buy' onClick={() => buyBoosterPack()}>{eventText}</button>
                :
                <div className='loadBuy'>
                  <Spinner />
                  <span>Check Metamask!</span>
                </div>
              }
            </div>
          </div>
        }
        {cards.length > 0 &&
          <div>
            <div className='dashboard__list'>
              {cards.map((card, i)=>{
                return <div key={card.tokenId} className='dashboard__listCard' onClick={()=>{setSelectedCard(card)}}>
                  {/* <span>{`${card.def.name}`}</span> */}
                  <img src={card.urlImg}
                    alt={`Card ${card.def.name}`}
                    style={{maxHeight: '150px'}
                    }/>
                </div>
              })}
            </div>
            <div>
              {!isBuying ?
                <button className='dashboard__buy' onClick={() => buyBoosterPack()}>Buy Booster Pack</button>
                :
                <div className='loadBuy'>
                  <Spinner />
                  <span>Check Metamask!</span>
                </div>
              }
            </div>
          </div>
        }
        {/*Detalle de carta */}
        {selectedCard !== undefined &&
          <div key={selectedCard.tokenId} className='dashboard__card'>
            <div className='dashboard__cardHeader'>
              <span>{`${selectedCard.def.name}`}</span>
              <span className='dashboard__cardID'>{`Card ID: ${selectedCard.cardId}`}</span>
            </div>
            <img src={selectedCard.urlImg}
              alt={`Card ${selectedCard.def.name}`}
              style={{maxHeight: '600px'}
              }/>
            <span>{`Rarity: ${selectedCard.rarity === "1" ? 'Common' : selectedCard.rarity === "2" ? 'Rare' : 'Legendary'}`}</span>
          </div>
        }
      </div>
    </div>
  );
}

export default Dashboard;
