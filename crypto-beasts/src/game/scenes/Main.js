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
        this.handPosInit = {x:440,y:580};

    }

    preload(){

    }

    
    create(){
        //TODO ==> Replace with returned deck def from metamask
        const deckDef = [
            {
                type: "creature",
                name: "Fierce Gryphon",
                energy: 6,
                attack: 7,
                defense: 5,
                effect: "",
                effectDef: "Al ser jugado, todas las criaturas aliadas pierden 2 puntos de ataque"
            },
            {
                type: "creature",
                name: "Noble Unicorn",
                energy: 4,
                attack: 4,
                defense: 4,
                effect: "",
                effectDef: "Cura a una criatura aliada en 2 puntos de vida cuando es jugado"
            },
            {
                type: "creature",
                name: "Ancient Dragon",
                energy: 8,
                attack: 9,
                defense: 7,
                effect: "",
                effectDef: "Reduce la energía máxima del jugador en 2 puntos"
            },
            {
                type: "creature",
                name: "Shadow Wolf",
                energy: 3,
                attack: 3,
                defense: 3,
                effect: "",
                effectDef: "Gana sigilo durante un turno, lo que le hace inmune a los ataques enemigo"
            },
            {
                type: "creature",
                name: "Enchanted Golem",
                energy: 7,
                attack: 5,
                defense: 9,
                effect: "",
                effectDef: "El jugador sólo púede jugar una carta adicional en el turno en que se juega el Gólem Encantado"
            },
            {
                type: "creature",
                name: "Merfolk Sorcerer",
                energy: 5,
                attack: 3,
                defense: 4,
                effect: "",
                effectDef: "Al ser jugado, devuelve una carta de habilidad del cementerio a la mano del jugador"
            },
            {
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
        this.deck = new Card(this,930,510, 0);

        //Board
        const cardProperties = this.deck.cardProperties();
        this.board = new Board(this, cardProperties);

        //Card def
        this.cardDef = new CardDetail(this);

        //Stats
        this.stats = new Stats(this);
        this.stats.setStats({hp: 50, ep: 3, hp_enemy: 50, ep_enemy: 3})

        //Hand
        const initCards = 5;
        const cardSpacing = ((initCards)*10)+(30-((initCards-5)*20));
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
        this.hand.push(new Card(this,730,510, this.drawn+1, this.handPosInit.x + (cardSpacing * this.drawn),this.handPosInit.y, this.defDeck[this.drawn]));
        this.drawn++;
    }

    updateHand(){
        const cardSpacing = ((this.hand.length)*10)+(30-((this.hand.length-5)*20));
        this.hand.map((card,i)=>{
            card.card.x =  this.handPosInit.x + (cardSpacing * i);
        })
    }
}