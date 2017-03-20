Demo = {
    version: 1.0
};$(function () {
    var ref;
    BI.createWidget({
        type: "demo.main",
        ref: function (_ref) {
            console.log(_ref);
            ref = _ref;
        },
        element: '#wrapper'
    });
    // ref.destroy();
});Demo.Main = BI.inherit(BI.Widget, {
    props: {
        baseCls: "demo-main"
    },
    render: function () {
        return {
            type: "bi.button_group",
            layouts: [{
                type: "bi.vertical"
            }],
            items: [{
                type: "bi.button",
                text: 1
            }]
        }
    }
});
$.shortcut("demo.main", Demo.Main);