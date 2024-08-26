namespace com.satinfotech.gst;
using {managed,cuid} from '@sap/cds/common';

entity AccountingDocument :cuid,managed {
   key ID:UUID;
    CompanyCode : String(4);
    FiscalYear:String(4);
    FiscalPeriod:String(3);
    AccountingDocument:String(10);
    AccountingDocumentType:String(2); 
    LastChangeDate:DateTime;
    AccountingDocumentItems :Composition of  many AccountingDocumentItems on AccountingDocumentItems.AccountingDocument=$self.AccountingDocument and AccountingDocumentItems.CompanyCode = $self.CompanyCode 
                                            and AccountingDocumentItems.FiscalYear = $self.FiscalYear;
}

entity AccountingDocumentItems : cuid,managed {
    key ID:UUID;
    
     CompanyCode : String(4);
    FiscalYear:String(4);
    AccountingDocument:String(10);
    AccountingDocumentItem : String(10);
    LastChangeDate:DateTime;
   TaxCode:String(2);
   GLAccount:String(10);
   TransactionTypeDetermination:String(3);
   AmountInCompanyCodeCurrency:Decimal
   
}