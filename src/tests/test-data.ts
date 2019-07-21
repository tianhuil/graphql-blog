import { Prisma, UserCreateInput, PostCreateInput } from "../generated/prisma-client";

type Without<T, K> = Pick<T, Exclude<keyof T, K>>

/**
 * @param authorIndex Index of author to connect when post created
 */
interface LinkedPostCreateInput extends Without<PostCreateInput, "author"> {
  authorIndex: number
}

export abstract class TestDataBase {
  protected _userIds: string[] = [];
  protected _postIds: string[] = [];

  constructor(
    protected prisma: Prisma,
    public userData: UserCreateInput[],
    public postData: LinkedPostCreateInput []
  ) { }

  private async findCreateUser(userDatum: UserCreateInput): Promise<string> {
    const user = await this.prisma.user({ email: userDatum.email });
    if (user) {
      return user.id;
    } else {
      const user = await this.prisma.createUser({
        ...userDatum
      });
      return user.id;
    }
  }

  private async createConnectPost(postDatum: LinkedPostCreateInput): Promise<string> {
    const { authorIndex, ...postCreateInput } = postDatum
    const post = await this.prisma.createPost({
      ...postCreateInput,
      author: {
        connect: { id: this._userIds[authorIndex] }
      }
    });
    return post.id;
  }

  async setUp() {
    this._userIds = await Promise.all(this.userData.map(data => this.findCreateUser(data)))
    this._postIds = await Promise.all(this.postData.map(data => this.createConnectPost(data)))
  }

  async tearDown() {
    await Promise.all(this._postIds.map(id => this.prisma.deletePost({ id })));
    await Promise.all(this._userIds.map(id => this.prisma.deletePost({ id })));
  }
}
