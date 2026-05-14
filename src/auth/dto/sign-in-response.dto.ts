export class SignInResponseDTO {
  accesToken: string;
  refreshToken: string;

  constructor(accesToken: string, refreshToken: string) {
    this.accesToken = accesToken;
    this.refreshToken = refreshToken;
  }
}
