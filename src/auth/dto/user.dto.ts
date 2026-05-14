export class UserDTO {
	id: string;
	email: string;
	username: string;
	role: string;

	constructor(entity: UserDTO) {
		this.id = entity.id;
		this.username = entity.username;
		this.email = entity.email;
		this.role = entity.role;
	}
}