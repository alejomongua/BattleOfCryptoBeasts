import '../App.css';
import { Game as GameType } from 'phaser'
import { useEffect, useState } from 'react';
import { Link } from "react-router-dom";


const Game = () => {
  const [game, setGame] = useState(undefined);
  const [canPlay, setCanPlay] = useState(true);
  
  useEffect(()=>{
    const cards = JSON.parse(sessionStorage.getItem("cards"));
    if(cards.length < 20) setCanPlay(false);
    if(game !== undefined || cards.length < 20) return;

    const initPhaser = async () =>{
      const Phaser = await import('phaser');

      const { default: Preloader } = await import('../game/scenes/Preloader');
      const { default: Wait } = await import('../game/scenes/Wait');
      const { default: Main } = await import('../game/scenes/Main');

      const phaserGame = new Phaser.Game({
        type: Phaser.AUTO,
        title: 'Crypto Beasts',
        parent: 'game-content',
        width: 1000,
        height: 700,
        physics: {
          default: 'arcade'
        },
        scene: [
          Preloader,
          Wait,
          Main
        ],
        backgroundColor: '#262626'
      });

      setGame(phaserGame);
    }

    initPhaser();
  },[])

  return (
    <div className="App-content">
      { canPlay === true ?
      <div id="game-content" key="game-content">

      </div>
      :
      <div>
        You need at least 20 cards to play, go buy some <Link to="/dashboard" className={`link`}>Here</Link>
      </div>
      }
    </div>
  );
}

export default Game;