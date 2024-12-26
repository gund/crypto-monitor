import { defer, Observable, ObservableInput, of, throwError } from 'rxjs';
import { fromFetch } from 'rxjs/fetch';

export interface UrlMonitorFetcher {
  fetch<T = Response>(
    req: Request,
    selector?: (res: Response) => ObservableInput<T>,
  ): Observable<T>;
}

export class FetchUrlMonitorFetcher implements UrlMonitorFetcher {
  fetch<T = Response>(
    req: Request,
    outerSelector?: (res: Response) => ObservableInput<T>,
  ): Observable<T> {
    const selector = (res: Response) => {
      if (!res.ok) {
        return defer(() => res.text()).pipe((text) =>
          throwError(
            () =>
              new Error(
                `Request ${req.method} ${req.url} failed with status ${res.status}: ${text}`,
              ),
          ),
        );
      }

      return outerSelector?.(res) ?? of(res as T);
    };

    return fromFetch(req, { selector });
  }
}
