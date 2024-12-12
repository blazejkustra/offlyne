// @ts-ignore
import offlyne from 'offlyne';
import z from 'zod';

const preferencesStore = offlyne.store({
  // key: 'preferences/acceptedCookies'
  acceptedCookies: offlyne.state.schema(z.boolean()).actions({
    accept: () => true,
    decline: () => false,
  }),
  // key: 'preferences/languages'
  languages: offlyne.state
});

export default preferencesStore;
