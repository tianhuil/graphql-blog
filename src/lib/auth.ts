import { sign, verify, JsonWebTokenError } from 'jsonwebtoken'
import { hash, compare } from 'bcrypt'

export interface Token {
  userId: string
}

export class Auth {
  private appSecret: string
  private saltRounds: number

  constructor() {
    const appSecret = process.env["APP_SECRET"]

    if (appSecret) {
      this.appSecret = appSecret
    } else {
      throw Error('App secret msut be set in variable "APP_SECRET"')
    }

    const saltRounds = process.env["SALT_ROUNDS"]
    if (saltRounds) {
      try {
        this.saltRounds = parseInt(saltRounds)
      } catch(e) {
        throw Error('Salt Rounds msut be set in variable "SALT_ROUNDS"')
      }
    } else {
      this.saltRounds = 10
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

  async hash(password: string): Promise<string> {
    return hash(password, this.saltRounds)
  }

  async compare(password: string, hash: string): Promise<boolean> {
    return compare(password, hash)
  }
}
