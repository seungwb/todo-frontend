export interface UpdateMemberRequestDto {
    name: string;
    phone: string;
}

export interface ChangePasswordRequestDto {
    currentPassword: string;
    newPassword: string;
}

export interface WithdrawRequestDto {
    password: string;
}
