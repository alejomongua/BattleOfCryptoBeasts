import { Scene } from "phaser";

export default class Preloader extends Scene{

    constructor(){
        super('preloader')
    }

    preload(){
        this.load.image('handCard', 'images/cards/handCard.png');
        this.load.image('defCard', 'images/cards/defCard.png');
        this.load.image('stats', 'images/cards/stats.png');
        this.load.spritesheet('card', 'images/cards/card.png',  {
            frameWidth: 102,
            frameHeight: 150
        });
    }

    create(){
        this.scene.start('main');
    }
}