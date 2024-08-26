sap.ui.require(
    [
        'sap/fe/test/JourneyRunner',
        'com/satinfotech/gst/project1/test/integration/FirstJourney',
		'com/satinfotech/gst/project1/test/integration/pages/accdocList',
		'com/satinfotech/gst/project1/test/integration/pages/accdocObjectPage',
		'com/satinfotech/gst/project1/test/integration/pages/AccountingDocumentItemsObjectPage'
    ],
    function(JourneyRunner, opaJourney, accdocList, accdocObjectPage, AccountingDocumentItemsObjectPage) {
        'use strict';
        var JourneyRunner = new JourneyRunner({
            // start index.html in web folder
            launchUrl: sap.ui.require.toUrl('com/satinfotech/gst/project1') + '/index.html'
        });

       
        JourneyRunner.run(
            {
                pages: { 
					onTheaccdocList: accdocList,
					onTheaccdocObjectPage: accdocObjectPage,
					onTheAccountingDocumentItemsObjectPage: AccountingDocumentItemsObjectPage
                }
            },
            opaJourney.run
        );
    }
);