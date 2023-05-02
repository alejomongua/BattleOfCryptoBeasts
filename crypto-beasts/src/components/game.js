import '../App.css';
import { Game as GameType } from 'phaser'
import { useEffect, useMemo, useState } from 'react';


const Game = () => {
  const [game, setGame] = useState(undefined);
  
  useEffect(()=>{
    if(game !== undefined) return;

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
    <div className="App">
      <div id="game-content" key="game-content">

      </div>
    </div>
  );
}

export default Game;