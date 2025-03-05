// src/controllers/posts_controller.ts
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

  // Modified to preserve the post owner on update
  async update(req: Request, res: Response) {
    const userId = req.params.userId;
    const post = {
      ...req.body,
      owner: userId,
    };
    req.body = post;
    super.update(req, res);
  }

  // Handle like functionality
  async toggleLike(req: Request, res: Response) {
    try {
      const postId = req.params.id;
      const userId = req.params.userId; // From auth middleware

      const post = await this.model.findById(postId);
      if (!post) {
        res.status(404).send('Post not found');
        return;
      }

      const isLiked = post.likes.includes(userId);

      if (isLiked) {
        post.likes = post.likes.filter((id) => id.toString() !== userId);
      } else {
        post.likes.push(userId);
      }

      await post.save();
      res.status(200).json(post);
    } catch (error) {
      console.error('Error toggling like:', error);
      res.status(500).json({ error: 'Failed to toggle like' });
    }
  }

  // Add comment to post
  async addComment(req: Request, res: Response) {
    try {
      const postId = req.params.id;
      const userId = req.params.userId; // From auth middleware
      const { text } = req.body;

      if (!text) {
        res.status(400).json({ error: 'Comment text is required' });
        return;
      }

      const post = await this.model.findById(postId);
      if (!post) {
        res.status(404).send('Post not found');
        return;
      }

      post.comments.push({
        user: userId,
        text,
        createdAt: new Date(),
      });

      await post.save();

      // Populate user info for the newly added comment
      const updatedPost = await this.model.findById(postId).populate('comments.user', 'email avatar');
      res.status(200).json(updatedPost);
    } catch (error) {
      console.error('Error adding comment:', error);
      res.status(500).json({ error: 'Failed to add comment' });
    }
  }

  // Get comments for a post
  async getComments(req: Request, res: Response) {
    try {
      const postId = req.params.id;

      const post = await this.model.findById(postId).populate('comments.user', 'email avatar');

      if (!post) {
        res.status(404).send('Post not found');
        return;
      }

      res.status(200).json(post.comments);
    } catch (error) {
      console.error('Error getting comments:', error);
      res.status(500).json({ error: 'Failed to get comments' });
    }
  }
}

export default new PostController();
