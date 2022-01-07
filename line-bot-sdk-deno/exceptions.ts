export class SignatureValidationFailed extends Error {
  constructor(message: string, public signature?: string) {
    super(message);
  }
}
