import Phaser, {Scene} from "phaser";
import {io} from 'socket.io-client';

export default class Wait extends Scene {

    constructor() {
        super('wait')

        // Socket instance
        this.socket = io(process.env.REACT_APP_CRYPTO_BEAST_BACK_END, {
            path: '/api/socket.io/',
            auth: {
                user: sessionStorage.getItem("userID")
            }
        });
    }

    preload() {}

    create() {
        this.find = this.add.text(0, 330, 'Find match!', {fixedWidth: 1000}).setAlign('center').setFontSize(40).setInteractive({useHandCursor: true}).on('pointerdown', () => {
            this.findMatch();
        }).on('pointerover', () => this.find.setStyle({fill: '#f39c12'})).on('pointerout', () => this.find.setStyle({fill: '#FFF'}))

        this.msg = this.add.text(0, 330, 'Searching game room', {fixedWidth: 1000}).setAlign('center').setVisible(false).setFontFamily('Agency FB').setFontSize(40).setColor('#ffffff')

        this.msgDots = this.add.text(0, 400, '.....', {fixedWidth: 1000}).setAlign('center').setVisible(false).setFontFamily('Agency FB').setFontSize(40).setColor('#ffffff')

        this.tweens.addCounter({
            from: 0,
            to: 5,
            repeat: 100000,
            onUpdate: tween => {
                this.msgDots.setText(".".repeat(Math.floor(tween.getValue())))
            }
        })

        /*Socket definition */
        // On session
        this.socket.on("session", (data) => {
            sessionStorage.setItem("sessionID", data.sessionID);
            this.socket.auth = {
                sessionID: data.sessionID
            };
        });

        // On match found
        this.socket.on("match_found", (data) => {
            this.scene.start('main', {
                socket: this.socket,
                room: data
            });
        });
    }

    findMatch() {
        this.find.setVisible(false);
        this.msg.setVisible(true);
        this.msgDots.setVisible(true);
        this.socket.emit("find_match");
    }
}
