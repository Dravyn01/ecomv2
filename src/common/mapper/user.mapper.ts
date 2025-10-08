import { UserResponse } from 'src/modules/user/dto/user.response';
import { User } from 'src/modules/user/entities/user.entity';

export function toUserResponse(user: User): UserResponse {
  return {
    id: user.id,
    username: user.username,
    email: user.email,
    created_at: user.created_at,
    updated_at: user.updated_at,
  } as UserResponse;
}
