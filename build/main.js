(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
	typeof define === 'function' && define.amd ? define(factory) :
	(global.Player = factory());
}(this, (function () { 'use strict';

/**
 * 创建类
 * @param {function} constructor 构造函数
 * @param {object} [methods] 方法
 * @param {function} [Parent] 父类
 * @param {function(args)|array} [parentArgs] 传递给父类的参数，默认与子类构造函数参数一致
 * @return {function} 类
 */
function createClass(constructor, methods, Parent, parentArgs) {
    var $Class = Parent ? function() {
        Parent.apply(
            this,
            parentArgs ?
                (typeof parentArgs === 'function' ? parentArgs.apply(this, arguments) : parentArgs) :
                arguments
        );
        constructor.apply(this, arguments);
    } : function() { constructor.apply(this, arguments); };
    if (Parent) {
        var $Parent = function() { };
        $Parent.prototype = Parent.prototype;
        $Class.prototype = new $Parent();
        $Class.prototype.constructor = $Class;
    }
    if (methods) {
        for (var m in methods) {
            if ( methods.hasOwnProperty(m) ) {
                $Class.prototype[m] = methods[m];
            }
        }
    }
    return $Class;
}

/**
 * 简易的观察者事件模型
 */
var Eventer = createClass(function() {
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

/**
 * 播放器底部的操作条
 * @param {object} 播放器对象
 */
function Toolbar(player){
    this.player = player;
    this.getFaBox(player.wrapper);
    this.getTimeBox();
    this.getFaProgress();
    this.getBufferBar();
    this.getPlayBar();
    this.getFullscreenBtn();
    this.getPreviewBox();
    this.getPreviewInner();
    this.getPreviewVideo();
    this.getPlayBtn();
}
Toolbar.prototype = {
    /**
     * 生成toolbar 最外层的父元素
     * @param {object} 播放器父元素
     */
    getFaBox : function(wrapper){
        var style = {
            "padding-bottom" : "1em",
            "padding-left": "1.5em",
            "padding-right": "1em",
            "line-height": "36px",
            "background": "linear-gradient(rgba(0,0,0,0),rgba(0,0,0,.1),rgba(0,0,0,.3))",
            "position" : "absolute",
            "left" : "0",
            "bottom" : "0",
            "width" : "calc(100% - 2.5em)",
            "height" : "36px",
            "transition" : "opacity .3s ease",
            "opacity" : "0"
        };
        this.faBox = document.createElement('div');
        this.styleEnable(this.faBox,style);
        wrapper.appendChild(this.faBox);
        wrapper.addEventListener('mousemove',function() {
            this.faBox.style.opacity = 1;
        }.bind(this),true);
        wrapper.addEventListener('mouseout',function() {
            this.faBox.style.opacity = 0;
        }.bind(this),true);
    },
    /**
     * 生成toolbar 显示时间的元素
     */
    getTimeBox : function() {
        var style = {
            "float": "left",
            "width": "70px",
            "color": "#FFF",
            "text-shadow": "1px 1px 0 rgba(0,0,0,.5)",
            "font-size": "14px",
            "font-family": "monospace",
            "font-weight": "700",      
            "text-align" : "center",
            "height" : "100%"
        };
        this.timeBox = document.createElement('time');
        this.timeBox.innerHTML = "-00:00&nbsp;";
        this.styleEnable(this.timeBox,style);
        this.faBox.appendChild(this.timeBox);
        this.player.on('playProgress',function(per,currentTime,duration) {
           this.timeBox.innerHTML = '-' + this.format(duration - currentTime) + '&nbsp;';
        }.bind(this));
    },
    /**
     * 生成toolbar 时间轴的父亲元素
     */
    getFaProgress : function() {
        var style = {
            "float" : "left",
            "width" : "calc(100% - 120px)",
            "padding": "1em 0",
            "cursor": "ew-resize",

            "position": "relative"         
        },peLeft;
        this.faProgress = document.createElement('div');
        this.styleEnable(this.faProgress,style);
        this.faBox.appendChild(this.faProgress);
        this.faProgress.addEventListener('mousemove',function(event) {
            var width = this.faProgress.getBoundingClientRect().width;
            var left = this.faProgress.getBoundingClientRect().left;
            var percent = (event.pageX - left) / width;
            var temp = percent * (this.player.video.duration || 0);
            this.previewBox.style.display = 'block';
            this.video.currentTime = Math.round(temp);
            peLeft = (this.video.currentTime / this.player.video.duration * 100) + '%';
            this.previewBox.style.left = 'calc('+ peLeft +' - 1.5px)';
        }.bind(this),false);

        this.faProgress.addEventListener('mouseout',function() {
            this.previewBox.style.display = 'none';
        }.bind(this),false);

        this.faProgress.addEventListener('click',function() {
            this.playBar.style.width = peLeft;
            this.player.video.currentTime = this.video.currentTime;
            this.player.video.play();
        }.bind(this),false);
    },
    /**
     * 生成缓冲bar
     */
    getBufferBar : function() {
        var style = {
            "height" : "5px",
            "max-width" : "100%",
            "min-width" : "5px",
            "border-radius" : "9em",
            "pointer-events" : "none",
            "position" : "absolute",
            "background" : "rgba(255,255,255,.1)",
        };
        this.bufferBar = document.createElement("i");
        this.styleEnable(this.bufferBar,style);
        this.faProgress.appendChild(this.bufferBar);
        this.player.on('bufferProgress',function(percent) {
            this.bufferBar.style.width = 100 * percent + '%';
        }.bind(this));
    },
    /**
     * 生成播放bar
     */
    getPlayBar : function() {
        var style = {
            "height" : "5px",
            "max-width" : "100%",
            "min-width" : "5px",
            "border-radius" : "9em",
            "pointer-events" : "none",
            "position" : "absolute",
            "background" : "rgba(255,255,255,.9)"
        };
        this.playBar = document.createElement("b");
        this.styleEnable(this.playBar,style);
        this.faProgress.appendChild(this.playBar);
        this.player.on('playProgress',function(percent) {
            this.playBar.style.width = 100 * percent + '%';
        }.bind(this));
    },
    /**
     * 生成全屏btn
     */
    getFullscreenBtn : function() {
        var style = {
            "float" : "left",
            "border" : 0,
            "margin" : 0,
            "padding" : 0,
            "height" : "36px",
            "width" : "50px",
            "background" : "url('data:image/svg+xml;utf8,<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 24 24\"><path d=\"M6,12H4V6h13v2H6V12z M22,20H9v-2h11v-4h2V20z\" style=\"fill:rgba(0,0,0,.2);\"/><path d=\"M5,11H3V5h13v2H5V11z M21,19H8v-2h11v-4h2V19z\" style=\"fill:#FFF\"/></svg>') 50% 50% no-repeat",
            "background-size" : "24px",
            "cursor" : "pointer"            
        };
        this.fullscreenBtn = document.createElement("btn");
        this.styleEnable(this.fullscreenBtn,style);
        this.faBox.appendChild(this.fullscreenBtn);

        var el,head = document.getElementsByTagName('head')[0];
        this.fullscreenBtn.addEventListener('click',function() {
            var element = document.documentElement;
            if(el) {
                el && head.removeChild(el);
                el = null;
                if(document.exitFullscreen) { 
                    document.exitFullscreen(); 
                } else if(document.mozExitFullScreen) { 
                    document.mozExitFullScreen(); 
                } else if(document.webkitExitFullscreen) { 
                    document.webkitExitFullscreen(); 
                } 
            } else {
                el = document.createElement('style');
                el.type = 'text/css';
                el.innerHTML = this.player.wrapperName + "{position:fixed;top:0;left:0;width:100%;height:100%;}";
                head.appendChild(el);
                if(element.requestFullScreen) {
                    element.requestFullScreen(); 
                } else if(element.mozRequestFullScreen) {
                    element.mozRequestFullScreen(); 
                } else if(element.webkitRequestFullScreen) {
                    element.webkitRequestFullScreen(); 
                }     
            }       
        }.bind(this),false);
        
        document.addEventListener("webkitfullscreenchange",function() {
            if(!(document.fullscreenEnabled || window.fullScreen || document.webkitIsFullScreen || document.msFullscreenEnabled)) {
                el && head.removeChild(el);
                el = null;                
            }
        },false);
    },
    /**
     * 生成预览容器
     */
    getPreviewBox : function() {
        var style = {
            "position" : "absolute",
            "left" : 0,
            "top" : "calc(1em + 1px)",
            "height" : "3px",
            "width" : "3px",
            "background" : "red",
            "border-radius" : "2px",
            "transition" : "0.1s linear left",
            "display" : "none"
        };
        this.previewBox = document.createElement("div");
        this.styleEnable(this.previewBox,style);
        this.faProgress.appendChild(this.previewBox);
    },
    getPreviewInner : function() {
        var style = {
            "position" : "absolute",
            "bottom" : "25px",
            "left" : "-81px",
            "background" : "#222",
            "padding" : "1px",
            "border-radius" : "2px",
            "box-shadow" : "0 1px 2px rgba(0,0,0,.2)",
            "width" : "160px",
            "height" : "90px",
            "pointer-events" : "none"
        };
        var bStyle = {
            "position": "absolute",
            "left" : "50%",
            "top" : "100%",
            "margin-left" : "-5px",
            "border" : "5px solid transparent",
            "border-bottom" :"0",
            "border-top" : "5px solid #222"
        };
        this.previewInner = document.createElement("div");
        var b = document.createElement("b");
        this.styleEnable(this.previewInner,style);
        this.styleEnable(b,bStyle);
        this.previewInner.appendChild(b);
        this.previewBox.appendChild(this.previewInner);
    },
    getPreviewVideo : function() {
        this.video = document.createElement('video');
        var attribute = {
            src : this.player.video.src,
            poster : this.player.video.poster,
            width : '100%',
            height : '100%'
        };
        for(var i in attribute) {
            this.video.setAttribute(i,attribute[i]);
        }    
        this.previewInner.appendChild(this.video);
    },
    getPlayBtn : function() {
        this.playBtn = document.createElement('i');
        var style = {
            "position" : "absolute",
            "left" : "50%",
            "top" : "50%",
            "margin" : "-80px 0 0 -60px",
            "border" : "80px solid transparent",
            "border-right" : 0,
            "border-left" : "#FFF 140px solid",
            "transition" : ".3s ease",
            "transform" : "scale(.05) rotate(90deg)",
            "opacity" : "0",
            "pointer-events" : "none"
        };
        this.styleEnable(this.playBtn,style);
        this.player.wrapper.appendChild(this.playBtn);
    },
    hidePlayBtn : function() {
        var style = {
            "transform" : "scale(.05) rotate(90deg)",
            "opacity" : "0"
        };
        this.styleEnable(this.playBtn,style);
    },
    showPlayBtn : function() {
        var style = {
            "transform" : "scale(1) rotate(0deg)",
            "opacity" : "1"
        };
        this.styleEnable(this.playBtn,style);
    },
    destory : function() {
        this.player.wrapper.removeChild(this.faBox);
    },
    /**
     * 设置元素
     * @param {object} [ele] 元素
     * @param {style} [style] 属性集合
     */    
    styleEnable : function(ele,style) {
        for(var i in style) {
            ele.style[i] = style[i];
        }        
    },
    /**
     * 格式化时间
     * @param {number} [seconds] 秒数
     * @param {sring} 格式化之后的时间
     */  
    format : function(showTime) {
        var seconds = showTime < 0 ? 0 : showTime;
        var times = [1, 60], result = [ ], temp, digit = 2;
        while (--digit >= 0) {
            temp = seconds / times[digit];
            if (temp >= 1) {
                temp = parseInt(temp);
                result.push(temp < 10 ? '0' + temp : temp);
                seconds -= temp * times[digit];
            } else {
                result.push('00');
            }
        }
        return result.join(":");
    }
};

/**
 * player for pc
 * @param {string} [wrapper] video标签的父元素
 */
var Player = createClass(function(wrapper) {
	this.wrapperName = wrapper;
	this.wrapper = document.querySelector(wrapper);
},{
	/**
	 * 播放视频
	 * @param {string} [src] 视频地址
	 * @param {string} [poster] 封面地址
	 * @param {string} [title] 标题
	 * @param {string} [description] 描述
	 */
	playVideo : function(src,poster,title,description) {
		this.video = document.createElement('video');
		var attribute = {
			src : src,
			poster : poster,
			playsinline : '',
			autoplay : '',
			width : '100%',
			height : '100%'
		};
		for(var i in attribute) {
			this.video.setAttribute(i,attribute[i]);
		}
		this.wrapper.appendChild(this.video);
		this.bufferProgress(this.video);
		this.playProgress(this.video);
		this.toolbar && this.toolbar.destory();
		this.toolbar = new Toolbar(this);
		this.playOrPause(this.video);
	},
	/**
	 * 加载缓存回调函数
	 * @param {object} [video] video对象
	 */
	bufferProgress : function(video) {
		var progress = function() {
			var percent = 0;
			if(video.buffered && video.buffered.length > 0 && video.buffered.end && video.duration) {
				percent = video.buffered.end(0) / video.duration;
			} else if(video.bytesTotal != undefined && video.bytesTotal > 0 && video.bufferedBytes != undefined){
				percent = video.bufferedBytes / video.bytesTotal;
			}
			percent = Math.min(1, Math.max(0, percent));
			this.emit('bufferProgress',percent);
		};
		video.addEventListener('progress',progress.bind(this),false);
		video.addEventListener('canplaythrough',progress.bind(this),false);
	},
	/**
	 * 播放时候回调
	 * @param {object} [video] video对象
	 */	
	playProgress : function(video) {
		video.addEventListener('timeupdate',function() {
			var percent = video.currentTime/ video.duration;
			this.emit('playProgress',percent,video.currentTime,video.duration);
		}.bind(this),false);
	},
	playOrPause : function(video) {
		video.addEventListener('click',function() {
			if(video.paused) {
				video.play();
				this.toolbar.hidePlayBtn();
			} else {
				video.pause();
				this.toolbar.showPlayBtn();	
				this.emit('pause',video.currentTime);
			}
		}.bind(this),true);
	}
},Eventer);

return Player;

})));
