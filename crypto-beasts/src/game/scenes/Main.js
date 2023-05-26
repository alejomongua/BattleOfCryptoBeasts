import Phaser, { Scene } from "phaser";
import Board from '../objects/Board'
import Card from '../objects/Card'
import CardDetail from '../objects/CardDetail'
import Stats from '../objects/Stats'
import Message from '../objects/Message'
import CipherService from '../../services/cipherService'; 

export default class Main extends Scene{
    
    constructor(){
        super('main')
        this.deck = undefined;//Visual Deck
        this.enemyCards = [];//Enemy board cards
        this.defDeck = [];//Deck to control cards draw
        this.hand = [];
        this.drawn = 0;
        this.selectedCard = '';
        this.playEnabled = false;

        this.turn = 0;

        //Constants
        this.handPosInit = {x:440,y:640};
        this.initStats = {hp: 50, ep: 0, hp_enemy: 50, ep_enemy: 15};

        //Socket instance
        this.socket = undefined;
        
        //Match room instance
        this.room = "";
    }

    init(data){
        this.socket = data.socket;
        this.room = data.room;
    }

    preload(){

    }
    
    create(){
        const cards = JSON.parse(sessionStorage.getItem("cards"));
        const deckDef = cards.map(card=>{
            return {
                ...card.def,
                id: card.tokenId,
                rarity: card.rarity,
                urlIMG: card.urlImg
            }
        })
        
        //TODO ==> Replace with returned deck def from metamask
        /*const deckDef = [
            {
                id:"creat_01",
                type: "creature",
                name: "Fierce Gryphon",
                energy: 6,
                attack: 7,
                defense: 5,
                effect: "",
                effectDef: "Al ser jugado, todas las criaturas aliadas pierden 2 puntos de ataque"
            },
            {
                id:"creat_02",
                type: "creature",
                name: "Noble Unicorn",
                energy: 4,
                attack: 4,
                defense: 4,
                effect: "",
                effectDef: "Cura a una criatura aliada en 2 puntos de vida cuando es jugado"
            },
            {
                id:"creat_03",
                type: "creature",
                name: "Ancient Dragon",
                energy: 8,
                attack: 9,
                defense: 7,
                effect: "",
                effectDef: "Reduce la energía máxima del jugador en 2 puntos"
            },
            {
                id:"creat_04",
                type: "creature",
                name: "Shadow Wolf",
                energy: 3,
                attack: 3,
                defense: 3,
                effect: "",
                effectDef: "Gana sigilo durante un turno, lo que le hace inmune a los ataques enemigo"
            },
            {
                id:"creat_05",
                type: "creature",
                name: "Enchanted Golem",
                energy: 7,
                attack: 5,
                defense: 9,
                effect: "",
                effectDef: "El jugador sólo púede jugar una carta adicional en el turno en que se juega el Gólem Encantado"
            },
            {
                id:"creat_06",
                type: "creature",
                name: "Merfolk Sorcerer",
                energy: 5,
                attack: 3,
                defense: 4,
                effect: "",
                effectDef: "Al ser jugado, devuelve una carta de habilidad del cementerio a la mano del jugador"
            },
            {
                id:"creat_07",
                type: "creature",
                name: "Wind Spirit",
                energy: 2,
                attack: 1,
                defense: 1,
                effect: "",
                effectDef: "Otorga a una criatura aliada la habilidad de volar, lo que la hace inmune a los ataques de cristuras sin volar"
            }
        ]*/

        this.shufleDeck(deckDef);

        //Deck
        this.deck = new Card(this,930,610, 0);

        //Board
        const cardProperties = this.deck.cardProperties();
        this.board = new Board(this, cardProperties);

        //Card def
        this.cardDef = new CardDetail(this);

        //Stats
        this.stats = new Stats(this);
        this.stats.setStats(this.initStats)

        //Stats
        this.msg = new Message(this);

        //Hand
        const initCards = 5;
        for(var i = 0;i<initCards;i++){
            this.drawCard();
        }
        

        /*Socket definition */
        //On start turn
        this.socket.on("start_turn", (data)=>{
            this.msg.changeVisibility();
            setTimeout(()=>{
                this.playEnabled = true;
                this.turn++;
                this.drawCard();
            },1000, this)
        });

        //On Receive enemy play
        this.socket.on("enemy_play", (data_)=>{
            const data = JSON.parse(CipherService.decrypt(data_, this.room));
            //Set enemy card on board
            const newX = 6 - ((data.posPlayed.x - 360)/80);
            const tmpY = (data.posPlayed.y - 70)/117;
            const newY = tmpY - ((tmpY-2)*3) - (data.cardInfo.type > 1 ? 0:1);
            const offSet = {
                x: -1,
                y: 15
            }
            this.load.image(`card_${data.cardId}`, data.cardInfo.urlIMG);
            this.load.once(Phaser.Loader.Events.COMPLETE, () => {
                let cardTmp = new Card(this, 360+(newX*80) + offSet.x,(newY*117) + offSet.y, 0, undefined, undefined, undefined, undefined, `card_${data.cardId}`, 0.095, true);
                this.enemyCards.push(data);
            });
            this.load.start();            
            
            //Update energy stats
            this.stats.setStats({...this.stats.stats, ep_enemy: this.stats.stats.ep_enemy - data.cardInfo.energy})//Update enemy energy
        });
    }

    update(){
        this.deck.update();
        this.hand.map(card=>{
            card.update(this.input.mousePointer);
        });
    }

    shufleDeck(baseDeck){
        this.defDeck = baseDeck
            .map(value => ({ value, sort: Math.random() }))
            .sort((a, b) => a.sort - b.sort)
            .map(({ value }, i) => {return {...value, index: i}})
    }

    drawCard(){
        const cardSpacing = 80;
        const drawn = this.hand.length;
        const newCard = new Card(this,930,610, this.defDeck[this.drawn].id, this.handPosInit.x + (cardSpacing * drawn),this.handPosInit.y, this.defDeck[this.drawn], this.defDeck[this.drawn].urlIMG, `card_${this.defDeck[this.drawn].id}`);
        this.updateHand(newCard);
        this.drawn++;
        //Update energy stats
        this.stats.setStats({...this.stats.stats, ep: this.stats.stats.ep + 3})//Update energy
    }

    updateHand(card, action = "add"){
        if(action === "add"){//Add new card to hand
            this.hand.push(card);
        }else{//Remove hand from hand
            this.hand.splice(this.hand.findIndex(x=>x.code === card.name), 1);
            this.arrangeHand(true);
        }
    }

    arrangeHand(isRemove = false){
        if(this.drawn > 5 || isRemove){
            const cardSpacing = ((this.hand.length)*10)+(30-((this.hand.length-5)*20));
            this.hand.map((card,i)=>{
                card.card.x =  this.handPosInit.x + (cardSpacing * i);
                card.basePos.x = card.card.x;
            })
        }
    }

    endTurn(){
        this.playEnabled = false;
        this.socketMsg("end_turn", true);    
    }

    socketMsg(event, msg){
        this.socket.emit(event,msg);
    }
}