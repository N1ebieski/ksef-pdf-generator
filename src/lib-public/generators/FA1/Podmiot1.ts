import i18n from 'i18next';
import { Content } from 'pdfmake/interfaces';
import {
  createHeader,
  createLabelText,
  formatText,
  getTable,
  hasValue,
} from '../../../shared/PDF-functions.js';
import { TAXPAYER_STATUS } from '../../../shared/consts/FA.const.js';
import FormatTyp from '../../../shared/enums/common.enum.js';
import { translateMap } from '../../../shared/generators/common/functions.js';
import { Podmiot1 } from '../../types/fa1.types';
import { generatePodmiotAdres } from './PodmiotAdres.js';
import { generateDaneIdentyfikacyjne } from './PodmiotDaneIdentyfikacyjne.js';
import { generateDaneKontaktowe } from './PodmiotDaneKontaktowe.js';

export function generatePodmiot1(podmiot1: Podmiot1): Content[] {
  const result: Content[] = createHeader(i18n.t('invoice.subject1.seller'));

  result.push(
    createLabelText(i18n.t('invoice.subject1.eoriNumber'), podmiot1.NrEORI),
    createLabelText(i18n.t('invoice.subject1.vatPrefix'), podmiot1.PrefiksPodatnika)
  );
  if (podmiot1.DaneIdentyfikacyjne) {
    result.push(...generateDaneIdentyfikacyjne(podmiot1.DaneIdentyfikacyjne));
  }

  if (podmiot1.Adres) {
    result.push(
      generatePodmiotAdres(podmiot1.Adres, i18n.t('invoice.subject1.address'), true, [0, 12, 0, 1.3])
    );
  }
  if (podmiot1.AdresKoresp) {
    result.push(
      ...generatePodmiotAdres(
        podmiot1.AdresKoresp,
        i18n.t('invoice.subject1.mailingAddress'),
        true,
        [0, 12, 0, 1.3]
      )
    );
  }
  if (podmiot1.Email || podmiot1.Telefon) {
    result.push(
      formatText(i18n.t('invoice.subject1.contactDetails'), [FormatTyp.Label, FormatTyp.LabelMargin]),
      ...generateDaneKontaktowe(podmiot1.Email, getTable(podmiot1.Telefon))
    );
  }
  if (hasValue(podmiot1.StatusInfoPodatnika)) {
    const statusInfo: string = translateMap(podmiot1.StatusInfoPodatnika, TAXPAYER_STATUS);

    result.push(createLabelText(i18n.t('invoice.subject1.taxpayerStatus'), statusInfo));
  }
  return result;
}
