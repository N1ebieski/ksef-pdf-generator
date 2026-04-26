import i18n from 'i18next';
import { Content } from 'pdfmake/interfaces';
import FormatTyp from '../../../shared/enums/common.enum.js';
import { createLabelText, formatText, getKraj } from '../../../shared/PDF-functions.js';
import { Adres } from '../../types/fa3.types';

export function generateAdres(adres: Adres): Content[] {
  const result: Content[] = [];

  if (adres?.AdresL1) {
    result.push(formatText(adres.AdresL1._text, FormatTyp.Value));
  }
  if (adres?.AdresL2) {
    result.push(formatText(adres.AdresL2._text, FormatTyp.Value));
  }
  if (adres?.KodKraju) {
    result.push(formatText(i18n.t(getKraj(adres.KodKraju._text ?? '')), FormatTyp.Value));
  }
  result.push(...createLabelText(i18n.t('invoice.address.GLN'), adres.GLN));
  return result;
}
