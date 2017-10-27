import Class from '../class/class';
import Eventer from '../eventer/eventer';
//https://code.csdn.net/qq_19427739/js_ai_wuziqi/tree/master/script.js
//https://github.com/airingursb/AiringGo/blob/master/js/AiringGo.js
/**
 * 简单的gobang
 * @param {number} [rows] 行数
 * @param {number} [clos] 列数
 */
var Gobang = Class(function(rows,clos) {
    this.rows = rows;
    this.clos = clos;
},{
    /**
     * 生成棋盘 没有填子时候保存数据为0
     * @param {number} [rows] 行数
     * @param {number} [clos] 列数
     */    
    getChessBoard : function(rows,clos) {
        this.chessBoard = [];
        for(var i = 0; i < rows; i ++) {
            this.chessBoard[i] = [];
            for(var j = 0; j < clos; j ++) {
                this.chessBoard[i][j] = 0;
            }
        }
    },
    /**
     * 穷尽所有赢的可能性
     * @param {number} [rows] 行数
     * @param {number} [clos] 列数
     */  
    countWinnerType : function(rows,clos) {
        var winner = [];
        var allType = 0;
        var winNum = 5;
        for(var i = 0; i < rows; i ++) {
            winner[i] = [];
            for(var j = 0; j < clos; j ++) {
                winner[i][j] = [];
            }
        }
        //横向
        for(var i = 0; i < rows; i ++) {
            for(var j = 0; j <= clos - winNum; j ++) {
                for(var k = 0; k < winNum; k ++) {
                    winner[i][j + k][allType] = true;
                }
                allType ++;
            }
        }
        //竖向
        for(var i = 0; i < clos; i ++) {
            for(var j = 0; j <= rows - winNum; j ++) {
                for(var k = 0; k < winNum; k ++) {
                    winner[j + k][i][allType] = true;
                }
                allType ++;
            }
        }
        //正斜
        for(var i = 0; i <= row - winNum; i ++) {
            for(var j = 0; j <= cols - winNum; j ++) {
                for(var k = 0; k < winNum; k ++) {
                    winner[i + k][j + k][allType] = true;
                }
                allType ++;
            }
        }
        //反斜
        for(var i)
    }
},Eventer);

export default Gobang;