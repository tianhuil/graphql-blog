import { objectType, inputObjectType } from "nexus";

export const AuthPayload = objectType({
  name: 'AuthPayload',
  definition(t) {
    t.string('token')
    t.field('user', {type: 'User'})
  }
})

export const SignupInput = inputObjectType({
  name: "SignupInput",
  definition(t) {
    t.string("email", { required: true })
    t.string("password", { required: true })
    t.string("name")
  },
})

export const LoginInput = inputObjectType({
  name: "LoginInput",
  definition(t) {
    t.string("email", { required: true })
    t.string("password", { required: true })
  },
})

export const CreateDraftInput = inputObjectType({
  name: "CreateDraftInput",
  definition(t) {
    t.string("authorId", { required: true })
    t.string("text")
    t.string("title")
  },
})
