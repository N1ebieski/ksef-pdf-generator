import i18n from 'i18next';
import pdfMake, { TCreatedPdf } from 'pdfmake/build/pdfmake.js';
import pdfFonts from 'pdfmake/build/vfs_fonts.js';
import { Content, TDocumentDefinitions } from 'pdfmake/interfaces';
import { generateWatermark } from '../shared/consts/watermark.js';
import { Position } from '../shared/enums/common.enum.js';
import { SectionType } from '../shared/enums/pef-invoice.enum.js';
import { generateStyle, getTable } from '../shared/PDF-functions.js';
import { generateInfo } from '../shared/utils/generate-info.js';
import { generateAccountingParty } from './generators/PEF/AccountingParty.js';
import { generateAllowanceCharge } from './generators/PEF/AllowanceCharge.js';
import { generateDelivery } from './generators/PEF/Delivery.js';
import { generateInvoiceDescription } from './generators/PEF/InvoiceDescription.js';
import { generateInvoiceHeader } from './generators/PEF/InvoiceHeader.js';
import { generateInvoiceLine } from './generators/PEF/InvoiceLine.js';
import { generateLegalMonetaryTotal } from './generators/PEF/LegalMonetaryTotal.js';
import { generatePayeeParty } from './generators/PEF/PayeeParty.js';
import { generatePayment } from './generators/PEF/Payment.js';
import { generateFooter } from './generators/PEF/Steeper.js';
import { generateTaxRepresentativeParty } from './generators/PEF/TaxRepresentativeParty.js';
import { generateTaxTotal } from './generators/PEF/TaxTotal.js';
import { AdditionalDataTypes } from './types/common.types';
import { PEFBasicInvoice } from './types/pef-invoice.types';
import { PEFType } from './types/pef.types.js';

pdfMake.addVirtualFileSystem(pdfFonts);

export function generateBasicPEF(invoice: PEFBasicInvoice, additionalData: AdditionalDataTypes): TCreatedPdf {
  const content: Content[] = [];

  content.push(
    generateInvoiceHeader(invoice, additionalData.nrKSeF), // Nagłówek faktury
    generateAccountingParty(invoice.AccountingSupplierParty?.Party, 'Supplier'), // Sprzedawca
    generateAccountingParty(invoice.AccountingCustomerParty?.Party, 'Customer'), // Nabywca
    generateTaxRepresentativeParty(invoice), // Przedstawiciel podatkowy sprzedawcy
    generateDelivery(getTable(invoice.Delivery)), // Odbiorca
    generatePayeeParty(invoice.PayeeParty), // Odbiorca płatności
    generateInvoiceDescription(PEFType.Basic, invoice), // Treść faktury
    generateInvoiceLine(invoice, SectionType.Basic), // Pozycje faktury
    generateAllowanceCharge(invoice, SectionType.Basic), // Upusty / obciążenia
    generateTaxTotal(invoice.TaxTotal, invoice?.DocumentCurrencyCode), // Rozliczenie VAT wg stawek
    generateLegalMonetaryTotal(invoice, SectionType.Basic), // Podsumowanie faktury
    generatePayment(invoice), // Instrukcje płatności
    generateFooter(additionalData, invoice.CustomizationID!) // Element struktury
  );

  const docDefinition: TDocumentDefinitions = {
    info: generateInfo(additionalData?.creator),
    ...generateWatermark(additionalData?.watermark),
    content: content,
    footer: (currentPage, pageCount) => {
      return {
        text: `${currentPage.toString()} ${i18n.t('invoice.footer.pagesTotal')} ${pageCount}`,
        alignment: Position.RIGHT,
        margin: [0, 0, 40, 0],
      };
    },
    ...generateStyle(),
  };

  return pdfMake.createPdf(docDefinition);
}
