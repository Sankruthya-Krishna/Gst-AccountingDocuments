sap.ui.define(
  ["sap/m/Dialog", "sap/m/Text", "sap/m/Button", "sap/m/VBox"],
  function (Dialog, Text, Button, VBox) {
    "use strict";

    return {
      loadData: function () {
        const logDialog = new Dialog({
          title: "Processing...",
          content: new VBox({
            items: [],
          }),
          beginButton: new Button({
            text: "Close",
            press: function () {
              logDialog.close();
            },
          }),
        });

        logDialog.open();

        $.ajax({
          url: "/odata/v4/accounting-document/buttonController",
          type: "POST",
          contentType: "application/json",
          success: function (result) {
            console.log(result.value.value);

            if (result.value.value && result.value.value.logs) {
              const logs = result.value.value.logs;
              let logIndex = 0;

              const displayLog = function () {
                if (logIndex < logs.length) {
                  const log = logs[logIndex];

                  logDialog.getContent()[0].addItem(new Text({ text: log }));

                  logIndex++;
                  setTimeout(displayLog, 2000);
                } else {
                  setTimeout(function () {
                    window.location.reload();
                  }, 3000);
                }
              };

              // Start displaying logs
              displayLog();
            }
          },
          error: function () {
            logDialog
              .getContent()[0]
              .addItem(new Text({ text: "Error fetching logs." }));
          },
        });
      },
    };
  }
);
