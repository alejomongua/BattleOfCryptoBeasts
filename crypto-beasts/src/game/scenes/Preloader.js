import { Scene } from "phaser";

export default class Preloader extends Scene{

    constructor(){
        super('preloader')
    }

    preload(){
        const cards = JSON.parse(sessionStorage.getItem("cards"));
        cards.map(card=>{
            this.load.image(`card_${card.tokenId}`, card.urlImg);
        })

        this.load.image('defCard', 'images/cards/defCard.png');
        this.load.image('msgBG', 'images/cards/msgBG.png');
        this.load.image('stats', 'images/cards/stats.png');
        this.load.spritesheet('card', 'images/cards/card_test.png',  {
            frameWidth: 816,
            frameHeight: 1200
        });
    }

    create(){
        this.scene.start('wait');
    }
}