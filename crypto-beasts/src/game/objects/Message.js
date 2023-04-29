import Phaser from 'phaser'

export const PROPERTIES = {
  w: 102,
  h: 150,
  idle: 'msgBG'
}

export default class Message extends Phaser.Physics.Arcade.Sprite {
    constructor(scene) {
        super(scene)

        this.scene = scene;
        
        //Create msg background
        this.bg = this.scene.add.image(10, 600, PROPERTIES.idle).setOrigin(0);
        
        //Create player stats
        this.msg = this.scene.add
          .text(30, 610, '', { fixedWidth: 220, wordWrap: { width: 220}})
          .setFontFamily('Agency FB')
          .setFontSize(22)
          .setColor('#000000')
          .setOrigin(0)

        //End turn button
        this.endTurn = this.scene.add.text(145, 690, 'Terminar turno',{ fixedWidth: 270})
            .setAlign('center')
            .setOrigin(0.5)
            .setPadding(10)
            .setVisible(false)
            .setStyle({ backgroundColor: '#111' })
            .setInteractive({ useHandCursor: true })
            .on('pointerdown', ()=>{this.changeVisibility(); this.scene.endTurn();})
            .on('pointerover', () => this.endTurn.setStyle({ fill: '#f39c12' }))
            .on('pointerout', () => this.endTurn.setStyle({ fill: '#FFF' }))

        this.create();
    }

    create(){
        
    }

    setMsg(msg = ""){
        this.msg.setText(`${msg}`);
        const mainColor = Phaser.Display.Color.ValueToColor('#ffffff')
        const secondaryColor = Phaser.Display.Color.ValueToColor('#ef5d5d')
        
        if(msg !== ""){
            this.scene.tweens.addCounter({
                from:0,
                to:100,
                duration: 300,
                ease: Phaser.Math.Easing.Sine.InOut,
                yoyo: true,
                onUpdate: tween => {
                    const colorObj = Phaser.Display.Color.Interpolate.ColorWithColor(mainColor, secondaryColor, 100, tween.getValue())
                    this.bg.setTint(Phaser.Display.Color.GetColor(colorObj.r,colorObj.g,colorObj.b));
                }
            })
        }
    }
    
    update() {
        
    }

    changeVisibility(){
        this.endTurn.setVisible(!this.endTurn.visible)
    }
}