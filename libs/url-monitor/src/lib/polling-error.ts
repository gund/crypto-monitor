export class UrlMonitorPollingError extends Error {
  constructor(
    public readonly request: Request,
    public readonly originalError: unknown
  ) {
    super(`Error while polling URL ${request.url}: ${originalError}
    Request: ${JSON.stringify(request)}`);
  }
}
