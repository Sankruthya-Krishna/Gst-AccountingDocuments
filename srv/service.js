const cds = require("@sap/cds");
const { v4: uuidv4 } = require("uuid");

module.exports = cds.service.impl(async function () {
  const accountingapi = await cds.connect.to("API_OPLACCTGDOCITEMCUBE_SRV");
  const { accounting, accdoc, AccountingDocumentItems } = this.entities;

  this.on("buttonController", async (req) => {
    const logs = [];

    logs.push("Started");
    const lastSyncRecordAccdoc = await cds.run(
      SELECT.one
        .columns("LastChangeDate")
        .from(accdoc)
        .orderBy("LastChangeDate desc")
    );

    const lastSyncRecordDocItems = await cds.run(
      SELECT.one
        .columns("LastChangeDate")
        .from(AccountingDocumentItems)
        .orderBy("LastChangeDate desc")
    );

    let totalRecordsCountAccdoc;
    let totalRecordsCountDocItems;
    if (lastSyncRecordAccdoc && lastSyncRecordAccdoc.LastChangeDate) {
      let lastSyncDate = lastSyncRecordAccdoc.LastChangeDate.slice(0, -1);

      totalRecordsCountAccdoc = await accountingapi.send({
        method: "GET",
        path: `/A_OperationalAcctgDocItemCube/$count?$filter=LastChangeDate gt datetime'${lastSyncDate}'`,
      });
    } else {
      totalRecordsCountAccdoc = await accountingapi.send({
        method: "GET",
        path: "/A_OperationalAcctgDocItemCube/$count",
      });
    }

    const batchSize = 5000;
    let startIndexAccdoc = 0;
    while (startIndexAccdoc < totalRecordsCountAccdoc) {
      logs.push(
        `Processing batch  ${startIndexAccdoc} of ${totalRecordsCountAccdoc} accdoc records`
      );

      let batchQueryAccdoc = SELECT.from(accounting)
        .columns(
          "CompanyCode",
          "FiscalYear",
          "FiscalPeriod",
          "AccountingDocument",
          "AccountingDocumentType",
          "LastChangeDate"
        )
        .where({
          AccountingDocumentType: { in: ["RV", "RE", "DR", "KR", "DG", "KG"] },
        })
        .and({ CompanyCodeCurrency: "INR" })
        .limit(batchSize, startIndexAccdoc);

      if (lastSyncRecordAccdoc && lastSyncRecordAccdoc.LastChangeDate) {
        batchQueryAccdoc = batchQueryAccdoc.and({
          LastChangeDate: { ">": lastSyncRecordAccdoc.LastChangeDate },
        });
      }

      const batchResultsAccdoc = await accountingapi.run(batchQueryAccdoc);

      const groupMapAccdoc = new Map();
      batchResultsAccdoc.forEach((item) => {
        const groupKey = `${item.CompanyCode}-${item.FiscalYear}-${item.AccountingDocument}`;
        if (!groupMapAccdoc.has(groupKey)) {
          item.ID = uuidv4();
          groupMapAccdoc.set(groupKey, item);
        }
      });

      const groupedDataAccdoc = [];
      groupMapAccdoc.forEach((group) => groupedDataAccdoc.push(group));

      if (groupedDataAccdoc.length > 0) {
        await cds.run(UPSERT.into(accdoc).entries(groupedDataAccdoc));
      }

      startIndexAccdoc += batchSize;
    }

    logs.push("processed successfully for accdoc.");

    let startIndexDocItems = 0;
    if (lastSyncRecordDocItems && lastSyncRecordDocItems.LastChangeDate) {
      let lastSyncDate = lastSyncRecordDocItems.LastChangeDate.slice(0, -1);

      totalRecordsCountDocItems = await accountingapi.send({
        method: "GET",
        path: `/A_OperationalAcctgDocItemCube/$count?$filter=LastChangeDate gt datetime'${lastSyncDate}'`,
      });
    } else {
      totalRecordsCountDocItems = await accountingapi.send({
        method: "GET",
        path: "/A_OperationalAcctgDocItemCube/$count",
      });
    }

    while (startIndexDocItems < totalRecordsCountDocItems) {
      logs.push(
        `Processing batchs ${startIndexDocItems} of ${totalRecordsCountDocItems} AccDocItems records`
      );

      let batchQueryDocItems = SELECT.from(accounting)
        .columns(
          "AccountingDocument",
          "AccountingDocumentItem",
          "TaxCode",
          "GLAccount",
          "TransactionTypeDetermination",
          "AmountInCompanyCodeCurrency",
          "CompanyCode",
          "FiscalYear",
          "LastChangeDate"
        )
        .where({
          AccountingDocumentType: { in: ["RV", "RE", "DR", "KR", "DG", "KG"] },
        })
        .and({ CompanyCodeCurrency: "INR" })
        .limit(batchSize, startIndexDocItems);

      if (lastSyncRecordDocItems && lastSyncRecordDocItems.LastChangeDate) {
        batchQueryDocItems = batchQueryDocItems.and({
          LastChangeDate: { ">": lastSyncRecordDocItems.LastChangeDate },
        });
      }

      const batchResultsDocItems = await accountingapi.run(batchQueryDocItems);

      const groupMapDocItems = new Map();
      batchResultsDocItems.forEach((item) => {
        const groupKey = `${item.AccountingDocument}-${item.AccountingDocumentItem}-${item.CompanyCode}-${item.FiscalYear}`;
        if (!groupMapDocItems.has(groupKey)) {
          item.ID = uuidv4();
          groupMapDocItems.set(groupKey, item);
        }
      });

      const groupedDataDocItems = [];
      groupMapDocItems.forEach((group) => groupedDataDocItems.push(group));

      if (groupedDataDocItems.length > 0) {
        await cds.run(
          UPSERT.into(AccountingDocumentItems).entries(groupedDataDocItems)
        );
        //  totalProcessedDocItems += groupedDataDocItems.length;  // Update total processed doc items records
      }

      startIndexDocItems += batchSize;
    }

    logs.push(
      "All batches processed successfully for AccountingDocumentItems."
    );

    return { value: { logs, totalRecordsCountAccdoc } };
  });
});
