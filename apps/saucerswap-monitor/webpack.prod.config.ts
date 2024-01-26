import config from './webpack.config';

export default async (conf: any) => ({
  ...(await config(conf)),
});
