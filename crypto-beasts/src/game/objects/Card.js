import Phaser from 'phaser'

const CARD_PROPERTIES = {
  w: 102,
  h: 150,
  board_w: 80,
  board_h: 117,
  idle: 'card'
}

export default class Card extends Phaser.Physics.Arcade.Sprite {
    cardProperties(){
        return CARD_PROPERTIES;
    }
    
    constructor(scene,x,y,id, handX, handY, props, urlImg = CARD_PROPERTIES.idle) {
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
        this.card = this.scene.physics.add.sprite(x, y, urlImg).setName(`card_${this.id}`);
        this.card.setScale(0.15)
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
                            const scale = 0.1;
                            this.enabled = false;
                            this.resetPos(cell.x + ((this.card.width*scale)/2), cell.y + ((this.card.height*scale)/2), scale);
                        }else{
                            console.log(cell.err)
                            this.resetPos();
                        }
                    }else{
                        this.resetPos();
                    }
                }
            });

            //Mouse over
            this.scene.input.on('gameobjectover', (pointer, gameObject) => {
                if(this.code === gameObject.name && this.scene.selectedCard === '' && this.enabled){
                    this.card.setScale(0.20);
                    this.scene.cardDef.setProps(this.props)
                }
            });

            //Mouse out
            this.scene.input.on('gameobjectout', (pointer, gameObject) => {
                if(this.code === gameObject.name && this.enabled)
                    this.card.setScale(0.15);
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
                this.scene.arrangeHand();
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
    resetPos(x = this.basePos.x, y = this.basePos.y, scale = 0.25) {
        this.card.setScale(scale);
        this.selected = false;
        this.card.x = x;
        this.card.y = y;

        if(scale !== 1){
            this.scene.updateHand(this.card,"remove");
            setTimeout(()=>{
                this.scene.drawCard();
            },2000, this)
        }
        this.scene.selectedCard = '';
    }

    /* Move from deck to hand */
    setHandPos(){
        this.card.setFrame(1);
        this.scene.physics.moveToObject(this.card, this.basePos,500);
    }
}