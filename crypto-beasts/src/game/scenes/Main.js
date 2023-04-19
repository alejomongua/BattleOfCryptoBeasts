import Phaser, { Scene } from "phaser";
import Board from '../objects/Board'
import Card from '../objects/Card'
import CardDetail from '../objects/CardDetail'
import Stats from '../objects/Stats'

export default class Main extends Scene{
    
    constructor(){
        super('main')
        this.deck = undefined;//Visual Deck
        this.defDeck = [];//Deck to control cards draw
        this.hand = [];
        this.drawn = 0;
        this.selectedCard = '';

        //Constants
        this.handPosInit = {x:440,y:640};
        this.initStats = {hp: 50, ep: 10, hp_enemy: 50, ep_enemy: 10};


    }

    preload(){

    }
    
    create(){
        //TODO ==> Replace with returned deck def from metamask
        const deckDef = [
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
        ]

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

        //Hand
        const initCards = 5;
        for(var i = 0;i<initCards;i++){
            this.drawCard();
        }
        //this.updateHand();
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
        const newCard = new Card(this,930,610, this.defDeck[this.drawn].id, this.handPosInit.x + (cardSpacing * drawn),this.handPosInit.y, this.defDeck[this.drawn], "card_57");
        this.updateHand(newCard);
        this.drawn++;
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
            })
        }
    }
}