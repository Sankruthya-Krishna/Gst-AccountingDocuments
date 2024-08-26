sap.ui.define(['sap/fe/test/ObjectPage'], function(ObjectPage) {
    'use strict';

    var CustomPageDefinitions = {
        actions: {},
        assertions: {}
    };

    return new ObjectPage(
        {
            appId: 'com.satinfotech.gst.project1',
            componentId: 'AccountingDocumentItemsObjectPage',
            contextPath: '/accdoc/AccountingDocumentItems'
        },
        CustomPageDefinitions
    );
});