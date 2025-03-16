import commentModel, { IComment } from '../models/comments_model';
import postModel from '../models/posts_model';
import { Request, Response } from 'express';
import BaseController from './base_controller';
import mongoose from 'mongoose';
// class CommentsController extends BaseController<IComment> {
//   constructor() {
//     super(commentModel);
//   }
// }

interface AuthRequest extends Request {
  user?: {
    _id: string;
    email: string;
    name?: string;
    avatar?: string;
  };
}
class CommentsController extends BaseController<IComment> {
  constructor() {
    super(commentModel);
  }

  async getById(req: Request, res: Response): Promise<void> {
    try {
      const { postId, commentId } = req.params;
      const post = await postModel.findById(postId);
      if (!post) {
        res.status(404).json({ error: 'Post not found' });
        return;
      }

      const comment = (post.comments as IComment[]).find((comment) => (comment._id as any).toString() === commentId);
      if (!comment) {
        res.status(404).json({ error: 'Comment not found' });
        return;
      }

      res.status(200).json(comment);
    } catch (error) {
      console.error('Error getting comment:', error);
      res.status(500).json({ error: 'Failed to get comment' });
    }
  }

  async deleteItem(req: Request, res: Response): Promise<void> {
    try {
      const { postId, commentId } = req.params;
      const post = await postModel.findById(postId);
      if (!post) {
        res.status(404).json({ error: 'Post not found' });
        return;
      }

      const commentIndex = (post.comments as IComment[]).findIndex((comment) => (comment._id as any).toString() === commentId);
      if (commentIndex === -1) {
        res.status(404).json({ error: 'Comment not found' });
        return;
      }

      (post.comments as IComment[]).splice(commentIndex, 1);
      await post.save();

      res.status(204).send();
    } catch (error) {
      console.error('Error deleting comment:', error);
      res.status(500).json({ error: 'Failed to delete comment' });
    }
  }

  async create(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { postId } = req.params;
      const { text } = req.body;

      if (!text) {
        res.status(400).json({ error: 'Comment text is required' });
        return;
      }

      if (!mongoose.Types.ObjectId.isValid(postId)) {
        res.status(400).json({ error: 'Invalid post ID format' });
        return;
      }

      const post = await postModel.findById(postId);
      if (!post) {
        res.status(404).json({ error: 'Post not found' });
        return;
      }

      // השתמש ב-req.user שממולא על ידי authMiddleware
      const user = req.user;
      if (!user || !user._id || !user.email) {
        res.status(401).json({ error: 'User not authenticated or incomplete user info' });
        return;
      }

      const commentData = {
        text,
        postId,
        createdAt: new Date(),
        user: {
          _id: user._id.toString(),
          email: user.email,
          name: user.name || 'Anonymous',
          avatar: user.avatar,
        },
      };

      post.comments.push(commentData as any);
      await post.save();

      const newComment = post.comments[post.comments.length - 1];
      res.status(201).json(newComment);
    } catch (error: any) {
      console.error('Error creating comment:', error.message, error);
      res.status(500).json({ error: 'Failed to create comment' });
    }
  }
}

export default new CommentsController();
