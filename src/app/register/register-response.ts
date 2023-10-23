export interface RegisterResponse {
    name: string;
    username: string;
    email: string;
    password: string;
    photo: string;
}

export interface UploadEvent {
    originalEvent: Event;
    files: File[];
}