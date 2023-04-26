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
}