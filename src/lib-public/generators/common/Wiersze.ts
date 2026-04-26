import i18n from 'i18next';
import { TRodzajFaktury } from '../../../shared/consts/FA.const.js';
import { getValue } from '../../../shared/PDF-functions.js';
import { FP } from '../../types/fa1.types';

export function addMarza(
  rodzajFaktury: string | number | undefined,
  isP_PMarzy: boolean,
  wiersz: Record<string, FP>
): Record<string, FP> | null {
  if (typeof rodzajFaktury === 'string') {
    const isVATType = [
      TRodzajFaktury.VAT,
      TRodzajFaktury.KOR,
      TRodzajFaktury.ROZ,
      TRodzajFaktury.KOR_ROZ,
    ].includes(rodzajFaktury);

    const isZALType = [TRodzajFaktury.ZAL, TRodzajFaktury.KOR_ZAL].includes(rodzajFaktury);

    if (isP_PMarzy) {
      if (isVATType && !getValue(wiersz.P_12) && !getValue(wiersz.P_12_XII)) {
        return { P_12: { _text: i18n.t('invoice.footer.margin') } };
      } else if (isZALType && !getValue(wiersz.P_12Z) && !getValue(wiersz.P_12Z_XII)) {
        return { P_12Z: { _text: i18n.t('invoice.footer.margin') } };
      } else {
        return {};
      }
    }
  }

  return {};
}
