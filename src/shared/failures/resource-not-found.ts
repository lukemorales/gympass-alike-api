export class ResourceNotFound {
  readonly tag = 'ResourceNotFound';

  constructor(readonly resourceId: string) {}
}
