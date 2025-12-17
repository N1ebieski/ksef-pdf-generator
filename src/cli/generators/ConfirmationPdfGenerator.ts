import pdfMake, { TCreatedPdf } from 'pdfmake/build/pdfmake.js';
import { Content, ContentText, TDocumentDefinitions } from 'pdfmake/interfaces.js';
import { generateQRCodeData } from '../../lib-public/generators/common/Stopka.js';
import { generatePodmioty } from '../../lib-public/generators/FA3/Podmioty.js';
import { AdditionalDataTypes } from '../../lib-public/types/common.types.js';
import { Fa as Fa3, Naglowek } from '../../lib-public/types/fa3.types';
import { Faktura } from '../../lib-public/types/fa3.types.js';
import { TRodzajFaktury } from '../../shared/consts/const.js';
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

    const result: Content = [
      verticalSpacing(1),
      { stack: [...qrCode], unbreakable: false },
      createSection(
        [
          {
            stack: createLabelText('Wytworzona w:', naglowek?.SystemInfo),
            margin: [0, 8, 0, 0],
          },
        ],
        true,
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
          { value: 'Kwota pozostała do zapłaty: ', formatTyp: FormatTyp.LabelGreater },
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
          { value: 'Kwota należności ogółem: ', formatTyp: FormatTyp.LabelGreater },
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
    const confirmationName = 'Potwierdzenie transakcji';

    return [
      {
        text: [
          { text: 'Krajowy System ', fontSize: 18 },
          { text: 'e', color: 'red', bold: true, fontSize: 18 },
          { text: '-Faktur', bold: true, fontSize: 18 },
        ],
      },
      { ...(formatText('Numer Faktury:', FormatTyp.ValueMedium) as ContentText), alignment: Position.RIGHT },
      { ...(formatText(fa?.P_2?._text, FormatTyp.HeaderPosition) as ContentText), alignment: Position.RIGHT },
      {
        ...(formatText(confirmationName, [FormatTyp.ValueMedium, FormatTyp.Default]) as ContentText),
        alignment: Position.RIGHT,
      },
    ];
  }
}
