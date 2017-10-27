import Class from '../class/class';
/**
 * 简易的观察者事件模型
 */
var Eventer = Class(function() {
    this.listner = {};
},{
    /**
     * 事件绑定
     * @param {string} [type] 事件名称
     * @param {function} [fn] 绑定的方法
     */
    on : function(type,fn) {
        !this.listner[type] && (this.listner[type] = []);
        fn && this.listner[type].push(fn);
    },
    /**
     * 取消事件绑定
     * @param {string} [type] 事件名称
     * @param {function} [fn] 绑定的方法
     */
    off : function(type,fn) {
        if(!this.listner[type]) return;
        if(!fn) {
            delete this.listner[type];
            return;
        }
        this.listner[type].forEach(function(obj,i,arr) {
            if(obj === fn) {
                arr.splice(i,1);
                return true;
            }
        });
    },
    /**
     * 绑定一次
     * @param {string} [type] 事件名称
     * @param {function} [fn] 绑定的方法
     */
    once : function (type,fn) {
        var that = this;
        var one = function(ev) {
            fn && fn(ev);
            that.off(type, one);
        };
        this.on(type, one);      
    },
    /**
     * 执行事件
     * @param {string} [type] 事件名称
     */
    emit : function(type) {
        if(!this.listner[type]) return;
        var arg = [];
        for(var i = 1; i < arguments.length; i ++) {
            arg.push(arguments[i]);
        }
        if(typeof this.listner[type] === 'function') {
            this.listner[type].apply(this,arg);
            return;
        }
        this.listner[type].forEach(function(obj,i,arr) {
            obj && obj.apply(this,arg);
        });
    },
    /**
     * 清空所有绑定事件
     */
    clear : function() {
        this.listner = {};
    }
});

export default Eventer;