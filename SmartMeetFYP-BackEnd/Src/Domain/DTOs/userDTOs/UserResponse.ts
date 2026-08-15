export interface UserResponseDTO {
  id: number
  name: string
  email: string
  ImagePath?: string | null
  active?:boolean
}
