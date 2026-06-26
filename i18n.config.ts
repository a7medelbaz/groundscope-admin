import { getRequestConfig } from 'next-intl/server';

export default getRequestConfig(async ({ locale }) => {
  const messages = (await import(`./src/messages/${locale}.json`)).default;
  return {
    locale: locale || 'en',
    messages,
  };
});
