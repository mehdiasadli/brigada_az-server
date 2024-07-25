import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Post } from '@prisma/client';
import { UserService } from '../user/user.service';

@Injectable()
export class MentionService {
  constructor(
    private readonly prisma: PrismaService,
    private userService: UserService,
  ) {}

  private async getIdsWithUsernames(usernames: string[]) {
    return (await Promise.all(
      usernames
        .map(
          async (username) =>
            (await this.userService.findByUsername(username))?.id,
        )
        .filter(Boolean),
    )) as string[];
  }

  private addMention(post: Post, mentionedId: string) {
    return {
      mentionedId,
      mentionerId: post.authorId,
      postId: post.id,
    };
  }

  async addMentions(post: Post, mentions: string[]) {
    return await this.prisma.mention.createMany({
      data: (await this.getIdsWithUsernames(mentions)).map((id) =>
        this.addMention(post, id),
      ),
    });
  }
}
