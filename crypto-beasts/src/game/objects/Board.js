import Phaser from 'phaser'

export default class Board extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, cardProperties) {
        super(scene);
        this.scene = scene;
        this.cardProperties = cardProperties;
        this.pos = {
            x: 360,
            y: 70
        }
        this.grid = {
            w: 6,
            h: 4
        }

        this.cells = [];
        
        //Create board grid
        this.board = this.scene.add.grid(this.pos.x, this.pos.y, cardProperties.board_w * this.grid.w, cardProperties.board_h * this.grid.h, cardProperties.board_w, cardProperties.board_h, 0x202020).setAltFillStyle().setOutlineStyle(0xffffff).setOrigin(0);
        this.board.setInteractive();

        this.create();
    }

    create(){
        const cellW = (this.board.width/this.grid.w);
        const cellH =(this.board.height/this.grid.h);
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

        const cellW = (this.board.width/this.grid.w);
        const cellH = (this.board.height/this.grid.h);
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

            const cellTmp = this.cells.find(cell_=>cell_.x === cell.x && cell_.y === cell.y);

            const cellIndex = {i: (cellTmp.x-this.board.x)/this.cardProperties.board_w, j:(cellTmp.y-this.board.y)/this.cardProperties.board_h};
            //Enemy cell validation
            if(cellIndex.j < 2)
                return { err: "Celda enemiga"};

            //Row validation
            if(cellIndex.j === 2 && cardProps.type !== 1)
                return { err: "Espacio de monstruos"};
            if(cellIndex.j === 3 && cardProps.type === 1)
                return { err: "Espacio de objetos y efectos"};

            if(cellTmp.card === ""){
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