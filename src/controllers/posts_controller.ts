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

  // async addComment(req: Request, res: Response) {
  //   const postId = req.params.postId;
  //   const comment = req.body;
  //   const post = await postModel.findById(postId);
  //   if (!post) {
  //     return res.status(404).send('Post not found');
  //   }
  //   post.comments.push(comment);
  //   await post.save();
  //   res.send(post);
  // }

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

  // Handle like functionality
  async toggleLike(req: Request, res: Response) {
    try {
      const postId = req.params.id;
      const userId = req.params.userId; // From auth middleware

      const post = await this.model.findById(postId);
      if (!post) {
        //return res.status(404).send('Post not found');
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

      //return res.status(200).json(post);
      res.status(200).json(post);
      return;
    } catch (error) {
      console.error('Error toggling like:', error);
      //return res.status(500).json({ error: 'Failed to toggle like' });
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
        //return res.status(400).json({ error: 'Comment text is required' });
        return;
      }

      const post = await this.model.findById(postId);
      if (!post) {
        //return res.status(404).send('Post not found');
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
      //return res.status(200).json(updatedPost);
      return;
    } catch (error) {
      console.error('Error adding comment:', error);
      //return res.status(500).json({ error: 'Failed to add comment' });
      return;
    }
  }

  // Get comments for a post
  async getComments(req: Request, res: Response) {
    try {
      const postId = req.params.id;

      const post = await this.model.findById(postId).populate('comments.user', 'email avatar');

      if (!post) {
        // return res.status(404).send('Post not found');
        return;
      }

      //return res.status(200).json(post.comments);
      return;
    } catch (error) {
      console.error('Error getting comments:', error);
      //return res.status(500).json({ error: 'Failed to get comments' });
      return;
    }
  }
}

export default new PostController();
