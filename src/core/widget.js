/**
 * Widget超类
 * @class BI.Widget
 * @extends BI.OB
 *
 * @cfg {JSON} options 配置属性
 */
BI.Widget = BI.inherit(BI.OB, {
    _defaultConfig: function () {
        return BI.extend({
            tagName: "div",
            attributes: null,
            data: null,

            tag: null,
            disabled: false,
            invisible: false,
            invalid: false,
            baseCls: "",
            cls: ""
        }, BI.Widget.superclass._defaultConfig.call(this))
    },

    //生命周期函数
    beforeCreated: function () {

    },

    created: function () {

    },

    render: function () {

    },

    beforeMounted: function () {

    },

    mounted: function () {

    },

    destroyed: function () {
    },

    _init: function () {
        BI.Widget.superclass._init.apply(this, arguments);
        this.beforeCreated();
        this._initRoot();
        this._initElementWidth();
        this._initElementHeight();
        this._initVisualEffects();
        this._initState();
        this._initElement();
        this.created();
    },

    /**
     * 初始化根节点
     * @private
     */
    _initRoot: function () {
        var o = this.options;
        this.widgetName = o.widgetName || BI.uniqueId("widget");
        if (BI.isWidget(o.element)) {
            this._parent = o.element;
            this._parent.addWidget(this.widgetName, this);
            this.element = this.options.element.element;
        } else if (o.element) {
            this.element = $(o.element);
            this._isRoot = true;
        } else {
            this.element = $(document.createElement(o.tagName));
        }
        if (o.baseCls) {
            this.element.addClass(o.baseCls);
        }
        if (o.cls) {
            this.element.addClass(o.cls);
        }
        if (o.attributes) {
            this.element.attr(o.attributes);
        }
        if (o.data) {
            this.element.data(o.data);
        }
        this._children = {};
    },

    _initElementWidth: function () {
        var o = this.options;
        if (BI.isWidthOrHeight(o.width)) {
            this.element.css("width", o.width);
        }
    },

    _initElementHeight: function () {
        var o = this.options;
        if (BI.isWidthOrHeight(o.height)) {
            this.element.css("height", o.height);
        }
    },

    _initVisualEffects: function () {
        var o = this.options;
        if (o.invisible) {
            this.element.hide();
        }
        if (o.disabled) {
            this.element.addClass("base-disabled disabled");
        }
        if (o.invalid) {
            this.element.addClass("base-invalid invalid");
        }
    },

    _initState: function () {
        this._isMounted = false;
    },

    _initElement: function () {
        var self = this;
        var els = this.render();
        if (BI.isPlainObject(els)) {
            els = [els];
        }
        if (BI.isArray(els)) {
            BI.each(els, function (i, el) {
                BI.createWidget(el, {
                    element: self
                })
            })
        }
        if (this._isRoot === true) {
            this._mount();
        }
    },

    _setParent: function (parent) {
        this._parent = parent;
    },

    _mount: function () {
        var self = this;
        var isMounted = this._isMounted;
        if (isMounted) {
            return;
        }
        if (this._isRoot === true) {
            isMounted = true;
        } else if (this._parent && this._parent._isMounted === true) {
            isMounted = true;
        }
        if (!isMounted) {
            return;
        }
        this.beforeMounted();
        this._isMounted = true;
        this._mountChildren();
        BI.each(this._children, function (i, widget) {
            widget._mount();
        });
        this.mounted();
    },

    _mountChildren: function () {
        var self = this;
        var frag = document.createDocumentFragment();
        var hasChild = false;
        BI.each(this._children, function (i, widget) {
            if (widget.element !== self.element) {
                frag.appendChild(widget.element[0]);
                hasChild = true;
            }
        });
        if (hasChild === true) {
            this.element.append(frag);
        }
    },

    _unMount: function () {
        BI.each(this._children, function (i, widget) {
            widget._unMount();
        });
        this._children = {};
        this._parent = null;
        this._isMounted = false;
        this.destroyed();
    },

    setWidth: function (w) {
        this.options.width = w;
        this._initElementWidth();
    },

    setHeight: function (h) {
        this.options.height = h;
        this._initElementHeight();
    },

    setEnable: function (enable) {
        if (enable === true) {
            this.options.disabled = false;
            this.element.removeClass("base-disabled disabled");
        } else if (enable === false) {
            this.options.disabled = true;
            this.element.addClass("base-disabled disabled");
        }
    },

    setVisible: function (visible) {
        if (visible === true) {
            this.options.invisible = false;
            this.element.show();
        } else if (visible === false) {
            this.options.invisible = true;
            this.element.hide();
        }
    },

    setValid: function (valid) {
        this.options.invalid = !valid;
        if (valid === true) {
            this.element.removeClass("base-invalid invalid");
        } else if (valid === false) {
            this.element.addClass("base-invalid invalid");
        }
    },

    getWidth: function () {
        return this.options.width;
    },

    getHeight: function () {
        return this.options.height;
    },

    isValid: function () {
        return !this.options.invalid;
    },

    addWidget: function (name, widget) {
        var self = this;
        if (name instanceof BI.Widget) {
            widget = name;
            name = widget.getName();
        }
        name = name || widget.getName() || BI.uniqueId("widget");
        if (this._children[name]) {
            throw new Error("name has already been existed");
        }
        widget._setParent(this);
        widget.on(BI.Events.DESTROY, function () {
            delete self._children[name]
        });
        return (this._children[name] = widget);
    },

    getWidgetByName: function (name) {
        if (!BI.isKey(name) || name == this.getName()) {
            return this;
        }
        name = name + "";
        var widget = void 0, other = {};
        BI.any(this._children, function (i, wi) {
            if (i === name) {
                widget = wi;
                return true;
            }
            other[i] = wi;
        });
        if (!widget) {
            BI.any(other, function (i, wi) {
                return (widget = wi.getWidgetByName(i));
            });
        }
        return widget;
    },

    removeWidget: function (name) {
        delete this._children[name];
    },

    hasWidget: function (name) {
        return this._children[name] != null;
    },

    getName: function () {
        return this.widgetName;
    },

    setTag: function (tag) {
        this.options.tag = tag;
    },

    getTag: function () {
        return this.options.tag;
    },

    attr: function (key, value) {
        if (BI.isNotNull(value)) {
            return this.options[key] = value;
        }
        return this.options[key];
    },

    getText: function () {

    },

    setText: function (text) {

    },

    getValue: function () {

    },

    setValue: function (value) {

    },

    isEnabled: function () {
        return !this.options.disabled;
    },

    isVisible: function () {
        return !this.options.invisible;
    },

    disable: function () {
        this.setEnable(false);
    },

    enable: function () {
        this.setEnable(true);
    },

    valid: function () {
        this.setValid(true);
    },

    invalid: function () {
        this.setValid(false);
    },

    invisible: function () {
        this.setVisible(false);
    },

    visible: function () {
        this.setVisible(true);
    },

    empty: function () {
        BI.each(this._children, function (i, widget) {
            widget._unMount();
        });
        this._children = {};
        this.element.empty();
    },

    destroy: function () {
        this._unMount();
        this.element.destroy();
        this.fireEvent(BI.Events.DESTROY);
    }
});