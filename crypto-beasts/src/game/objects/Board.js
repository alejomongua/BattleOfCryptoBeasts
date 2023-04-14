import Phaser from 'phaser'

export default class Board extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, cardProperties) {
        super(scene);
        this.scene = scene;
        this.pos = {
            x: 340,
            y: 120
        }

        this.cells = [];
        
        //Create board grid
        this.board = this.scene.add.grid(this.pos.x, this.pos.y, cardProperties.w * 5, cardProperties.h * 2, cardProperties.w, cardProperties.h, 0x202020).setAltFillStyle().setOutlineStyle(0xffffff).setOrigin(0);
        this.board.setInteractive();

        this.create();
    }

    create(){
        const cellW = (this.board.width/5);
        const cellH =(this.board.height/2);
        for(var i= this.board.x; i<this.board.x+this.board.width;i+=cellW){
            for(var j= this.board.y; j<this.board.y+this.board.height;j+=cellH){
                this.cells.push(
                    {x: i, y: j, card: ''}
                )
            }
        }
    }
    
    update() {
        
    }

    checkPlayed(pointer, card, cardProps){
        //Energy validation
        if(cardProps.energy > this.scene.stats.stats.ep)
            return { err: "Energía insuficiente"};

        const cellW = (this.board.width/5);
        const cellH =(this.board.height/2);
        if(pointer.upX > this.pos.x && pointer.upX < this.pos.x + this.board.width && pointer.upY > this.pos.y && pointer.upY < this.pos.y + this.board.height){
            let minDistance = 999;
            let cell = undefined;
            this.cells.map((cell_)=>{
                const distance = Phaser.Math.Distance.BetweenPoints({x:cell_.x + (cellW /2) , y:cell_.y +(cellH /2)}, {x: pointer.upX, y:pointer.upY});
                if(distance < minDistance){
                    minDistance = distance;
                    cell = {x: cell_.x, y: cell_.y}
                }
            })
            if(this.cells.find(cell_=>cell_.x === cell.x && cell_.y === cell.y).card === ""){
                this.cells.find(cell_=>cell_.x === cell.x && cell_.y === cell.y).card = card.name;//Set card cell
                this.scene.stats.setStats({...this.scene.stats.stats, ep: this.scene.stats.stats.ep - cardProps.energy})//Update energy
                return cell;
            }else{
                return undefined;
            }
        }else{
            return undefined;
        }
    }
}