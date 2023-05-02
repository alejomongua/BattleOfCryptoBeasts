import Phaser from 'phaser'

export const PROPERTIES = {
  w: 102,
  h: 150,
  idle: 'stats'
}

export default class Stats extends Phaser.Physics.Arcade.Sprite {
    constructor(scene) {
        super(scene)

        this.scene = scene;
        this.stats = {
          hp: 50, 
          ep: 3, 
          hp_enemy: 50, 
          ep_enemy: 3
        }
        
        //Create def card sprite
        this.card = this.scene.add.image(10, 500, PROPERTIES.idle).setOrigin(0);
        // this.card.setBounce(1, 1);
        // this.card.setInteractive();

        //Create player stats
        this.hp = this.scene.add
          .text(30, 515, 'HP')
          .setFontFamily('Agency FB')
          .setFontSize(22)
          .setColor('#000000')
          .setOrigin(0)

        this.ep = this.scene.add
          .text(30, 560, 'EP')
          .setFontFamily('Agency FB')
          .setFontSize(22)
          .setColor('#000000')
          .setOrigin(0)

        //Create enemy stats
        this.hp_enemy = this.scene.add
          .text(160, 515, 'HP')
          .setFontFamily('Agency FB')
          .setFontSize(22)
          .setColor('#000000')
          .setOrigin(0)

        this.ep_enemy = this.scene.add
          .text(160, 560, 'EP')
          .setFontFamily('Agency FB')
          .setFontSize(22)
          .setColor('#000000')
          .setOrigin(0)

        this.create();
    }

    create(){
        
    }

    setStats(stats){
        this.stats = stats;
        this.hp.setText(`HP: ${this.stats.hp}`);
        this.ep.setText(`EP: ${this.stats.ep}`);

        this.hp_enemy.setText(`HP: ${this.stats.hp_enemy}`);
        this.ep_enemy.setText(`EP: ${this.stats.ep_enemy}`);
    }
    
    update() {
        
    }
}