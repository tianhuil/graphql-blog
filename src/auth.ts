import { sign, verify, JsonWebTokenError } from 'jsonwebtoken'

export interface Token {
  userId: string
}

export class Auth {
  private appSecret: string

  constructor() {
    const appSecret = process.env["APP_SECRET"]
    if (appSecret) {
      this.appSecret = appSecret
    } else {
      throw Error('App secret msut be set in variable "APP_SECRET"')
    }
  }

  signToken(userId: string): string {
    return sign({ userId }, this.appSecret)
  }

  verifyToken(tokenString: string): Token | null {
    try {
      return verify(tokenString, this.appSecret) as Token
    } catch (e) {
      if(e instanceof JsonWebTokenError) {
        return null
      } else {
        throw(e)
      }
    }
  }
}
