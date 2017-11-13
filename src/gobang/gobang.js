import Class from '../class/class';
import Eventer from '../eventer/eventer';
/**
 * 简单的围棋实现，
 * 主要是利用了面向对象和观察者模式，
 * 对象提供了如下几个方法，下棋，重来，启用机器人，悔棋和撤销悔棋
 * 在ui逻辑中只需要观察游戏状态的改变来做相应处理，无论是用dom或者是canvas实现
 * 基本可以做到不需要改变整个游戏对象的逻辑。
 */
var Gobang = Class(function() {
    this.countWinnerType();
    this.set();
},{
    /**
     * 基础属性
     */ 
    set : function() {
        this.currentType = 2;
        this.over = false;//游戏是否结束
        this.currentWay = [];//记录下棋的位置
        this.retract = [];//悔棋的推出的棋子位置
        this.activeComputer = false;//是否激活电脑
        this.getChessBoard();
        this.getPlayWin();
    },
    /**
     * 生成棋盘 没有填子时候保存数据为0
     */    
    getChessBoard : function(rows,clos) {
        var chessBoard = [];
        for(var i = 0; i < 15; i++) {
            chessBoard[i] = [];
            for(var j = 0; j < 15; j++) {
                chessBoard[i][j] = 0;
            }
        }
        this.chessBoard = chessBoard;
    },
    /**
     * 判断是否为和棋
     * @return {boolean} 结果
     */      
    judgeDrawnOne : function() {
        var count = 0;
        for(var i = 0; i < 15; i ++) {
            for(var j = 0; j < 15; j ++) {
                if(this.chessBoard[i][j]) {
                    count ++;
                }
            }
        }
        return count == 15 * 15;
    },
    /**
     * 穷尽所有赢的可能性
     */  
    countWinnerType : function() {
        var wins = [];
        var count = 0;
        for (var i = 0; i < 15; i++) {
            wins[i] = [];
            for (var j = 0; j < 15; j++) {
                wins[i][j] = []
            }
        }
        for (var i = 0; i < 15; i++) {
            for (var j = 0; j < 11; j++) {
                for (var k = 0; k < 5; k++) {
                    wins[i][j + k][count] = true;
                }
                count++;
            }
        }
        for (var i = 0; i < 15; i++) {
            for (var j = 0; j < 11; j++) {
                for (var k = 0; k < 5; k++) {
                    wins[j + k][i][count] = true;
                }
                count++;
            }
        }
        for (var i = 0; i < 11; i++) {
            for (var j = 0; j < 11; j++) {
                for (var k = 0; k < 5; k++) {
                    wins[i + k][j + k][count] = true;
                }
                count++;
            }
        }
        for (var i = 0; i < 11; i++) {
            for (var j = 14; j > 3; j--) {
                for (var k = 0; k < 5; k++) {
                    wins[i + k][j - k][count] = true;
                }
                count++;
            }
        }
        this.wins = wins;
        this.count = count;
    },
    /**
     * 初始化参数
     */  
    getPlayWin : function() {
        this.playerOneWins = [];
        this.playerTwoWins = [];
        for(var i = 0; i < this.count; i ++) {
            this.playerOneWins[i] = 0;
            this.playerTwoWins[i] = 0;
        }
    },
    /**
     * 下棋
     * @param {number} [i] 横坐标
     * @param {number} [j] 纵坐标
     * @param {function} [fn] 可以下棋时的回调,画出棋子的操作由框架之外进行
     * @return {object} 返回游戏对象
     */  
    playChess : function(i,j,fn) {
        var res;
        if(this.chessBoard[i][j] || this.over) return;
        this.currentType == 2 ? this.currentType = 1 : this.currentType = 2;
        typeof fn === 'function' && fn(i,j,this.currentType);
        this.chessBoard[i][j] = this.currentType;
        this.currentWay.push({i : i,j : j});

        if(this.currentType == 1) {
            for(var k = 0; k < this.count; k++) {
                if(this.wins[i][j][k]) {
                    this.playerOneWins[k]++;
                    this.playerTwoWins[k] = 6;
                    if(this.playerOneWins[k] == 5) {//玩家1胜出
                        this.over = true;
                        this.emit('over',this.currentType);//触发游戏结束
                    }
                }
            } 
            (!this.over && this.activeComputer) && this.autoPlay();          
        } else {
            for(var k = 0; k < this.count; k++) {
                if(this.wins[i][j][k]) {
                    this.playerTwoWins[k]++;
                    this.playerOneWins[k] = 6;
                    if(this.playerTwoWins[k] == 5) {//玩家2胜出
                        this.over = true;
                        this.emit('over',this.currentType);//触发游戏结束
                    }
                }
            }            
        }
        //和棋
        if(this.judgeDrawnOne()) {
            this.over = true;
            this.emit('over',0);//触发游戏结束,0代表和棋
        }
    },
    /**
     * 是否激活电脑
     * @param {boolean} [flag] 是否激活电脑
     * @return {object} 返回本对象
     */    
    computerPlay : function(flag) {
        this.activeComputer = flag;
        (flag && this.currentType == 1) && this.autoPlay();
        return this;
    },
    /**
     * 电脑走棋
     */  
    autoPlay : function() {
        var res = this.computer();
        var currentType = this.currentType;
        this.playChess(res.i,res.j,function(i,j,currentType){
            this.emit('computerPlay',i,j);//触发电脑走棋
        }.bind(this));
    },
    /**
     * 悔棋
     * @return {object} 返回本对象
     */  
    retractChess : function() {
        var chess = this.currentWay.pop();
        if(this.over) return;
        if(chess) {
            this.chessBoard[chess.i][chess.j] = 0;
            this.currentType == 2 ? this.currentType = 1 : this.currentType = 2;
            this.retract.push(chess);
            this.emit('retract',chess.i,chess.j);//触发悔棋回调
        }
        return this;
    },  
    /**
     * 撤销悔棋
     * @return {object} 返回本对象
     */ 
    revokeRetractChess : function() {
        var chess = this.retract.pop();
        if(this.over) return;
        chess && this.emit('antRetract',chess.i,chess.j);//触发撤销悔棋操作
        return this;
    },
    /**
     * 重来一局
     * @return {object} 返回本对象
     */     
    replay : function(fn) {
        this.set();
        this.emit('replay');//触发重玩
        return this;
    },
    /**
     * 电脑玩家
     * @return {object} 棋子的坐标信息
     */     
    computer : function() {
        var myScore = [];
        var computerScore = [];
        //max用于保存最高分数
        var max = 0;
        //保存最高分的坐标
        var u = 0, v = 0;
        
        for(var i = 0; i < 15; i++) {
            myScore[i] = [];
            computerScore[i] = [];
            for (var j = 0; j < 15; j++) {
                myScore[i][j] = 0;
                computerScore[i][j] = 0;
            }
        }
        //初始化完
        
        for(var i = 0; i < 15; i++) {
            for(var j = 0; j < 15; j++) {
                if(this.chessBoard[i][j] == 0) {
                    for(var k = 0; k < this.count; k++) {
                        if(this.wins[i][j][k]) {
                            if(this.playerOneWins[k] == 1) {
                                myScore[i][j] += 200;
                            } else if(this.playerOneWins[k] == 2) {
                                myScore[i][j] += 400;
                            } else if(this.playerOneWins[k] == 3) {
                                myScore[i][j] += 2000;
                            } else if(this.playerOneWins[k] == 4) {
                                myScore[i][j] += 10000;
                            }
                            if(this.playerTwoWins[k] == 1) {
                                computerScore[i][j] += 220;
                            } else if(this.playerTwoWins[k] == 2) {
                                computerScore[i][j] += 420;
                            } else if(this.playerTwoWins[k] == 3) {
                                computerScore[i][j] += 2100;
                            } else if(this.playerTwoWins[k] == 4) {
                                computerScore[i][j] += 20000;
                            }
                        }
                    }
                    if (myScore[i][j] > max) {
                        max = myScore[i][j];
                        u = i;
                        v = j;
                    } else if (myScore[i][j] == max) {
                        if (computerScore[i][j] > computerScore[u][v]) {
                            u = i;
                            v = j;
                        }
                    }
                    
                    if (computerScore[i][j] > max) {
                        max  = computerScore[i][j];
                        u = i;
                        v = j;
                    } else if (computerScore[i][j] == max) {
                        if (myScore[i][j] > myScore[u][v]) {
                            u = i;
                            v = j;
                        }
                    }
                }
            }        
        }
        return {i : u, j : v}
    }
},Eventer);

export default Gobang;