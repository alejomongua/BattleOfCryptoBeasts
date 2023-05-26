import Phaser from 'phaser'

export const CARD_PROPERTIES = {
  w: 102,
  h: 150,
  idle: 'defCard'
}

export default class CardDetail extends Phaser.Physics.Arcade.Sprite {
    constructor(scene) {
        super(scene)

        this.scene = scene;
        
        //Create def card sprite
        this.frame = this.scene.add.image(10, 10, CARD_PROPERTIES.idle).setOrigin(0);
        this.card = this.scene.add.image(37, 59, 'card', 0).setOrigin(0);
        this.card.setScale(0.26);

        // this.card.setBounce(1, 1);
        // this.card.setInteractive();

        //Create detail elements
        this.name = this.scene.add
          .text(40, 20, '')
          .setFontFamily('Agency FB')
          .setFontSize(22)
          .setColor('#000000')
          .setOrigin(0)

        this.energy = this.scene.add
          .text(235, 20, '')
          .setFontFamily('Agency FB')
          .setFontSize(22)
          .setColor('#000000')
          .setOrigin(0)

        this.attack = this.scene.add
          .text(80, 380, '')
          .setFontFamily('Agency FB')
          .setFontSize(20)
          .setColor('#000000')
          .setOrigin(0)

        this.defense = this.scene.add
          .text(170, 380, '')
          .setFontFamily('Agency FB')
          .setFontSize(20)
          .setColor('#000000')
          .setOrigin(0)

        this.effectDef = this.scene.add
          .text(40, 410, '', { fixedWidth: 220, wordWrap: { width: 220}})
          .setFontFamily('Agency FB')
          .setFontSize(18)
          .setColor('#000000')
          .setOrigin(0)

        // this.playerContainer.add(this.playerName)

        this.create();
    }

    create(){
        
    }

    setProps(props, img){
      this.name.setText(props.name);
      this.energy.setText(props.energy);
      this.effectDef.setText(props.effectDef);
      this.attack.setText(!!props.attack ? `Att: ${props.attack}` : ``);
      this.defense.setText(!!props.attack ? `Def: ${props.defense}`: ``);

      //Setear imagen
      this.card.setTexture(img);

      const mainColor = Phaser.Display.Color.ValueToColor(props.rarity > 2 ? '#80ffff' : '#ffffff')
      const secondaryColor = Phaser.Display.Color.ValueToColor(props.rarity === 2 ? '#94efe5' : '#80bfff')
      
      if(props.rarity > 1)
        this.scene.tweens.addCounter({
          from:0,
          to:100,
          duration: props.rarity > 2 ? 3000 : 700,
          ease: Phaser.Math.Easing.Sine.InOut,
          yoyo: true,
          onUpdate: tween => {
              const colorObj = Phaser.Display.Color.Interpolate.ColorWithColor(mainColor, secondaryColor, 100, tween.getValue())
              this.frame.setTint(Phaser.Display.Color.GetColor(colorObj.r,colorObj.g,colorObj.b));
          }
        })
      else
        this.frame.setTint(0xffffff);
    }
    
    update() {
        
    }
}