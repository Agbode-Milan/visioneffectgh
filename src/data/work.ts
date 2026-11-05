import starlys from '../assets/work/starlys.jpg';
import graceland from '../assets/work/graceland.jpg';
import dyvsi from '../assets/work/dyvsi.jpg';
import winnies from '../assets/work/winnies.jpg';
import odo from '../assets/work/odo.jpg';
import optFinance from '../assets/work/opt-finance.jpg';
import dataAppcom from '../assets/work/data-appcom.jpg';
import cutStarlys from '../assets/cut/starlys.png';
import cutGraceland from '../assets/cut/graceland.png';
import cutDyvsi from '../assets/cut/dyvsi.png';
import cutWinnies from '../assets/cut/winnies.png';
import cutOdo from '../assets/cut/odo.png';
import logoDyvsi from '../assets/logos/dyvsi.png';
import logoOpt from '../assets/logos/opt-finance.png';
import logoData from '../assets/logos/data-appcom.png';
import logoDivine from '../assets/logos/divine-selasi.png';
import logoDelice from '../assets/logos/delice.png';
import logoDeuce from '../assets/logos/deuce.png';

// `cut` is the product on a transparent background. Projects without one show their full photo.
export const projects = [
  { client: "Starly's", what: 'Labels for a smoothie and juice range', category: 'Packaging', tone: 'ink', image: starlys, cut: cutStarlys, alt: "Three bottles with Starly's mango smoothie, sobolo and pine-ginger juice labels" },
  { client: 'Graceland', what: 'Pouches for plantain chips and gari', category: 'Packaging', tone: 'plum', image: graceland, cut: cutGraceland, alt: 'Graceland Foods plantain chips and gari croustillant pouches' },
  { client: 'Dyvsi', what: 'Body wash packaging', category: 'Packaging', tone: 'lime', image: dyvsi, cut: cutDyvsi, alt: 'Front and back of two dark Dyvsi body wash bottles with gold caps' },
  { client: 'Opt Finance', what: 'Business cards', category: 'Stationery', tone: 'ink', image: optFinance, alt: 'Opt Finance business card on top of a stack of navy cards' },
  { client: "Winnie's", what: 'Black soap body wash label', category: 'Packaging', tone: 'yellow', image: winnies, cut: cutWinnies, alt: "White pump bottle with a black and gold Winnie's black soap body wash label" },
  { client: 'Odo', what: 'Mineral water bottle label', category: 'Packaging', tone: 'plum', image: odo, cut: cutOdo, alt: 'Odo Mineral Water bottle' },
  { client: 'Data Appcom', what: 'Business cards', category: 'Stationery', tone: 'ink', image: dataAppcom, alt: 'Data Appcom Ghana business cards, front and back' },
];

export const logos = [
  { client: 'Dyvsi', image: logoDyvsi },
  { client: 'Opt Finance', image: logoOpt },
  { client: 'Data Appcom Ghana', image: logoData },
  { client: 'Divine Selasi Global Outreach', image: logoDivine },
  { client: 'Delice Food Company', image: logoDelice },
  { client: 'Deuce Hospitality', image: logoDeuce },
];
