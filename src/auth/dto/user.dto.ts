export class UserDTO {
  id: string;
  email: string;
  username: string;
  bio?: string | null;
  role: string;

  constructor(entity: UserDTO) {
    this.id = entity.id;
    this.username = entity.username;
    this.email = entity.email;
    this.bio = entity.bio || null;
    this.role = entity.role;
  }
}
