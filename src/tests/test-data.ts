import { Prisma, UserCreateInput, PostCreateInput } from "../generated/prisma-client";
export abstract class TestDataBase {
  protected _userIds: string[] = [];
  protected _postIds: string[] = [];

  constructor(protected prisma: Prisma) { }

  protected async findCreateUser(userData: UserCreateInput): Promise<string> {
    const user = await this.prisma.user({ email: userData.email });
    if (user) {
      return user.id;
    } else {
      const user = await this.prisma.createUser({
        ...userData
      });
      return user.id;
    }
  }

  protected async createConnectPost(postData: PostCreateInput): Promise<string> {
    const post = await this.prisma.createPost(postData);
    return post.id;
  }

  abstract async setUp(): Promise<void>;

  async tearDown() {
    await Promise.all(this._postIds.map(id => this.prisma.deletePost({ id })));
    await Promise.all(this._userIds.map(id => this.prisma.deletePost({ id })));
  }
}
