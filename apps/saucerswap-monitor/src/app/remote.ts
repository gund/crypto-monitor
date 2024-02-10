import { NgRemoteModule } from '@crypto-monitor/conventional-mf';
import { appRoutes } from './app.routes';

const remote: NgRemoteModule = {
  routes: appRoutes,
};

export default remote;
