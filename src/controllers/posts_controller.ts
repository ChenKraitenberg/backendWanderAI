import postModel, { IPost } from '../models/posts_model';
import { Request, Response } from 'express';
import BaseController from './base_controller';

class PostController extends BaseController<IPost> {
  constructor() {
    super(postModel);
  }

  async create(req: Request, res: Response) {
    const userId = req.params.userId;
    const post = {
      ...req.body,
      owner: userId,
    };
    req.body = post;
    super.create(req, res);
  }

  async update(req: Request, res: Response) {
    const userId = req.params.userId;
    const post = {
      ...req.body,
      owner: userId,
    };
    req.body = post;
    super.update(req, res);
  }

  async addComment(req: Request, res: Response) {
    const postId = req.params.postId;
    const comment = req.body;
    const post = await postModel.findById(postId);
    if (!post) {
      return res.status(404).send('Post not found');
    }
    post.comments.push(comment);
    await post.save();
    res.send(post);
  }

  // doLike
  async doLike(req: Request, res: Response) {
    try {
      const postId = req.params.postId;
      const userId = (req as any).userId; // מתוך הטוקן
      const post = await this.model.findById(postId);
      if (!post) {
        return res.status(404).send('Post not found');
      }

      // בדיקה אם המשתמש כבר נתן לייק
      const alreadyLiked = post.likes.includes(userId);
      if (!alreadyLiked) {
        post.likes.push(userId);
        await post.save();
      }

      return res.json(post);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: 'Failed to like post' });
    }
  }
}

export default new PostController();
