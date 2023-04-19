import { Scene } from "phaser";

export default class Preloader extends Scene{

    constructor(){
        super('preloader')
    }

    preload(){
        const cards = JSON.parse(sessionStorage.getItem("cards"));
        this.load.image(`card_${cards[0].cardId}`, cards[0].urlImg);

        this.load.image('defCard', 'images/cards/defCard.png');
        this.load.image('stats', 'images/cards/stats.png');
        this.load.spritesheet('card', 'images/cards/card_test.png',  {
            frameWidth: 204,
            frameHeight: 299
        });
    }

    create(){
        this.scene.start('main');
    }
}