/**
 * 垂直方向居中容器
 * @class BI.VerticalAdaptLayout
 * @extends BI.Layout
 */
BI.VerticalAdaptLayout = BI.inherit(BI.Layout, {
    _defaultConfig: function () {
        return BI.extend(BI.VerticalAdaptLayout.superclass._defaultConfig.apply(this, arguments), {
            baseCls: "bi-vertical-adapt-layout",
            columnSize: [],
            hgap: 0,
            vgap: 0,
            lgap: 0,
            rgap: 0,
            tgap: 0,
            bgap: 0
        });
    },
    _init: function () {
        BI.VerticalAdaptLayout.superclass._init.apply(this, arguments);
        this.$table = $("<table>").attr({"cellspacing": 0, "cellpadding": 0}).css({
            "position": "relative",
            "height": "100%",
            "white-space": "nowrap",
            "border-spacing": "0px",
            "border": "none",
            "border-collapse": "separate"
        });
        this.$tr = $("<tr>");
        this.$tr.appendTo(this.$table);
        this.populate(this.options.items);
    },

    _addElement: function (i, item) {
        var o = this.options;
        var td;
        var width = o.columnSize[i] <= 1 ? (o.columnSize[i] * 100 + "%") : o.columnSize[i];
        if (!this.hasWidget(this.getName() + "-" + i)) {
            var w = BI.createWidget(item);
            w.element.css({"position": "relative", "top": "0", "left": "0", "margin": "0px auto"});
            td = BI.createWidget({
                type: "bi.default",
                tagName: "td",
                attributes: {
                    width: width
                },
                items: [w]
            });
            this.addWidget(this.getName() + "-" + i, td);
        } else {
            td = this.getWidgetByName(this.getName() + "-" + i);
            td.element.attr("width", width);
        }

        if (i === 0) {
            td.element.addClass("first-element");
        }
        td.element.css({
            "position": "relative",
            "height": "100%",
            "vertical-align": "middle",
            "margin": "0",
            "padding": "0",
            "border": "none"
        });
        if (o.hgap + o.lgap + (item.lgap || 0) !== 0) {
            w.element.css({
                "margin-left": o.hgap + o.lgap + (item.lgap || 0) + "px"
            })
        }
        if (o.hgap + o.rgap + (item.rgap || 0) !== 0) {
            w.element.css({
                "margin-right": o.hgap + o.rgap + (item.rgap || 0) + "px"
            })
        }
        if (o.vgap + o.tgap + (item.tgap || 0) !== 0) {
            w.element.css({
                "margin-top": o.vgap + o.tgap + (item.tgap || 0) + "px"
            })
        }
        if (o.vgap + o.bgap + (item.bgap || 0) !== 0) {
            w.element.css({
                "margin-bottom": o.vgap + o.bgap + (item.bgap || 0) + "px"
            })
        }
        return td;
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
            this.$tr.append(frag);
            this.element.append(this.$table);
        }
    },

    addItem: function (item) {
        var w = this._addElement(this.options.items.length, item);
        w._mount();
        this.options.items.push(item);
        w.element.appendTo(this.$tr);
        return w;
    },

    resize: function () {
        // console.log("vertical_adapt布局不需要resize");
    },

    populate: function (items) {
        BI.VerticalAdaptLayout.superclass.populate.apply(this, arguments);
        this._mount();
    }
});
$.shortcut('bi.vertical_adapt', BI.VerticalAdaptLayout);