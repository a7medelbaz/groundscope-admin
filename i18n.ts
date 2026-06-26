import { getRequestConfig } from 'next-intl/server';

export default getRequestConfig(async ({ locale }) => ({
  messages: (await import(`./src/messages/${locale}.json`)).default,
  timeZone: 'UTC',
  now: new Date(),
}));
