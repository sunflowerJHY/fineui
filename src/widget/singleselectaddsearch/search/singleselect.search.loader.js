/**
 * 单选加载数据搜索loader面板
 * Created by guy on 15/11/4.
 * @class BI.SingleSelectSearchLoader
 * @extends Widget
 */
BI.SingleSelectSearchLoader = BI.inherit(BI.Widget, {

    _defaultConfig: function () {
        return BI.extend(BI.SingleSelectSearchLoader.superclass._defaultConfig.apply(this, arguments), {
            baseCls: "bi-single-select-search-loader",
            itemsCreator: BI.emptyFn,
            keywordGetter: BI.emptyFn,
            valueFormatter: BI.emptyFn
        });
    },

    _init: function () {
        BI.SingleSelectSearchLoader.superclass._init.apply(this, arguments);

        var self = this, opts = this.options;
        var hasNext = false;

        this.button_group = BI.createWidget({
            type: "bi.single_select_list",
            element: this,
            logic: {
                dynamic: false
            },
            el: {
                tipText: BI.i18nText("BI-No_Select"),
                el: {
                    type: "bi.loader",
                    isDefaultInit: false,
                    logic: {
                        dynamic: true,
                        scrolly: true
                    },
                    el: {
                        chooseType: BI.ButtonGroup.CHOOSE_TYPE_SINGLE,
                        behaviors: {
                            redmark: function () {
                                return true;
                            }
                        },
                        layouts: [{
                            type: "bi.vertical"
                        }]
                    }
                }
            },
            itemsCreator: function (op, callback) {
                self.storeValue && (op = BI.extend(op || {}, {
                    selectedValues: [self.storeValue]
                }));
                opts.itemsCreator(op, function (ob) {
                    var keyword = ob.keyword = opts.keywordGetter();
                    hasNext = ob.hasNext;
                    var firstItems = [];
                    if (op.times === 1 && self.storeValue) {
                        var json = BI.map([self.storeValue], function (i, v) {
                            var txt = opts.valueFormatter(v) || v;
                            return {
                                text: txt,
                                value: v,
                                title: txt,
                                selected: false
                            };
                        });
                        firstItems = self._createItems(json);
                    }
                    if(keyword) {
                        var flag = false;
                        for(var i = 0; i < ob.items.length; i++) {
                            if(BI.contains(ob.items[i], keyword)) {
                                flag = true;
                            }
                        }
                        if(!flag) {
                            var preItems = self._createItems([{
                                text: keyword,
                                value: keyword,
                                title: keyword,
                                selected: false
                            }]);
                            firstItems = firstItems.concat(preItems);
                        }
                    }
                    callback(firstItems.concat(self._createItems(ob.items)), keyword);
                    if (op.times === 1 && self.storeValue) {
                        self.setValue(self.storeValue);
                    }
                });
            },
            hasNext: function () {
                return hasNext;
            }
        });
        this.button_group.on(BI.Controller.EVENT_CHANGE, function () {
            self.fireEvent(BI.Controller.EVENT_CHANGE, arguments);
        });
        this.button_group.on(BI.SingleSelectList.EVENT_CHANGE, function () {
            self.fireEvent(BI.SingleSelectSearchLoader.EVENT_CHANGE, arguments);
        });
    },

    _createItems: function (items) {
        return BI.createItems(items, {
            type: "bi.single_select_radio_item",
            logic: {
                dynamic: false
            },
            height: 25,
            selected: false
        });
    },

    _filterValues: function (src) {
        var o = this.options;
        var keyword = o.keywordGetter();
        var values = BI.deepClone(src.value) || [];
        var newValues = BI.map(values, function (i, v) {
            return {
                text: o.valueFormatter(v) || v,
                value: v
            };
        });
        if (BI.isKey(keyword)) {
            var search = BI.Func.getSearchResult(newValues, keyword);
            values = search.match.concat(search.find);
        }
        return BI.map(values, function (i, v) {
            return {
                text: v.text,
                title: v.text,
                value: v.value,
                selected: false
            };
        });
    },

    setValue: function (v) {
        // 暂存的值一定是新的值，不然v改掉后，storeValue也跟着改了
        this.storeValue = v;
        this.button_group.setValue(v);
    },

    getValue: function () {
        return this.button_group.getValue();
    },

    getAllButtons: function () {
        return this.button_group.getAllButtons();
    },

    empty: function () {
        this.button_group.empty();
    },

    populate: function (items) {
        this.button_group.populate.apply(this.button_group, arguments);
    },

    resetHeight: function (h) {
        this.button_group.resetHeight(h);
    },

    resetWidth: function (w) {
        this.button_group.resetWidth(w);
    }
});

BI.SingleSelectSearchLoader.EVENT_CHANGE = "EVENT_CHANGE";
BI.shortcut("bi.single_select_search_add_loader", BI.SingleSelectSearchLoader);