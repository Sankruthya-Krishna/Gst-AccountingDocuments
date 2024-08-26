sap.ui.define(['sap/fe/test/ListReport'], function(ListReport) {
    'use strict';

    var CustomPageDefinitions = {
        actions: {},
        assertions: {}
    };

    return new ListReport(
        {
            appId: 'com.satinfotech.gst.project1',
            componentId: 'accdocList',
            contextPath: '/accdoc'
        },
        CustomPageDefinitions
    );
});