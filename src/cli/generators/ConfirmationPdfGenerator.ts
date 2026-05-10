import i18n from 'i18next';
import pdfMake, { TCreatedPdf } from 'pdfmake/build/pdfmake.js';
import { Content, ContentText, TDocumentDefinitions } from 'pdfmake/interfaces.js';
import { generateQR2CodeData, generateQRCodeData } from '../../lib-public/generators/common/Stopka.js';
import { generatePodmioty } from '../../lib-public/generators/FA3/Podmioty.js';
import { initI18next } from '../../lib-public/i18n/i18n-init.js';
import { AdditionalDataTypes } from '../../lib-public/types/common.types.js';
import { Fa as Fa3, Naglowek } from '../../lib-public/types/fa3.types';
import { Faktura } from '../../lib-public/types/fa3.types.js';
import { TRodzajFaktury } from '../../shared/consts/FA.const.js';
import FormatTyp, { Position } from '../../shared/enums/common.enum.js';
import {
  createLabelText,
  createLabelTextArray,
  createSection,
  formatText,
  generateStyle,
  getValue,
  verticalSpacing,
} from '../../shared/PDF-functions.js';
import { parseXML } from '../../shared/XML-parser.js';
import type { IPdfGenerator } from '../interfaces/IPdfGenerator.js';

export class ConfirmationPdfGenerator implements IPdfGenerator {
  public async generate(file: File, additionalData?: any): Promise<Blob> {
    await initI18next();

    const xml: unknown = await parseXML(file);

    let pdf: TCreatedPdf;

    return new Promise((resolve): void => {
      pdf = this.generateConfirmation((xml as any).Faktura as Faktura, additionalData);

      pdf.getBlob((blob: Blob): void => {
        resolve(blob);
      });
    });
  }

  private generateConfirmation(invoice: Faktura, additionalData: AdditionalDataTypes): TCreatedPdf {
    const docDefinition: TDocumentDefinitions = {
      content: [
        ...this.generateNaglowek(invoice.Fa),
        ...generatePodmioty(invoice),
        this.generateWiersze(invoice.Fa!),
        this.generateStopka(additionalData, invoice.Naglowek),
      ],
      ...generateStyle(),
    };

    return pdfMake.createPdf(docDefinition);
  }

  private generateStopka(additionalData?: AdditionalDataTypes, naglowek?: Naglowek): Content[] {
    const qrCode: Content[] = generateQRCodeData(additionalData, false);
    const qr2Code: Content[] = generateQR2CodeData(additionalData, false);

    const result: Content = [
      verticalSpacing(1),
      { stack: [...qrCode], unbreakable: false },
      { stack: [...qr2Code], unbreakable: false },
      createSection(
        [
          {
            stack: createLabelText(i18n.t('invoice.footer.generatedIn'), naglowek?.SystemInfo),
            margin: [0, 8, 0, 0],
          },
        ],
        false,
        [0, 0, 0, 0]
      ),
    ];

    return createSection(result, false);
  }

  private generateWiersze(faVat: Fa3): Content {
    const rodzajFaktury: string | number | undefined = getValue(faVat.RodzajFaktury);

    const p_15 = getValue(faVat.P_15);
    let opis: Content = '';

    if (rodzajFaktury == TRodzajFaktury.ROZ && Number(p_15) !== 0) {
      opis = {
        stack: createLabelTextArray([
          { value: i18n.t('invoice.rows.remainingAmount'), formatTyp: FormatTyp.LabelGreater },
          {
            value: p_15,
            formatTyp: FormatTyp.CurrencyGreater,
            currency: getValue(faVat.KodWaluty)?.toString() ?? '',
          },
        ]),
        alignment: Position.RIGHT,
        margin: [0, 8, 0, 0],
      };
    } else if (
      (rodzajFaktury == TRodzajFaktury.VAT ||
        rodzajFaktury == TRodzajFaktury.KOR ||
        rodzajFaktury == TRodzajFaktury.KOR_ROZ ||
        rodzajFaktury == TRodzajFaktury.UPR) &&
      Number(p_15) !== 0
    ) {
      opis = {
        stack: createLabelTextArray([
          { value: i18n.t('invoice.rows.totalAmountDue'), formatTyp: FormatTyp.LabelGreater },
          {
            value: p_15,
            formatTyp: [FormatTyp.CurrencyGreater, FormatTyp.HeaderContent, FormatTyp.Value],
            currency: getValue(faVat.KodWaluty)?.toString() ?? '',
          },
        ]),
        alignment: Position.RIGHT,
        margin: [0, 8, 0, 0],
      };
    }
    return createSection([opis], true);
  }

  private generateNaglowek(fa?: Fa3): Content[] {
    const confirmationName = i18n.t('invoice.confirmation.name');
    const invoiceNumber = formatText(getValue(fa?.P_2), FormatTyp.HeaderPosition);

    const header: Content[] = [
      {
        text: [
          { text: i18n.t('invoice.header.ksefPart1'), fontSize: 18 },
          { text: i18n.t('invoice.header.ksefPart2'), color: 'red', bold: true, fontSize: 18 },
          { text: i18n.t('invoice.header.ksefPart3'), bold: true, fontSize: 18 },
        ],
      },
      {
        ...(formatText(i18n.t('invoice.header.invoiceNumberLabel'), FormatTyp.ValueMedium) as ContentText),
        alignment: Position.RIGHT,
      },
    ];

    if (typeof invoiceNumber !== 'string') {
      header.push({
        ...invoiceNumber,
        alignment: Position.RIGHT,
      });
    }

    header.push({
      ...(formatText(confirmationName, [FormatTyp.ValueMedium, FormatTyp.Default]) as ContentText),
      alignment: Position.RIGHT,
    });

    return header;
  }
}
