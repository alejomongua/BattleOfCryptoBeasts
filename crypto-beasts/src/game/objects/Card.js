import Phaser from 'phaser'
import CipherService from '../../services/cipherService'; 

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
    
    constructor(scene,x,y,id, handX, handY, props, urlIMG, imgID = CARD_PROPERTIES.idle, scale=0.12, enemy=false) {
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
        this.urlIMG = urlIMG;
        this.imgID = imgID;
        this.props = props;

        //Create card sprite
        this.card = this.scene.physics.add.sprite(x, y, imgID).setName(`card_${this.id}`);
        this.card.setScale(scale)
        this.card.setBounce(1, 1);
        this.card.setInteractive();

        if(enemy === true)
            this.card.flipY = true;

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
                    if(!this.scene.playEnabled){
                        this.scene.msg.setMsg("Espera tu turno!");
                        return;
                    }
                    this.card.setDepth(1);
                    this.selected = true;
                    this.scene.selectedCard = this.code;
                }
            });
            //Input up
            this.scene.input.on('pointerup', (pointer) => {
                if(this.scene.playEnabled === true && this.selected === true){
                    const cell = this.scene.board.checkPlayed(pointer, this.card, this.props);
                    if(cell !== undefined){
                        if(!cell.err){//Card was placed on the board
                            const scale = 0.095;
                            this.enabled = false;
                            this.scene.msg.setMsg();
                            this.resetPos(cell.x + ((this.card.width*scale)/2), cell.y + ((this.card.height*scale)/2), scale);
                            
                            const msg = CipherService.encrypt({
                                cardId: this.id,
                                cardInfo: {...this.props, urlIMG: this.urlIMG},
                                posPlayed: { x: cell.x + ((this.card.width*scale)/2), y: cell.y - ((this.card.height*scale)/2)}
                            }, this.scene.room)

                            this.scene.socketMsg('card_played', msg)

                            this.checkEffect();
                        }else{//Error on placement of card
                            this.scene.msg.setMsg(cell.err);
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
                    this.card.setScale(0.16);
                    this.scene.cardDef.setProps(this.props, this.imgID)
                }
            });

            //Mouse out
            this.scene.input.on('gameobjectout', (pointer, gameObject) => {
                if(this.code === gameObject.name && this.enabled)
                    this.card.setScale(0.12);
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

    /*Check card effect */
    checkEffect(){
        switch(this.props.type){
            case 1://Monster
                const monsters = this.scene.enemyCards.map(x=>x.cardInfo).filter(x=>x.type === 1);
                if(monsters.length === 0){//Direct attack
                    const tmpY = this.card.y;
                    this.scene.tweens.addCounter({
                        from:0,
                        to:250,
                        duration: 500,
                        ease: Phaser.Math.Easing.Sine.In,
                        yoyo: true,
                        onUpdate: tween => {
                            this.card.y = tmpY - tween.getValue();
                        }
                    })
                    this.scene.stats.setStats({...this.scene.stats.stats, hp_enemy: this.scene.stats.stats.hp_enemy - this.props.attack})//Update enemy life
                }else{//Attack another monster

                }
                break;
            case 2://Ability
                break;
            case 3://Object
                break;
        }
    }

    /* Reset hand position */
    resetPos(x = this.basePos.x, y = this.basePos.y, scale = 0.12) {
        this.card.setDepth(0);
        this.card.setScale(scale);
        this.selected = false;
        this.card.x = x;
        this.card.y = y;

        if(scale === 0.095){//TEMP ==> Draw card when another one is played
            this.scene.updateHand(this.card,"remove");
        }
        this.scene.selectedCard = '';
    }

    /* Move from deck to hand */
    setHandPos(){
        this.card.setFrame(1);
        this.scene.physics.moveToObject(this.card, this.basePos,500);
    }
}