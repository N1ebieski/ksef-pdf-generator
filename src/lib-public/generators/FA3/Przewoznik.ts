import i18n from 'i18next';
import { Content } from 'pdfmake/interfaces';
import { createHeader, generateTwoColumns } from '../../../shared/PDF-functions.js';
import { DaneIdentyfikacyjneTPodmiot2Dto } from '../../types/fa2-additional-types.js';
import { Przewoznik } from '../../types/fa3.types';
import { generatePodmiotAdres } from './PodmiotAdres.js';
import { generateDaneIdentyfikacyjneTPodmiot2Dto } from './PodmiotDaneIdentyfikacyjneTPodmiot2Dto.js';

export function generatePrzewoznik(przewoznik: Przewoznik | undefined): Content {
  if (!przewoznik) {
    return [];
  }
  return [
    ...createHeader(i18n.t('invoice.carrier.carrier')),
    [
      generateTwoColumns(
        generateDaneIdentyfikacyjneTPodmiot2Dto(
          przewoznik.DaneIdentyfikacyjne as DaneIdentyfikacyjneTPodmiot2Dto
        ),
        generatePodmiotAdres(
          przewoznik.AdresPrzewoznika,
          i18n.t('invoice.carrier.carrierAddress'),
          true,
          [0, 0, 0, 0]
        ),
        [0, 0, 0, 8]
      ),
    ],
  ];
}
