import offlyne from 'offlyne';
import z from 'zod';

const acceptedCookies = offlyne.state.schema(z.boolean()).actions(() => ({
  accept: () => true,
  decline: () => false,
}));

const languages = offlyne.state.actions(() => ({
  add: (language: string) => language,
  remove: (language: string) => language,
}));

const preferencesStore = offlyne.store({
  // key: 'preferences/acceptedCookies'
  acceptedCookies,
  // key: 'preferences/languages'
  languages,
});

export default preferencesStore;
