import i18n from 'i18next';
import { Content } from 'pdfmake/interfaces';
import { TRolaPodmiotuUpowaznionegoFA3 } from '../../../shared/consts/FA.const.js';
import { translateMap } from '../../../shared/generators/common/functions.js';
import { createHeader, createLabelText, hasValue } from '../../../shared/PDF-functions.js';
import { PodmiotUpowazniony } from '../../types/fa3.types';
import { generatePodmiotAdres } from './PodmiotAdres.js';
import { generateDaneIdentyfikacyjneTPodmiot1Dto } from './PodmiotDaneIdentyfikacyjneTPodmiot1Dto.js';
import { generatePodmiotUpowaznionyDaneKontaktowe } from './PodmiotUpowaznionyDaneKontaktowe.js';

export function generatePodmiotUpowazniony(podmiotUpowazniony: PodmiotUpowazniony | undefined): Content[] {
  if (!podmiotUpowazniony) {
    return [];
  }
  const result: Content[] = createHeader(i18n.t('invoice.authorizedSubject.authorizedSubject'));

  if (hasValue(podmiotUpowazniony.RolaPU)) {
    result.push(
      createLabelText(
        i18n.t('invoice.authorizedSubject.role'),
        translateMap(podmiotUpowazniony.RolaPU, TRolaPodmiotuUpowaznionegoFA3)
      )
    );
  }
  if (hasValue(podmiotUpowazniony.NrEORI)) {
    result.push(createLabelText(i18n.t('invoice.authorizedSubject.eori'), podmiotUpowazniony.NrEORI));
  }
  if (podmiotUpowazniony.DaneIdentyfikacyjne) {
    result.push(generateDaneIdentyfikacyjneTPodmiot1Dto(podmiotUpowazniony.DaneIdentyfikacyjne));
  }
  result.push([
    ...generatePodmiotAdres(podmiotUpowazniony.Adres),
    ...generatePodmiotAdres(
      podmiotUpowazniony.AdresKoresp,
      i18n.t('invoice.authorizedSubject.correspondenceAddress2')
    ),
    ...generatePodmiotUpowaznionyDaneKontaktowe(podmiotUpowazniony.DaneKontaktowe),
  ]);

  return result;
}
