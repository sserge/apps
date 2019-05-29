(function () {
        var $jscomp = {scope:{}};
        $jscomp.defineProperty = "function" == typeof Object.defineProperties ? Object.defineProperty : function(a,g,b){
                if(b.get||b.set)
                        throw new TypeError("ES3 does not support getters and setters.");
                a != Array.prototype && a != Object.prototype && (a[g] = b.value)
        };
        $jscomp.getGlobal = function(a) {
                return "undefined" != typeof window && window === a ? a : "undefined" != typeof global && null != global ? global: a
        };
        $jscomp.global = $jscomp.getGlobal(this);
        $jscomp.SYMBOL_PREFIX = "jscomp_symbol_";
        $jscomp.initSymbol = function() {
                $jscomp.initSymbol = function() {};
                $jscomp.global.Symbol || ($jscomp.global.Symbol = $jscomp.Symbol)
        };
        $jscomp.symbolCounter_ = 0;
        $jscomp.Symbol = function(a){
                return $jscomp.SYMBOL_PREFIX + (a || "") + $jscomp.symbolCounter_++
        };
        $jscomp.initSymbolIterator = function() {
                $jscomp.initSymbol();
                var a = $jscomp.global.Symbol.iterator;
                a || (a = $jscomp.global.Symbol.iterator = $jscomp.global.Symbol("iterator"));
                "function" != typeof Array.prototype[a] && $jscomp.defineProperty(
                        Array.prototype, a, {
                                configurable:!0,
                                writable:!0,
                                value:function(){return $jscomp.arrayIterator(this)}
                        }
                );
                $jscomp.initSymbolIterator=function(){}
        };
        $jscomp.arrayIterator = function(a){
                var g=0;re
                turn $jscomp.iteratorPrototype(function(){return g<a.length ? {done:!1,value:a[g++]} : {done:!0}})
        };
        $jscomp.iteratorPrototype = function(a){
                $jscomp.initSymbolIterator();
                a = {next:a};
                a[$jscomp.global.Symbol.iterator] = function(){return this};
                return a
        };
        $jscomp.polyfill = function(a,g,b,e){
                if (g) {
                        b = $jscomp.global;
                        a = a.split(".");
                        for (e = 0; e < a.length-1; e++) {
                                var f = a[e];
                                f in b || (b[f] = {});
                                b = b[f]
                        }
                        a = a[a.length-1];
                        e = b[a];
                        g = g(e);
                        g != e && null != g && $jscomp.defineProperty(b, a, {configurable:!0,writable:!0,value:g})
                }
        };
        $jscomp.polyfill(
                "Array.from",
                function(a){
                        return a ? a: function(a,b,e) {
                                $jscomp.initSymbolIterator();
                                b = null != b ? b : function(c){return c};
                                var f = [],
                                    k = a[Symbol.iterator];
                                if ("function" == typeof k)
                                        for (a = k.call(a); !(k = a.next()).done;)
                                                f.push(b.call(e, k.value));
                                else
                                        for (var k = a.length, c=0; c < k; c++)
                                                f.push(b.call(e,a[c]));
                                return f
                        }
                },
                "es6-impl",
                "es3"
        );        
        $jscomp.polyfill(
                "Number.isFinite",
                function(a){
                        return a ? a: function(a){
                                return "number" !== typeof a ? !1: !isNaN(a) && Infinity !== a && -Infinity ! == a
                        }
                },
                "es6-impl",
                "es3"
        );
        
        $jscomp.array = $jscomp.array || {};
        
        $jscomp.iteratorFromArray = function(a, g) {
                $jscomp.initSymbolIterator();
                a instanceof String && (a += "");
                var b = 0, e = {next: function() {
                        if (b < a.length) {
                                var f = b++;
                                return {value: g(f, a[f]), done: !1}
                        }
                        e.next = function() { return{done: !0, value: void 0} };
                        return e.next()
                }};
                e[Symbol.iterator] = function(){
                        return e
                };
                return e
        };
        
        $jscomp.polyfill(
                "Array.prototype.keys",
                function(a){
                        return a ? a: function(){
                                return $jscomp.iteratorFromArray(this, function(a){return a})
                        }
                },
                "es6-impl",
                "es3"
        );
        $jscomp.makeIterator = function(a){
                $jscomp.initSymbolIterator();
                var g = a[Symbol.iterator];
                return g ? g.call(a) : $jscomp.arrayIterator(a)
        };
        $jscomp.EXPOSE_ASYNC_EXECUTOR = !0;
        $jscomp.FORCE_POLYFILL_PROMISE = !1;
        $jscomp.polyfill(
                "Promise",
                function(a){
                        function g(){ this.batch_ = null }
                        if (a &&! $jscomp.FORCE_POLYFILL_PROMISE)
                                return a;
                        g.prototype.asyncExecute = function(a){
                                null == this.batch_ && (this.batch_ = [], this.asyncExecuteBatch_());
                                this.batch_.push(a);
                                return this
                        };
                        g.prototype.asyncExecuteBatch_ = function() {
                                var a = this;
                                this.asyncExecuteFunction(function(){a.executeBatch_()})
                        };
                        var b = $jscomp.global.setTimeout;
                        g.prototype.asyncExecuteFunction = function(a){
                                b(a,0)
                        };
                        g.prototype.executeBatch_ = function(){
                                for(; this.batch_ && this.batch_.length;){
                                        var a = this.batch_;
                                        this.batch_ = [];
                                        for (var c = 0; c < a.length; ++c){
                                                var b = a[c];
                                                delete a[c];
                                                try{
                                                        b()
                                                }
                                                catch(d){
                                                        this.asyncThrow_(d)
                                                }
                                        }
                                }
                                this.batch_ = null
                        };
                        g.prototype.asyncThrow_ = function(a){
                                this.asyncExecuteFunction(function(){throw a;})
                        };
                        var e = function(a){
                                this.state_ = 0;
                                this.result_ = void 0;
                                this.onSettledCallbacks_ = [];
                                var c = this.createResolveAndReject_();
                                try{
                                        a(c.resolve,c.reject)
                                }
                                catch(m){
                                        c.reject(m)
                                }
                        };
                        e.prototype.createResolveAndReject_ = function(){
                                function a(a){
                                        return function(d){
                                                b || (b=!0, a.call(c,d))
                                        }
                                }
                                var c = this,
                                    b =!1;
                                return {
                                        resolve:a(this.resolveTo_),
                                        reject:a(this.reject_)
                                }
                        };
                        e.prototype.resolveTo_ = function(a){
                                if(a===this)
                                        this.reject_(new TypeError("A Promise cannot resolve to itself"));
                                else if(a instanceof e)
                                        this.settleSameAsPromise_(a);
                                else{
                                        var c;
                                        a:
                                        switch(typeof a){
                                                case "object":
                                                        c=null!=a;
                                                        break a;
                                                case "function":
                                                        c=!0;
                                                        break a;
                                                default:
                                                        c=!1
                                        }
                                        c ? this.resolveToNonPromiseObj_(a) : this.fulfill_(a)
                                }
                        };
                        e.prototype.resolveToNonPromiseObj_ = function(a){
                                var c=void 0;
                                try{
                                        c=a.then
                                }
                                catch(m){
                                        this.reject_(m);
                                        return
                                }
                                "function"==typeof c ? this.settleSameAsThenable_(c,a) : this.fulfill_(a)
                        };
                        e.prototype.reject_ = function(a){
                                this.settle_(2,a)
                        };
                        e.prototype.fulfill_ = function(a){
                                this.settle_(1,a)
                        };
                        e.prototype.settle_ = function(a,c){
                                if(0!=this.state_)
                                        throw Error("Cannot settle("+a+", "+c|"): Promise already settled in state"+this.state_);
                                this.state_ = a;
                                this.result_ = c;
                                this.executeOnSettledCallbacks_()
                        };
                        e.prototype.executeOnSettledCallbacks_ = function(){
                                if(null!=this.onSettledCallbacks_){
                                        for(var a=this.onSettledCallbacks_,c=0;c<a.length;++c)
                                                a[c].call(),a[c]=null;
                                        this.onSettledCallbacks_=null
                                }
                        };
                        var f=new g;
                        e.prototype.settleSameAsPromise_ = function(a){
                                var c=this.createResolveAndReject_();
                                a.callWhenSettled_(c.resolve,c.reject)
                        };
                        e.prototype.settleSameAsThenable_ = function(a,c){
                                var b=this.createResolveAndReject_();
                                try {
                                        a.call(c,b.resolve,b.reject)
                                }
                                catch (d){
                                        b.reject(d)
                                }
                        };
                        e.prototype.then = function(a,c){
                                function b(a,c){ return"function"==typeof a ? function(c){ try {d(a(c))} catch(w) {f(w)} } : c }
                                var d, f, k = new e(function(a,c){d=a; f=c});
                                this.callWhenSettled_(b(a, d), b(c, f));
                                return k
                        };
                        e.prototype.catch = function(a){ return this.then(void 0, a) };
                        e.prototype.callWhenSettled_ = function(a,c){
                                function b(){
                                        switch (d.state_) {
                                                case 1:
                                                        a(d.result_);
                                                        break;
                                                case 2:
                                                        c(d.result_);
                                                        break;
                                                default:
                                                        throw Error("Unexpected state: "+d.state_);
                                        }
                                }
                                var d=this;
                                null == this.onSettledCallbacks_ ? f.asyncExecute(b) : this.onSettledCallbacks_.push(function(){f.asyncExecute(b)})
                        };
                        e.resolve = function(a){ return a instanceof e ? a : new e(function(c,b){ c(a) }) };
                        e.reject = function(a){ return new e(function(c,b){b(a)}) };
                        e.race = function(a){
                                return new e(
                                        function(c,b){
                                                for(var d=$jscomp.makeIterator(a),f=d.next();!f.done;f=d.next())
                                                        e.resolve(f.value).callWhenSettled_(c,b)
                                        }
                                )
                        };
                        e.all = function(a){
                                var b = $jscomp.makeIterator(a), f = b.next();
                                return f.done ? e.resolve([]) : new e(
                                        function(a,c){
                                                function d(b){
                                                        return function(c){
                                                                g[b]=c;
                                                                m--;
                                                                0==m&&a(g)
                                                        }
                                                }
                                                var g=[], m=0;
                                                do
                                                        g.push(void 0),m++,e.resolve(f.value).callWhenSettled_(d(g.length-1),c),f=b.next();
                                                while(!f.done)
                                        }
                                )
                        };
                        $jscomp.EXPOSE_ASYNC_EXECUTOR && (e.$jscomp$new$AsyncExecutor = function(){return new g});
                        return e
                },
                "es6-impl",
                "es3"
        );
        $jscomp.checkStringArgs = function(a,g,b){
                if(null==a)
                        throw new TypeError("The 'this' value for String.prototype."+b+" must not be null or undefined");
                if(g instanceof RegExp)
                        throw new TypeError("First argument to String.prototype."+b+" must not be a regular expression");
                return a+""
        };
        $jscomp.polyfill(
                "String.prototype.endsWith",
                function(a){
                        return a ? a : function(a,b){
                                var e = $jscomp.checkStringArgs(this,a,"endsWith");
                                a += "";
                                void 0===b&&(b=e.length);
                                b = Math.max(0, Math.min(b|0, e.length));
                                for(var f=a.length; 0<f&&0<b;)
                                        if(e[--b]!=a[--f]) return!1;
                                return 0>=f
                        }
                },
                "es6-impl",
                "es3"
        );
        $jscomp.polyfill(
                "String.prototype.startsWith",
                function(a){
                        return a ? a : function(a,b){
                                var e = $jscomp.checkStringArgs(this,a,"startsWith");
                                a += "";
                                var f = e.length,
                                    g = a.length;
                                b = Math.max(0, Math.min(b|0, e.length));
                                for (var c = 0; c < g && b < f;)
                                        if (e[b++] !=a [c++])
                                                return !1;
                                return c >= g
                        }
                },
                "es6-impl",
                "es3"
        );
        $jscomp.polyfill(
                "String.prototype.includes",
                function(a){
                        return a ? a : function(a, b){
                                return -1 !== $jscomp.checkStringArgs(this, a," includes").indexOf(a, b || 0)
                        }
                },
                "es6-impl",
                "es3"
        );
        $jscomp.owns = function(a,g){
                return Object.prototype.hasOwnProperty.call(a,g)
        };
        $jscomp.polyfill(
                "Object.assign",
                function(a){
                        return a ? a : function(a,b){
                                for(var e=1;e<arguments.length;e++){
                                        var f=arguments[e];
                                        if(f)
                                                for(var g in f)
                                                        $jscomp.owns(f,g)&&(a[g]=f[g])
                                }
                                return a
                        }
                },
                "es6-impl",
                "es3"
        );
        $jscomp.polyfill(
                "Array.prototype.fill",
                function(a){
                        return a ? a : function(a,b,e){
                                var f = this.length||0;
                                0>b&&(b=Math.max(0,f+b));
                                if(null==e||e>f)
                                        e=f;
                                e=Number(e);
                                0>e&&(e=Math.max(0,f+e));
                                for(b=Number(b||0);b<e;b++)
                                        this[b]=a;
                                return this
                        }
                },
                "es6-impl",
                "es3"
        );
                
        window._shimContext2D = function(a) {
                function g(a) {
                        Object.defineProperty(a,"_transformMatrix",{value:{a:1,b:0,c:0,d:1,e:0,f:0},configurable:!0,writable:!0});
                        return a._transformMatrix
                }
                function b(a){
                        Object.defineProperty(a,"_transformStack",{value:[],configurable:!0,writable:!0});
                        return a._transformStack
                }
                function e(a,b,c){
                        Object.defineProperty(a,b,{get:c.get||function(){},set:c.set||function(){},enumerable:!0,configurable:!0})
                }
                function f(){
                        e(
                                a,
                                "mozCurrentTransform",
                                {
                                        get:function(){
                                                var a=this._transformMatrix||g(this);
                                                return[a.a,a.b,a.c,a.d,a.e,a.f]
                                        }
                                }
                        );
                        e(
                                a,
                                "mozCurrentTransformInverse",
                                {
                                        get:function(){
                                                var a=this.a,
                                                    b=this.b,
                                                    c=this.c,
                                                    d=this.d,
                                                    e=this.e,
                                                    f=this.f,
                                                    m=a*d-b*c,
                                                    g=b*c-a*d;
                                                return[d/m,b/g,c/g,a/m,(d*e-c*f)/g,(b*e-a*f)/m]
                                        }
                                }
                        )
                }
                "resetTransform" in a || (
                        a.resetTransform = function(){
                                this.setTransform(1,0,0,1,0,0)
                        }
                );
                if(!("getTransform"in a))
                        if(a.getTransform=function(){return this.currentTransform},"mozCurrentTransform"in a)
                                Object.defineProperty(a,"currentTransform",{get:function(){
                                        var a=this.mozCurrentTransform;
                                        return{a:a[0],b:a[1],c:a[2],d:a[3],e:a[4],f:a[5]}
                                },enumerable:!0,configurable:!0});
                        else {
                                f();
                                e(a,"currentTransform",{get:function(){return this._transformMatrix||g(this)}});
                                var k=a.translate;
                                a.translate = function(a,b){
                                        var c=this._transformMatrix||g(this);
                                        c.e=c.a*a+c.c*b+c.e;
                                        c.f=c.b*a+c.d*b+c.f;
                                        k.call(this,a,b)
                                };
                                var c=a.scale;
                                a.scale=function(a,b){
                                        var d=this._transformMatrix||g(this);
                                        d.a*=a;
                                        d.b*=a;
                                        d.c*=b;
                                        d.d*=b;
                                        c.call(this,a,b)
                                };
                                var m=a.rotate;
                                a.rotate=function(a){
                                        var b=Math.cos(a),c=Math.sin(a),d=this._transformMatrix||g(this);
                                        this._transformMatrix={a:d.a*b+d.c*c,b:d.b*b+d.d*c,c:d.a*-c+d.c*b,d:d.b*-c+d.d*b,e:d.e,f:d.f};
                                        m.call(this,a)
                                };
                                var d=a.transform;
                                a.transform=function(a,b,c,e,f,m){
                                        var l=this._transformMatrix||g(this);
                                        this._transformMatrix={a:l.a*a+l.c*b,b:l.b*a+l.d*b,c:l.a*c+l.c*e,d:l.b*c+l.d*e,e:l.a*f+l.c*m+l.e,f:l.b*f+l.d*m+l.f};
                                        d.call(this,a,b,c,e,f,m)
                                };
                                var v=a.setTransform;
                                a.setTransform=function(a,b,c,d,e,f){
                                        this._transformMatrix={a:a,b:b,c:c,d:d,e:e,f:f};
                                        v.call(this,a,b,c,d,e,f)
                                };
                                var z=a.resetTransform;
                                a.resetTransform=function(){
                                        this._transformMatrix={a:1,b:0,c:0,d:1,e:0,f:0};
                                        z.call(this)
                                };
                                var p=a.save;
                                a.save=function(){
                                        var a=this._transformMatrix||g(this);
                                        (this._transformStack||b(this)).push(a);
                                        this._transformMatrix={a:a.a,b:a.b,c:a.c,d:a.d,e:a.e,f:a.f};
                                        p.call(this)
                                };
                                var y=a.restore;
                                a.restore=function(){
                                        var a=(this._transformStack||b(this)).pop();
                                        a&&(this._transformMatrix=a);
                                        y.call(this)
                                }
                        }
                
                "currentTransform"in a||e(a,"currentTransform",{get:function(){
                        return this.getTransform()
                }})
        };
                
        window._shimContext2D(CanvasRenderingContext2D.prototype);
        window && window.process && window.process.versions && window.process.versions.electron && delete global.module;
        (function(a){
                a.global || (
                        Object.defineProperty ? Object.defineProperty(a,"global",{configurable:!0,enumerable:!1,value:a,writable:!0}) : a.global=a
                )
        })
        ("object"===typeof this ? this : Function("return this")());
        void function(){
                function a(a,b,c){
                        var h=b.length;
                        if(Number.isFinite(h))
                                for(var d=0,n;d<h;d++){
                                        if(n=g(a,b[d],c))
                                                return n
                                }
                        else
                                return g(a,b,c)
                }
                function g(a,b,c){
                        function h(a,h){
                                var n=b[a];
                                if("string"===typeof n){
                                        var e=n,f={};
                                        -1<e.indexOf(":optional")&&(e=e.replace(":optional",""),f.optional=!0);
                                        f.type=e;
                                        n=f
                                }
                                if("object"===("undefined"===typeof n?"undefined":t(n))){
                                        var r=n.type,e=n.validate,f=n.defaultValue,F=n.optional,n=n.error;
                                        "string"===typeof r&&(r=-1<r.indexOf("|")?r.split("|"):r);
                                        if(Galactic.is(h,r))
                                                if(e)
                                                        if("function"===typeof e){
                                                                if(e(h))
                                                                        return d[a]=h,!0
                                                        }
                                                        else{
                                                                if("function"===typeof e.test&&e.test(h))
                                                                        return d[a]=h,!0
                                                        }
                                                else
                                                        return d[a]=h,!0;
                                        if(void 0!==f)
                                                return d[a]=f,!0;
                                        if(F)
                                                return!0;
                                        a={message:"Invalid argument for "+a+": ",argument:h};
                                        c&&c(a);
                                        if(n)
                                                if("function"===typeof n)
                                                        n(a);
                                                else if("log"===n)
                                                        console.error(a);
                                                else throw a;
                                        return!1
                                }
                        }
                        var d={},n=a[0];
                        if("object"===("undefined"===typeof n?"undefined":t(n)))
                                if(Galactic.is(n,"arrayLike"))
                                        for(var e in b){
                                                h(e,n[0])&&(a=n);
                                                break
                                        }
                                else
                                        for(var f in b)
                                                if(n[f]){
                                                        a=n;
                                                        break
                                                }
                        n=0;
                        a=function(a){
                                if(Galactic.is(a,"arrayLike"))
                                        return function(h){
                                                return a[h]
                                        };
                                var h=Object.keys(a);
                                return function(b){
                                        return a[h[b]]
                                }
                        }(a);
                        for(var r in b)
                                if(b.hasOwnProperty(r)){
                                        if(!h(r,a(n)))
                                                return;
                                        n++
                                }
                        return d
                }
                function b(){
                        function a(a,h){
                                if("function"!==typeof h)
                                        console.error(a+" listener is undefined");
                                else
                                        return h=h._emitterId||(h._emitterId=q++),a+"."+h
                        }
                        function b(h){
                                function b(){
                                        var a=!1,h;
                                        for(h in d)
                                                d[h].apply(c,arguments)&&(a=!0);
                                        return a
                                }
                                var d={};
                                b.attach=function(c){
                                        var b=a(h,c);
                                        !d[b]&&c&&(d[b]=c);
                                        return{
                                                attach:function(){d[b]=c},
                                                detach:function(){delete d[b]}
                                        }
                                };
                                b.detach = function(c){
                                        var b=a(h,c);
                                        d[b]&&c&&delete d[b]
                                };
                                b.stack = d;
                                return b
                        }
                        var c=0<arguments.length&&void 0!==arguments[0]?arguments[0]:{};
                        if(c.on||c.off||c.emit)
                                return c;
                        var d={},e={};
                        c.on=function(a,h){
                                d[a]&&h.apply(void 0,x(d[a]));
                                a=(e[a]?e[a]:e[a]=b(a)).attach(h);
                                h=this.then?this.on&&this.off&&this.emit?this:EventEmitter(this):{};
                                h.add=a.attach;
                                h.remove=a.detach;
                                h.attach=a.attach;
                                h.detach=a.detach;
                                h.on=this.on;
                                h.off=this.off;
                                h.emit=this.emit;
                                return h
                        };
                        c.on.once = function(a,h){
                                var b=void 0;
                                return b=c.on(a,function(){
                                        h.apply(void 0,arguments);
                                        b.detach()
                                })
                        };
                        c.on.handlers = e;
                        c.off=function(a,h){
                                h?(e[a]?e[a]:e[a]=b(a)).detach(h):delete e[a]
                        };
                        c.emit=function(a){
                                var h=e[a];
                                if(h){
                                        var b=Array.prototype.slice.call(arguments).slice(1);
                                        return h.apply(c,b)
                                }
                        };
                        c.emit.andNotifyNewHandlers = function(a){
                                d[a]=arguments;
                                c.emit.apply(c,arguments)
                        };
                        c.emit.promiseRequest=function(a){
                                return new Promise(function(h,b){
                                        return c.emit(a,h,b)
                                })
                        };
                        return c
                }
                function e(a){
                        var h=sketch.string;
                        if(a instanceof e)
                                return a;
                        if("string"===typeof a&&a.length){
                                a="/"+h.trimLeft(a,"/");
                                var b=a.endsWith("/");
                                this.isFile=!b;
                                this.isFolder=b;
                                this.full=a;
                                this.dir=h.dirpath(a)+"/";
                                this.file=h.filename(a)
                        }
                        else
                                throw"Path is invalid: "+a;
                }
                function f(a,b){
                        if(b){
                                "string"!==typeof b&&(b=c(b));
                                if(-1!==b.indexOf("|")){
                                        var h=!1;b=b.split("|");
                                        for(var d=0,e=b.length;d<e;d++)
                                                if(k(a,b[d])){
                                                        h=!0;
                                                        break
                                                }
                                        return h
                                }
                                return k(a,b)
                        }
                        return c(a)
                }
                function k(a,b){
                        return f[b]?f[b](a):m(a,b)
                }
                function c(a){
                        a=Object.prototype.toString.call(a);
                        return a.slice(a.indexOf(" ")+1,-1)
                }
                function m(a,b){
                        var h=f[b];
                        if(h)
                                return h(a);
                        a=c(a);
                        return a===b||a.toLowerCase()===b
                }
                function d(a,b){
                        return null!=v(a,b)
                }
                function v(a,b,c){
                        "string"===typeof a&&(c=b,b=a,a=global);
                        try{
                                a||(a=global);
                                var h=b.split("."),d=h.length;
                                for(b=0;b<d;b++){
                                        var e=h[b],f=a[e];
                                        c&&(b+1===d?a[e]=f=c:void 0===f&&(a[e]=f={}));
                                        a=f
                                }
                                return a
                        }
                        catch(G){}
                }
                function z(a){
                        return a.reduce(function(a,b){
                                return a+b
                        },0)
                }
                function p(){}
                function y(){}
                
                $jscomp.initSymbol();
                $jscomp.initSymbol();
                $jscomp.initSymbolIterator();
                var t="function"===typeof Symbol&&"symbol"===typeof Symbol.iterator ? function(a){return typeof a} : function(a){
                        $jscomp.initSymbol();
                        $jscomp.initSymbol();
                        $jscomp.initSymbol();
                        return a&&"function"===typeof Symbol&&a.constructor===Symbol&&a!==Symbol.prototype?"symbol":typeof a
                },w=function(a,b){
                        if(!(a instanceof b))
                                throw new TypeError("Cannot call a class as a function");
                },C=function(){
                        function a(a,b){
                                for(var c=0;c<b.length;c++){
                                        var h=b[c];
                                        h.enumerable=h.enumerable||!1;
                                        h.configurable=!0;
                                        "value"in h&&(h.writable=!0);
                                        Object.defineProperty(a,h.key,h)
                                }
                        }
                        return function(b,c,h){
                                c&&a(b.prototype,c);
                                h&&a(b,h);
                                return b
                        }
                }(),B=function(a,b){
                        if("function"!==typeof b&&null!==b)
                                throw new TypeError("Super expression must either be null or a function, not "+typeof b);
                        a.prototype=Object.create(b&&b.prototype,{constructor:{value:a,enumerable:!1,writable:!0,configurable:!0}});
                        b&&(Object.setPrototypeOf?Object.setPrototypeOf(a,b):a.__proto__=b)
                },x=function(a){
                        if(Array.isArray(a)){
                                for(var b=0,c=Array(a.length);b<a.length;b++)
                                        c[b]=a[b];
                                return c
                        }
                        return Array.from(a)
                },q=1
                ,l=Object.freeze({Path:e});
                f.boolean=function(a){
                        return"boolean"===typeof a
                };
                f.number=function(a){
                        return"number"===typeof a
                };
                f.numberLike=function(a){
                        return isFinite(a)
                };
                f.string=function(a){
                        return"string"===typeof a
                };
                f.int=f.integer=function(a){
                        return 0===a%1
                };
                f.float=f.finite=function(a){
                        return Number.isFinite(a)
                };
                f.date=function(a){
                        return a&&"Date"===c(a)
                };
                f.function=function(a){
                        return a&&"function"===typeof a
                };
                f.array=function(a){
                        return a&&isFinite(a.length)&&Array.isArray(a)
                };
                f.object=function(a){
                        return"object"===("undefined"===typeof a?"undefined":t(a))
                };
                f.element=function(a){
                        return a&&1===a.nodeType&&-1<c(a).indexOf("Element")
                };
                f.register=function(a,b){
                        if(null==b)
                                throw Error("is.register(): `validator` must be defined.");
                        return"function"===typeof b ? f[a]=b : "string"===typeof b ? f[a]=function(a){return m(a,b)} : b instanceof RegExp ? f[a]=function(a){return"string"!==typeof a?!1:null!==a.match(b)}:f[a]=function(a){return a instanceof b}
                };
                f.register("arrayLike",function(a){
                        var b=a.length;
                        return"number"===typeof b&&-1<b&&0===b%1?(a=c(a),"Arguments"===a||"Array"===a||"NodeList"===a):!1
                });
                f.register("svgString",function(a){
                        if("string"!==typeof a)
                                return!1;
                        a.startsWith("\x3c!--")&&(a=a.replace(/\x3c!--.*--\x3e/,""));
                        a.startsWith(" ")&&(a=a.trim());
                        return a.startsWith("data:image/svg")||a.startsWith("<?xml")&&a.includes("<svg")||a.startsWith("<svg")
                });
                var A=function(){
                        function a(){
                                w(this,a);
                                this.isRequested=!1;
                                this.reason="";
                                this.id=Date.now()
                        }C(a, [{key:"throwIfRequested",value:function() {if(this.isRequested)throw new u(this.reason);}}
                              ,{key:"request",         value:function(a){   this.isRequested=!0; this.reason=a}}
                              ]);
                        return a
                }(),u=function(a){
                        function b(){
                                var a;w(this,b);
                                for(var c=arguments.length,d=Array(c),e=0;e<c;e++)
                                        d[e]=arguments[e];
                                c=(a=b.__proto__||Object.getPrototypeOf(b)).call.apply(a,[this].concat(d));
                                if(!this)
                                        throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
                                a=!c||"object"!==typeof c&&"function"!==typeof c?this:c;
                                a.isCancelError=!0;
                                return a
                        }B(b,a);return b
                }(Error);
                global.Galactic||(global.Galactic={});
                Galactic.args=function(b,c){
                        return{
                                parse:function(d){
                                        return a(d,b,1<arguments.length&&void 0!==arguments[1]?arguments[1]:c)
                                },wrap:function(d){
                                        var e=1<arguments.length&&void 0!==arguments[1]?arguments[1]:c;
                                        return function(){
                                                var c=a(arguments,b,e);
                                                return d.call(this,c)
                                        }
                                }
                        }
                };
                Galactic.deduper=function(){
                        function a(a,d,e){
                                var h=(3<arguments.length&&void 0!==arguments[3]?arguments[3]:{}).onProgress,f=void 0;
                                if(f=c[a]){
                                        if(f.on("resolve",d),f.on("reject",e),h)
                                                f.on("onProgress",h)
                                }
                                else
                                        return f=c[a]=b(),{
                                                onProgress:function(){
                                                        var a;h&&h.apply(void 0,arguments);
                                                        (a=f).emit.apply(a,["onProgress"].concat(Array.prototype.slice.call(arguments)))
                                                }
                                                ,resolve:function(){
                                                        var b;d.apply(void 0,arguments);
                                                        (b=f).emit.apply(b,["resolve"].concat(Array.prototype.slice.call(arguments)));
                                                        delete c[a]
                                                }
                                                ,reject:function(){
                                                        var b;e.apply(void 0,arguments);
                                                       (b=f).emit.apply(b,["reject"].concat(Array.prototype.slice.call(arguments)));
                                                        delete c[a]
                                                }
                                        }
                        }
                        var c={};
                        a.request=function(b,c){
                                return new Promise(
                                        function(d,e){
                                                (d=a(b,d,e))&&c().then(d.resolve).catch(d.reject)
                                        }
                                )
                        };
                        return a
                };
                Galactic.emitter=b;
                Galactic.getProperty=function(a,b){
                        return v(a,b)
                };
                Galactic.setProperty=function(a,b,c){
                        return v(a,b,c)
                };
                Galactic.fsUtils=l;
                Galactic.is=f;
                Galactic.isDefined=d;
                Galactic.perf=function(){
                        function a(b){
                                var c=performance.now(),e=Math.round(c-a.startTime);
                                if(b)
                                        if(d){
                                                var h=document.createElement("div");
                                                h.innerHTML=b+" "+e+"ms";d.appendChild(h)
                                        }
                                        else
                                                ("undefined"===typeof global ? 0 : global.chrome) ? (h=[],h.push("%c"+b+"%c"+e+"ms"),h.push("background: #46575f; color: #ffeb3b; padding: 0 3px; margin-right: 3px; border-radius: 3px;"),h.push("background: #607d8b; color: #ffeb3b; padding: 0 3px; margin-right: 3px; border-radius: 3px;"),console.log.apply(console,h)):console.log(b+" "+e+"ms");f&&(a.startTime=c);
                                return e
                        }
                        function b(){
                                -1<--g?l(b):console.log(a()+"ms",m)
                        }
                        var c=0<arguments.length&&void 0!==arguments[0]?arguments[0]:{};
                        "number"===typeof c&&(c={amount:c});
                        "function"===typeof c&&(c={handler:c});
                        c.nodeName&&(c={element:c});
                        var d=c.element,e=!!c.async,f=!1!==c.elapsed,m=c.title||"",g=c.amount;
                        Number.isFinite(g)||(g=arguments[1]);
                        Number.isFinite(g)||(g=1);
                        var l=c.handler;
                        if("function"===typeof l)
                                if(a(),e)
                                        b();
                                else{
                                        for(;-1<--g;)
                                                l();
                                        console.log(a()+"ms",m)
                                }
                        a.startTime=performance.now();
                        a.reset=function(){
                                return a.startTime=performance.now()
                        };
                        a.getTimeElapsed=function(){
                                return Math.round(performance.now()-a.startTime)
                        };
                        return a
                };
                Galactic.DelimitedFile=function(a){
                        function b(a){
                                return a.split(f).reduce(
                                        function(a,b,c){
                                                c in h&&(a[h[c]]=b);
                                                return a
                                        }
                                        ,{}
                                )
                        }
                        function c(a){
                                return h.map(
                                        function(b){
                                                return a[b]
                                        }
                                ).join(f)
                        }
                        var d=a.rowDelimiter,e=a.columnDelimiter,f=void 0===e?"\n":e,h=a.columnNames;
                        return{
                                read:function(a){
                                        return a.split(d).map(b)
                                }
                                ,write:function(a){
                                        return a.map(c).join(d)
                                }
                                ,toObject:b
                                ,toString:c
                        }
                };
                Galactic.chunkedAccumulator=function(){
                        function a(){
                                var a=z(d)/d.length;
                                c(a);
                                return a
                        }
                        var b=(0<arguments.length&&void 0!==arguments[0]?arguments[0]:{}).onProgress,c=void 0===b?p:b,d=[];
                        a.getChunk=function(){
                                var b=d.length;
                                d.push(0);
                                return function(c){
                                        c&&(d[b]=c);
                                        return a()
                                }
                        };
                        a.asTaskOptions=function(){
                                return{onProgress:a}
                        };
                        return a
                };
                Galactic.steppedAccumulator=function(){
                        function a(a){
                                a&&(m=a);
                                a=f+m*e;
                                d(a);
                                return a
                        }
                        var b=0<arguments.length&&void 0!==arguments[0]?arguments[0]:{},c=b.steps,b=b.onProgress,d=void 0===b?p:b,e=1/(void 0===c?1:c),f=0,m=0;
                        a.step=function(){
                                f+=e;m=0;
                                return a()
                        };
                        a.asTaskOptions=function(){
                                return{onProgress:a}
                        };
                        return a
                };
                Galactic.CancelToken=A;
                Galactic.CancelError=u;
                Galactic.taskOptions=function(){
                        return{onProgress:y,cancel:new A}
                };
                Galactic.fillTaskOptions=function(a){
                        if(a&&(d(a,"onProgress")||(a.onProgress=y),!d(a,"cancel"))){
                                var b=void 0;
                                Object.defineProperty(
                                        a,"cancel",{
                                                get:function(){
                                                        b||(b=new A);
                                                        return b
                                                }
                                        }
                                )
                        }
                };
                Galactic.partition=function(a){
                        for(var b=1<arguments.length&&void 0!==arguments[1]?arguments[1]:1,c=[],d=0;d<a.length;d+=b)
                                c[c.length]=a.slice(d,d+b);
                        return c
                }
        }();
                void function(){
                        global.sketch||(global.sketch={},global.sketch._noRendering=!1);
                        global.sk||(global.sk=global.sketch);
                        Galactic.emitter(sketch);
                        sketch.version="5.1.312";
                        sketch.agent||(sketch.agent={});
                        sketch.assets||(sketch.assets={});
                        sketch.attrs||(sketch.attrs={});
                        sketch.convert||(sketch.convert={});
                        sketch.detect||(sketch.detect={});
                        sketch.share||(sketch.share={});
                        sketch.doc||(sketch.doc={});
                        sketch.doc.render||(sketch.doc.render={});
                        sketch.doc.selection||(sketch.doc.selection={});
                        sketch.docs||(sketch.docs=[]);
                        sketch.dom||(sketch.dom={});
                        sketch.flags||(sketch.flags={});
                        sketch.generate||(sketch.generate={});
                        sketch.feature||(sketch.feature={});
                        sketch.globals||(sketch.globals={});
                        sketch.lang||(sketch.lang={locale:{}});
                        sketch.loc||(sketch.loc={});
                        sketch.bboxUtils||(sketch.bboxUtils={});
                        sketch.paintUtils||(sketch.paintUtils={});
                        sketch.layerUtils||(sketch.layerUtils={});
                        sketch.math||(sketch.math={});
                        sketch.module||(sketch.module={});
                        sketch.net||(sketch.net={});
                        sketch.io||(sketch.io={});
                        sketch.io.json||(sketch.io.json={});
                        sketch.save||(sketch.save={});
                        sketch.tools||(sketch.tools={});
                        sketch.canvasUtils||(sketch.canvasUtils={});
                        sketch.server||(sketch.server={});
                        sketch.sidebar||(sketch.sidebar={});
                        sketch.style||(sketch.style={});
                        sketch.util||(sketch.util={});
                        sketch.vector||(sketch.vector={});
                        sketch.windows||(sketch.windows={});
                        sketch.ui||(sketch.ui={});
                        sketch.ui.colorpicker||(sketch.ui.colorpicker={});
                        sketch.ui.icons||(sketch.ui.icons={});
                        sketch.ui.dataTypes||(sketch.ui.dataTypes={});
                        sketch.user={};sketch.user.color="blue";
                        sketch.user.id="you"
                }();
                void function(){
                        $jscomp.initSymbol();
                        $jscomp.initSymbol();
                        $jscomp.initSymbolIterator();
                        var a="function"===typeof Symbol&&"symbol"===typeof Symbol.iterator?function(a){
                                return typeof a
                        }:function(a){
                                $jscomp.initSymbol();
                                $jscomp.initSymbol();
                                $jscomp.initSymbol();
                                return a&&"function"===typeof Symbol&&a.constructor===Symbol&&a!==Symbol.prototype?"symbol":typeof a
                        },g=sketch.dom||(sketch.dom={});
                        g.$=function(b,e){
                                return"object"===("undefined"===typeof b?"undefined":a(b))?b:(e||document).querySelector(b)
                        };
                        g.$$=function(b,e){
                                return"object"===("undefined"===typeof b?"undefined":a(b))?b:(e||document).querySelectorAll(b)
                        };
                        g.scrollbar=function(a){
                                var b=g.scrollbarX(a);
                                a=g.scrollbarY(a);
                                return{width:b,height:a}
                        };
                        g.scrollbarX=function(a){
                                return a.offsetWidth-a.clientWidth
                        };
                        g.scrollbarY=function(a){
                                return a.offsetHeight-a.clientHeight
                        }
                }();
                void function(){
                        var a=sketch.dom,g=/^[\w-]+$/;
                        a.append=function(b,e,f){
                                b=a.$(b);
                                "string"===typeof e&&(e=a.create(e,f));
                                if(e&&b&&b.appendChild){
                                        var g=e.length;
                                        if(g&&e.item)
                                                for(;g--;)
                                                        b.appendChild(e[0]);
                                        else if(Array.isArray(e))
                                                for(var c=0;c<g;c++)
                                                        b.appendChild(a.create(e[c]));
                                        else
                                                b.appendChild(e);
                                        return e
                                }
                                console.warn("dom.append",arguments)
                        };
                        a.appendText=function(b,e){
                                (b=a.$(b))&&b.appendChild&&b.appendChild(document.createTextNode(e))
                        };
                        a.clone=function(a){
                                function b(a,b){
                                        if(b instanceof HTMLElement){
                                                for(var c=a.style,d=window.getComputedStyle(b),e=d.length,f=0;f<e;f++){
                                                        var g=d[f];m&&"-"===g[0]||(c[g]=d[g])
                                                }
                                                "CANVAS"===a.nodeName&&(c=a.getContext("2d"),c.drawImage(b,0,0),a.ctx=c)
                                        }
                                }
                                function f(a,c){
                                        b(c,a);
                                        a=a.childNodes;
                                        c=c.childNodes;
                                        for(var d=0;d<c.length;d++){
                                                var e=a[d],g=c[d];
                                                g&&e&&(b(g,e),g.childNodes.length&&e.childNodes&&f(e,g))
                                        }
                                }
                                var g=1<arguments.length&&void 0!==arguments[1]?arguments[1]:{},c=g.id,m=g.sansPrefixedCSS,g=a.cloneNode(!0);
                                f(a,g);
                                c&&(g.id=c);
                                c=g.style;
                                c.pointerEvents="none";
                                c.position="absolute";
                                c.opacity=1;
                                c.zIndex=9999999;
                                c.display="block";
                                return g
                        };
                        a.create=function(a,e){
                                if(null!=a){
                                        if(null==a.nodeName)
                                                if(-1!==a.indexOf("<")){
                                                        var b=document.createElement("div");
                                                        b.innerHTML=a.trim();
                                                        a=b.childNodes;
                                                        if(b=a.length)
                                                                a=1===b?a[0]:a;
                                                        else
                                                                return
                                                }
                                                else
                                                        a=g.test(a)?"canvas"===a?sketch.Canvas2D():document.createElement(a):document.createTextNode(a);
                                        if(e){
                                                var b=a,k;
                                                for(k in e)
                                                        if(e.hasOwnProperty(k)){
                                                                var c=e[k];
                                                                if("function"!==typeof c||0!==k.indexOf("on")&&!Gesture.handlers[k])
                                                                        b.setAttribute(k,c);
                                                                else
                                                                        Gesture.on(b,k,c)
                                                        }
                                        }
                                        return a}
                        };
                        a.createFocusNode=function(){
                                var a=document.createElement(sketch.agent.mobile?"a":"input");
                                a.className="ui-focus-element";
                                a.href="#";
                                return a
                        }
                }();
                void function(){
                        function a(a,b){
                                for(var c in b)
                                        b.hasOwnProperty(c)&&g(a.style,c,b[c])
                        }
                        function g(a,b,d){
                                if(b in a)
                                        a[b]=d;
                                else
                                        for(var c=0,e=k.length;c<e;c++){
                                                var f=""+k[c]+b;
                                                if(f in a){
                                                        a[f]=d;
                                                        break
                                                }
                                        }
                        }
                        function b(a){
                                for(var b=document.styleSheets,c=0,e=b.length;c<e;c++){
                                        var f=b[c];
                                        try{
                                                var g=f.cssRules;
                                                if(g)
                                                        for(var f=0,k=g.length;f<k;f++){
                                                                var t=g[f];
                                                                if(a(t))
                                                                        return t
                                                        }
                                        }
                                        catch(w){}
                                }
                        }
                        $jscomp.initSymbol();
                        $jscomp.initSymbol();
                        $jscomp.initSymbolIterator();
                        var     e="function"===typeof Symbol&&"symbol"===typeof Symbol.iterator
                                ?function(a){return typeof a}
                                :function(a){
                                        $jscomp.initSymbol();
                                        $jscomp.initSymbol();
                                        $jscomp.initSymbol();
                                        return a&&"function"===typeof Symbol&&a.constructor===Symbol&&a!==Symbol.prototype?"symbol":typeof a
                                },
                            f=sketch.dom,
                            k=["-webkit-","-moz-","-ms-","-o-"];
                        f.css=function(b,m,d){
                                if(b=f.$$(b))
                                        if(1===b.nodeType&&(b=[b]),"object"===("undefined"===typeof m?"undefined":e(m))){
                                                if(Array.isArray(m)){
                                                        var c=getComputedStyle(b[0],null),
                                                            k={};
                                                        properties.forEach(
                                                                function(a){
                                                                        k[a]=c[a]
                                                                }
                                                        );
                                                        return k
                                                }
                                                d=0;
                                                for(var p=b.length;d<p;d++)
                                                        a(b[d],m)
                                        }
                                        else if(d)
                                                for(var p=0,y=b.length;p<y;p++)
                                                        g(b[p].style,m,d);
                                        else
                                                return getComputedStyle(b[0],null)[m]
                        };
                        f.stylesheet=function(c,e){
                                var d=[];
                                b(
                                        function(b){
                                                c===b.selectorText&&(e?a(b,e):d.push(b))
                                        }
                                );
                                return d
                        };
                        f.findStyleSheetRule=b
                }();
                void function(){
                        function a(){
                                var a=0<arguments.length&&void 0!==arguments[0]?arguments[0]:{};
                                return Object.assign({
                                        as:"text",
                                        dedupe:!1,
                                        headers:{},
                                        method:a.data?"POST":"GET",
                                        withCredentials:!1,
                                        totalBytes:0
                                },a)
                        }
                        var g=void 0,
                            b=["arraybuffer","blob","document"];
                        sketch.requestXHR=function(e){
                                var f=1<arguments.length&&void 0!==arguments[1]?arguments[1]:{},
                                    k=a(f),
                                    c=k.as,
                                    m=k.data,
                                    d=k.dedupe,
                                    v=k.headers,
                                    z=k.method,
                                    p=k.mimeType,
                                    y=k.onProgress,
                                    t=k.totalBytes,
                                    w=k.withCredentials;
                                return new Promise(
                                        function(a,k){
                                                function x(a){
                                                        a.lengthComputable&&(t=a.total);
                                                        y(Math.min(1,a.loaded/t),a,l)
                                                }
                                                if(d){
                                                        g||(g=Galactic.deduper());
                                                        var q=JSON.stringify([e,f]),
                                                            q=g(q,a,k,{onProgress:y});
                                                        if(!q)
                                                                return;
                                                        k=q.reject;
                                                        a=q.resolve;
                                                        y=q.onprogress
                                                }
                                                var l=new XMLHttpRequest;
                                                l.open(z,e,!0);
                                                if(v)
                                                        for(var A in v)
                                                                l.setRequestHeader(A,v[A]);
                                                else
                                                        m&&l.setRequestHeader("Content-type","application/x-www-form-urlencoded");
                                                p&&l.overrideMimeType(p);
                                                b.includes(c)&&(l.responseType=c);
                                                w&&(l.withCredentials=!0);
                                                "onerror"in l&&(l.onerror=k);
                                                y&&l.upload&&"onprogress"in l.upload&&(m?l.upload.onprogress=x:l.addEventListener("progress",x,!1));
                                                l.onreadystatechange=function(){
                                                        4===l.readyState&&a(l)
                                                };
                                                l.send(m)
                                        }
                                )
                        };
                        sketch.request=function(a){
                                var b=1<arguments.length&&void 0!==arguments[1]?arguments[1]:{},
                                    e=b.as,
                                    c=void 0===e?"text":e;
                                return sketch.requestXHR(a,b).then(
                                        function(b){
                                                var d=b.status;
                                                if(200===d||304===d||308===d||0===d)
                                                        switch(c){
                                                                case "json":
                                                                        try{
                                                                                return JSON.parse(b.response)
                                                                        }
                                                                        catch(v){
                                                                                throw Error('JSON invalid: "'+a+'"');
                                                                        }
                                                                case "xml":
                                                                        return b.responseXML;
                                                                case "text":
                                                                        return b.responseText;
                                                                default:
                                                                        return b.response
                                                        }
                                                throw Error("URL inaccessible: \u201c"+a+"\u201d");
                                        }
                                )
                        };
                        sketch.requestJSON = function(a){
                                return sketch.request(a,Object.assign({},1<arguments.length&&void 0!==arguments[1]?arguments[1]:{},{as:"json",method:"GET"}))
                        }
                }();
                void function(){
                        function a(){
                                return new Promise(
                                        function(a){
                                                if(document.body)
                                                        a();
                                                else
                                                        var b=window.setInterval(
                                                                function(){
                                                                        document.body&&(window.clearInterval(b),a())
                                                                },
                                                                1
                                                        )
                                        }
                                )
                        }
                        function g(a){
                                function b(a){
                                        z.setProgress(a);
                                        d&&d(a)
                                }
                                function c(b){
                                        var c={};
                                        b.forEach( function(b,d){ c[a[d].url]=b});
                                        return c
                                }
                                var f=1<arguments.length&&void 0!==arguments[1]?arguments[1]:{};
                                if(!Array.isArray(a))
                                        return sketch.debug&&console.error(a),Promise.resolve();
                                var f=f.onProgress,
                                    d=void 0===f?Function:f,
                                    g=[],
                                    z=sketch.timer||(sketch.timer=new sketch.ui.Timer({parentNode:document.body,format:"percent",size:120,progress:0}));
                                return Promise.all(
                                        a.map(
                                                function(a,c){
                                                        var d=a,
                                                            f=0;
                                                        "object"===("undefined"===typeof a?"undefined":e(a))&&(d=a.url,f=a.bytes);
                                                        g.push({progress:0,bytes:f});
                                                        return sketch.request(
                                                                d,
                                                                {totalBytes:f,
                                                                 onProgress:function(a,d){
                                                                         var e=g[c];
                                                                         e.progress=a;
                                                                         e.bytes||(e.bytes=d.total);
                                                                         var f=0,
                                                                             l=0;
                                                                         g.forEach(function(a){l+=a.bytes;f+=a.progress*a.bytes>>0});
                                                                         b(Math.min(.99,f/l))
                                                                 }
                                                                }
                                                        ).catch(function(a){console.error(a)})
                                                }
                                        )
                                ).then(
                                        function(a){
                                                b(.99);
                                                window.setTimeout(function(){return b(1)},250);
                                                return c(a)
                                        }
                                ).catch(
                                        function(a){
                                                z.hide();
                                                throw a;
                                        }
                                )
                        }
                        function b(a){
                                for(var b in a){
                                        var c=a[b];
                                        if(b.includes(".js")){
                                                var e=document.createElement("script");
                                                e.innerHTML=c;
                                                document.head.appendChild(e);
                                                e.remove()
                                        }
                                        else
                                                e=document.createElement("style"),e.innerHTML=c.split("../").join("./"),document.head.appendChild(e)
                                }
                        }
                        $jscomp.initSymbol();
                        $jscomp.initSymbol();
                        $jscomp.initSymbolIterator();
                        var e="function"===typeof Symbol&&"symbol"===typeof Symbol.iterator
                                ? function(a){return typeof a}
                                : function(a){
                                        $jscomp.initSymbol();
                                        $jscomp.initSymbol();
                                        $jscomp.initSymbol();
                                        return a && "function" === typeof Symbol && a.constructor === Symbol && a !== Symbol.prototype ? "symbol" : typeof a
                                };
                        window.AppLoader = function(e,k){
                                return a().then(function(){return g(e,k)}).then(b)
                        }
                }();
                void function(){
                        function a(a){
                                a.preventDefault();
                                a.stopPropagation()
                        }
                        var 
                            g=function(){
                                    function a(a,b){
                                        for(var c=0;c<b.length;c++){
                                                var d=b[c];
                                                d.enumerable=d.enumerable||!1;
                                                d.configurable=!0;
                                                "value"in d&&(d.writable=!0);
                                                Object.defineProperty(a,d.key,d)
                                        }
                                    }
                                    return function(b,c,e){
                                            c&&a(b.prototype,c);
                                            e&&a(b,e);
                                            return b
                                    }
                            }(),
                            b = Math.PI /180,
                            e = sketch.ui = sketch.ui || {};
                        e.Timer = function(){
                                function b(a,c){
                                        u.visible !== a && (
                                                u.visible=a,
                                                clearTimeout(b.id),
                                                a ? (
                                                        h.classList.add("visible"),
                                                        h.style.visibility="",
                                                        l=Date.now(),
                                                        D.start()
                                                ) : (
                                                        h.classList.remove("visible"),
                                                        c ? g() : b.id=setTimeout(g,500)
                                                )
                                        )
                                }
                                function g(){
                                        h.style.visibility="hidden";
                                        D.stop()
                                }
                                var d=0<arguments.length&&void 0!==arguments[0]?arguments[0]:{},
                                    v=sketch.dom,
                                    z=d.renderer,
                                    z = void 0 === z
                                        ? e.Timer.defaultRenderer || "basic"
                                        : z,
                                    p = d.type,
                                    y = void 0 === p
                                        ? "progress"
                                        :p,
                                    p = d.range,
                                    t = void 0 === p ? [0,1] : p,
                                    p = d.size,
                                    p = void 0 === p ? 120 : p,
                                    w = d.useAutoHide,
                                    C = void 0 === w ? !0 : w,
                                    w = d.useBackdrop,
                                    B = void 0 === w ? !0 : w,
                                    x = Number.isFinite(d.progress) ? d.progress : 0,
                                    q = void 0,
                                    l = void 0,
                                    A = v.$(d.parentNode)|| document.body,
                                    u = {},
                                    h = void 0,
                                    n = void 0,
                                    w = void 0,
                                    h = B
                                        ? v.append(A,'\n\t\t\t<div class="arc-timer backdrop">\n\t\t\t\t<div class="arc-timer-canvas">\n\t\t\t\t\t<canvas></canvas>\n\t\t\t\t\t<span></span>\n\t\t\t\t</div>\n\t\t\t</div>\n\t\t')
                                        : v.append(A,'\n\t\t\t<div class="arc-timer">\n\t\t\t\t<canvas class="arc-timer-canvas"></canvas>\n\t\t\t\t<span></span>\n\t\t\t</div>\n\t\t');
                                h.addEventListener("touchdown",a);
                                h.addEventListener("mousedown",a);
                                w=h.querySelector("span");
                                n=h.querySelector("canvas");
                                n.parentNode.style.width=p+"px";
                                n.parentNode.style.height=p+"px";
                                p*=window.devicePixelRatio;
                                B=n.getContext("2d");
                                n.width=p;
                                n.height=p;
                                u.canvas=n;
                                u.element=h;
                                u.destroy = function(){
                                        D.stop();
                                        v.remove(h);
                                        return u
                                };
                                u.show = function(a){
                                        "cover" === a ? (b(!0),n.style.visibility="hidden") : (b(!0),n.style.visibility="");
                                        return u
                                };
                                u.hide = function(){
                                        var a=(0<arguments.length&&void 0!==arguments[0]?arguments[0]:{}).immediate;
                                        b(!1,void 0===a?!1:a);
                                        return u
                                };
                                u.message = function(a){
                                        q!==a&&(q=a,h.setAttribute("data-message",a));
                                        return u
                                };
                                u.setProgress=function(a){
                                        u.progress=a;
                                        return u
                                };
                                Object.defineProperties(
                                        u,{
                                                duration:{
                                                        get:function(){return r[y].duration()}
                                                },
                                                progress:{get:function(){return x},
                                                          set:function(a){
                                                                  Number.isFinite(a) && (
                                                                          a = Math.min(1,Math.max(0,a)),
                                                                          x !== a && (
                                                                                  b(!0),
                                                                                  x=a,
                                                                                  r[y].seek && r[y].seek()
                                                                                  ,n.style.visibility=""
                                                                          )
                                                                  )
                                                          }
                                                         }
                                        }
                                );
                                var r={progress:{}};
                                r.progress.duration=function(){
                                        return 1
                                };
                                r.progress.object=function(){
                                        return{value:Math.ceil(100*x),format:"PERCENT",percent:x}
                                };
                                r.time={};
                                r.time.duration=function(){return t[0]>t[1]?t[0]-t[1]:t[1]-t[0]};
                                r.time.seek=function(){l=Date.now()-r.time.duration()*x*1E3};
                                r.time.elapse=function(){return(Date.now()-l)/1E3};
                                r.time.object=function(){
                                        var a=r.time.elapse(),
                                            b=r.time.duration(),
                                            c=a/b,
                                            b=Math.max(
                                                    0,
                                                    Math.min(
                                                            t[1],
                                                            Math.round(
                                                                    t[0] > t[1] ? b-a+t[1] : a+t[0]
                                                            )
                                                    )
                                            ),
                                            d = b/3600>>0,
                                            a=(b-3600*d)/60>>0,
                                            b=b-3600*d-60*a;
                                        10>b&&a&&(b="0"+b);
                                        return a
                                                ? {value:a,format:1===a?"MINUTE":"MINUTES",percent:c}
                                                : {value:b,format:1===b?"SECOND":"SECONDS",percent:c}
                                };
                                u.setProgress(x);
                                var E =k[z]( {$canvas:n,$text:w,ctx:B,prSize:p}, d),
                                    D=f.create(function(a){
                                            var b=r[y].object();
                                            E(b,a);
                                            1<=b.percent&&C&&u.hide()
                                    });
                                Number.isFinite(d.progress)?b(!0):b(!1);
                                return u
                        };
                        var f = {
                                create:function(a){
                                        var b=!1,
                                        c=void 0;
                                        return{
                                                start:function(){
                                                        if(!b){
                                                                cancelAnimationFrame(c);
                                                                b=!0;
                                                                var d=0;
                                                                (function p(e){
                                                                        b&&(c=requestAnimationFrame(p));
                                                                        var f=e-d;
                                                                        d=e;
                                                                        a(f/1E3)
                                                                })()
                                                        }
                                                },
                                                stop:function(){
                                                        b=!1;
                                                        cancelAnimationFrame(c)
                                                }
                                        }
                                }
                            },
                            k = {
                                    basic:function(a){
                                            var c=a.$canvas,
                                                d=a.ctx,
                                                e=a.prSize,
                                                f=1<arguments.length&&void 0!==arguments[1]?arguments[1]:{},
                                                g=sketch.dom,
                                                k=function(){
                                                        var a=f.colorStops||[{offset:0,color:"#9cdb7d"},{offset:1,color:"#378cff"}],
                                                            b=document.createElement("canvas"),
                                                            c=b.getContext("2d");
                                                        b.width=50;
                                                        b.height=1;
                                                        var d=c.createLinearGradient(0,0,50,0);
                                                        a.forEach(function(a,b){
                                                                return d.addColorStop(a.offset,a.color)
                                                        });
                                                        c.fillStyle=d;
                                                        c.fillRect(0,0,50,1);
                                                        a=[];
                                                        c=c.getImageData(0,0,50,1).data;
                                                        for(b=0;50>b;b++){
                                                                var e=4*b;
                                                                a.push("rgb("+c[e]+", "+c[e+1]+", "+c[e+2])
                                                        }
                                                        return a.reverse()
                                                }();
                                            return function(a){
                                                    var f=a.percent,
                                                        m=a.value;
                                                    a=a.format;
                                                    var p=-360*b,
                                                        v=360*f*b,
                                                        q=e/2,
                                                        l=e/2*.61;
                                                    d.fillStyle=k[Math.round(49*(1-f))];
                                                    d.clearRect(0,0,c.width,c.height);
                                                    d.save();
                                                    d.beginPath();
                                                    d.arc(q,q,q,p,v,!1);
                                                    d.arc(q,q,l,v,p,!0);
                                                    d.globalAlpha=.25;
                                                    d.fill();
                                                    p+=360*b;
                                                    d.beginPath();
                                                    d.arc(q,q,q,p,v,!1);
                                                    d.arc(q,q,l,v,p,!0);
                                                    d.globalAlpha=1;d.fill();
                                                    d.restore();
                                                    f=e/300;p=26*f;
                                                    d.fillStyle=g.css(d.canvas,"color");
                                                    d.textBaseline="top";
                                                    d.textAlign="center";
                                                    60 > e ? (d.font="bold "+55*f+'px "Trebuchet MS", Arial, Helvetica, sans-serif',d.fillText(m,q,q-30*f))
                                                           : (d.font="bold "+p+'px "Trebuchet MS",Arial, Helvetica, sans-serif',
                                                              d.fillText(a,q,q+14*f),
                                                              d.font="bold "+46*f+'px "Trebuchet MS", Arial, Helvetica, sans-serif',
                                                              d.fillText(m,q,q-44*f)
                                                             )
                                            }
                                    },
                                    rainbow:function(a){
                                            var c=a.$canvas,
                                                d=a.ctx,
                                                e=a.prSize,
                                                f=1<arguments.length&&void 0!==arguments[1]?arguments[1]:{},
                                                g=sketch.dom,
                                                k=f.transitionSpeed,
                                                t=void 0===k?5:k,
                                                w=f.fillStyle,
                                                f=f.showText,
                                                C=void 0===f?!0:f,
                                                B=function(a){
                                                        var c=document.createElement("canvas"),d=c.getContext("2d");
                                                        c.width=a;
                                                        c.height=a;
                                                        d.translate(a/2,a/2);
                                                        d.rotate(Math.PI);
                                                        d.lineWidth=2;
                                                        d.lineCap="round";
                                                        for(var e=0;360>=e;e++)
                                                                d.save(),
                                                                d.rotate(e*b),
                                                                d.translate(-d.lineWidth/2,d.lineWidth/2),
                                                                d.beginPath(),
                                                                d.moveTo(0,0),
                                                                d.lineTo(0,a),
                                                                d.closePath(),
                                                                d.strokeStyle="hsl("+e+", 100%, 50%)",
                                                                d.stroke(),
                                                                d.restore();
                                                        return c
                                                }(e),
                                                x=0,
                                                q=0;
                                            return function(a,f){
                                                    var k=a.format;
                                                    a=a.percent-x;
                                                    var h=Math.min(a,t*f*a);
                                                    if(!isNaN(h)){
                                                            .001>Math.abs(h)&&(h=a);
                                                            x+=h;
                                                            q=(q+72*f)%360;
                                                            a=-360*b;
                                                            h=360*x*b;
                                                            f=e/2;
                                                            var l=e/2*(C?.6:.3);
                                                            d.fillStyle=w||"white";
                                                            d.clearRect(0,0,c.width,c.height);
                                                            d.save();
                                                            d.beginPath();
                                                            d.arc(f,f,f,a,h,!1);
                                                            d.arc(f,f,l,h,a,!0);
                                                            d.globalAlpha=.15;
                                                            d.fill();
                                                            a+=360*b;
                                                            d.beginPath();
                                                            d.fillStyle=w||"white";
                                                            d.arc(f,f,f,a,h,!1);
                                                            d.arc(f,f,l,h,a,!0);
                                                            d.globalAlpha=1;
                                                            d.fill();
                                                            d.translate(e/2,e/2);
                                                            d.rotate(q*b);
                                                            d.translate(-e/2,-e/2);
                                                            d.globalCompositeOperation="source-atop";
                                                            d.drawImage(B,0,0);
                                                            d.restore();
                                                            d.fillStyle=g.css(d.canvas,"color");
                                                            if(!C)return!1;
                                                            a=e/300;h=100*x>>0;
                                                            l=26*a;d.textBaseline="top";
                                                            d.textAlign="center";
                                                            60 > e ? (d.font="bold "+55*a+'px "Trebuchet MS", Arial, Helvetica, sans-serif',d.fillText(h,f,f-30*a))
                                                                   : (d.font="bold "+l+'px "Trebuchet MS", Arial, Helvetica, sans-serif',d.fillText(k,f,f+14*a),d.font="bold "+46*a+'px "Trebuchet MS", Arial, Helvetica, sans-serif',d.fillText(h,f,f-44*a))
                                                    }
                                            }
                                    }
                            };
                        (function(){
                                function a(){
                                        if(!(this instanceof a))
                                                throw new TypeError("Cannot call a class as a function");
                                }
                                g(a,[{key:"render",value:function(a){}}]);
                                return a
                        })()
                }();
                                              
                                              
})();
