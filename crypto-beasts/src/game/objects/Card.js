import Phaser from 'phaser'

const CARD_PROPERTIES = {
  w: 102,
  h: 150,
  idle: 'card'
}

export default class Card extends Phaser.Physics.Arcade.Sprite {
    cardProperties(){
        return CARD_PROPERTIES;
    }
    
    constructor(scene,x,y,id, handX, handY, props) {
        super(scene, x, y, id)

        this.scene = scene;
        this.id = id;
        this.code = `card_${this.id}`;
        this.selected = false;
        this.enabled = false;
        this.initPos ={
            x: x,
            y: y
        }
        this.basePos = {
            x: handX,
            y: handY
        }
        this.props = props;

        //Create card sprite
        this.card = this.scene.physics.add.sprite(x, y, CARD_PROPERTIES.idle, 0).setName(`card_${this.id}`);
        this.card.setBounce(1, 1);
        this.card.setInteractive();

        //Create stat elements
        this.playerName = this.scene.add
          .text(0, 0, '')
          .setFontFamily('Arial')
          .setFontSize(12)
          .setColor('#000000')
          .setOrigin(0.5)
        // this.playerContainer.add(this.playerName)


        this.create();
    }

    create(){
        //Card that are not deck
        if(this.id !== 0){
            //Input down
            this.scene.input.on('gameobjectdown', (pointer, gameObject) => {
                if(this.code === gameObject.name && this.enabled){
                    this.selected = true;
                    this.scene.selectedCard = this.code;
                }
            });
            //Input up
            this.scene.input.on('pointerup', (pointer) => {
                if(this.selected === true){
                    const cell = this.scene.board.checkPlayed(pointer, this.card, this.props);
                    if(cell !== undefined){
                        if(!cell.err){
                            this.enabled = false;
                            this.resetPos(cell.x + (this.card.width/2), cell.y + (this.card.height/2));
                        }else{
                            console.log(cell.err)
                            this.resetPos();
                        }
                    }else{
                        this.resetPos();
                    }
                }
                
                this.scene.selectedCard = '';
            });

            //Mouse over
            this.scene.input.on('gameobjectover', (pointer, gameObject) => {
                if(this.code === gameObject.name && this.scene.selectedCard === '' && this.enabled){
                    this.card.setScale(1.2);
                    this.scene.cardDef.setProps(this.props)
                }
            });

            //Mouse out
            this.scene.input.on('gameobjectout', (pointer, gameObject) => {
                if(this.code === gameObject.name)
                    this.card.setScale(1);
            });
            
            this.setHandPos();
        }
    }

    update(mousePointer) {
        if(this.enabled === false){
            const tolerance = 13;
            const distance = Phaser.Math.Distance.BetweenPoints({x:this.card.x, y:this.card.y}, this.basePos);
            if (distance < tolerance){
                this.card.body.reset(this.basePos.x, this.basePos.y);
                this.enabled = true;
            }
        }else{
            //Move around
            if(this.selected === true){
                this.card.x = mousePointer.x;
                this.card.y = mousePointer.y;
            }
        }
    }

    /* Reset hand position */
    resetPos(x = this.basePos.x, y = this.basePos.y) {
        this.card.setScale(1);
        this.selected = false;
        this.card.x = x;
        this.card.y = y;
    }

    /* Move from deck to hand */
    setHandPos(){
        this.card.setFrame(1);
        this.scene.physics.moveToObject(this.card, this.basePos,500);
    }
}