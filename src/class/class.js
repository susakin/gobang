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
export default createClass;