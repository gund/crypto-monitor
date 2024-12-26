// eslint-disable-next-line @nx/enforce-module-boundaries
import { NGSWPPMessenger } from '@crypto-monitor/ngsw-notifications';
import { filter, Observable } from 'rxjs';

export class NGSWPingPong {
  protected readonly pongMsg = this.messenger.createPong();

  constructor(protected readonly messenger = NGSWPPMessenger) {}

  handlePings(events$: Observable<ExtendableMessageEvent>) {
    return events$
      .pipe(filter((event) => this.messenger.isPing(event.data)))
      .subscribe((event) => event.source?.postMessage(this.pongMsg));
  }
}
