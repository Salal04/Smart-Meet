export interface InternalUserDTO {
  id:number
  name: string
  email: string
  password: string
  ImagePath?: string | null
  active: boolean 
  code?:string | null 
  codeActivationTime?:Date | null; 
  accountType?: string |null
  role?:string |null
  codeVerified?: boolean| null
}