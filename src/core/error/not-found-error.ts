export class NotFoundError extends Error {
  constructor(
    readonly entity: string,
    readonly key: string,
  ) {
    super(`${entity} not found: ${key}`);
    this.name = "NotFoundError";
  }
}
