import {
  HttpClient,
  HttpEventType,
  HttpHeaders,
  HttpRequest,
  HttpResponse,
} from '@angular/common/http';
import { Injectable } from '@angular/core';
import { UrlMonitorFetcher } from '@crypto-monitor/url-monitor';
import {
  defer,
  filter,
  map,
  Observable,
  ObservableInput,
  of,
  switchMap,
} from 'rxjs';

@Injectable({ providedIn: 'root' })
export class HttpUrlMonitorFetcherService implements UrlMonitorFetcher {
  constructor(private readonly http: HttpClient) {}

  fetch<T = Response>(
    req: Request,
    selector?: (res: Response) => ObservableInput<T>,
  ): Observable<T> {
    return defer(async () => {
      let body: unknown;
      if (req.method !== 'GET' && req.method !== 'HEAD') {
        body = await req.text();
      }

      return new RequestHttpAdapter(req, body);
    }).pipe(
      switchMap((ngReq) => this.http.request(ngReq)),
      filter(
        (res): res is HttpResponse<ArrayBuffer> =>
          res.type === HttpEventType.Response,
      ),
      map((res) => new ResponseHttpAdapter(res)),
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      switchMap((res) => selector?.(res) ?? of(res as T)),
    );
  }
}

export class RequestHttpAdapter<T> extends HttpRequest<T> {
  constructor(req: Request, body?: T) {
    super(req.method, req.url, body as T, {
      ...req,
      reportProgress: false,
      responseType: 'arraybuffer',
      headers: new HttpHeaders(req.headers),
    });
  }
}

export class ResponseHttpAdapter extends Response {
  constructor(res: HttpResponse<ArrayBuffer>) {
    super(res.body, {
      ...res,
      headers: new Headers(
        res.headers
          .keys()
          .map((name) =>
            res.headers.getAll(name)?.map((value) => [name, value]),
          )
          .filter((headers): headers is [string, string][] => !!headers)
          .flat(),
      ),
    });
  }
}
