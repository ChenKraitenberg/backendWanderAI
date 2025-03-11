// src/controllers/posts_controller.ts
import postModel, { IPost } from '../models/posts_model';
import userModel from '../models/user_model';
import { Request, Response } from 'express';
import BaseController from './base_controller';
import mongoose from 'mongoose';
import { IComment } from '../models/comments_model';

class PostController extends BaseController<IPost> {
  constructor() {
    super(postModel);
  }

  async create(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.params.userId;

      // If user info is not provided in the request, fetch it
      if (!req.body.user || !req.body.user.name) {
        const user = await userModel.findById(userId);
        if (!user) {
          res.status(404).json({ error: 'User not found' });
          return;
        }

        // Add user info to the post
        req.body.user = {
          _id: userId,
          email: user.email,
          name: user.name || 'Anonymous', // Use name or fallback to Anonymous
          avatar: user.avatar,
        };
      }

      // Ensure owner and userId fields are set
      const post = {
        ...req.body,
        owner: userId,
        userId: userId,
      };

      req.body = post;
      super.create(req, res);
    } catch (error) {
      console.error('Error creating post:', error);
      res.status(500).json({ error: 'Failed to create post' });
    }
  }

  // Modified to preserve the post owner and user info on update
  // Modified to preserve the post owner and user info on update
  async update(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.params.userId;
      const postId = req.params.id;

      // Get the existing post to preserve user info
      const existingPost = await this.model.findById(postId);
      if (!existingPost) {
        res.status(404).json({ error: 'Post not found' });
        return;
      }

      // Ensure only the post owner can update it
      if (existingPost.userId.toString() !== userId) {
        res.status(403).json({ error: 'Not authorized to update this post' });
        return;
      }

      // Check if the request includes updated user info
      const userInfo = req.body.user || existingPost.user;

      // Preserve user info in the update
      const post = {
        ...req.body,
        owner: userId,
        userId: userId,
        user: userInfo, // Use updated user info if provided, otherwise keep original
      };

      req.body = post;
      super.update(req, res);
    } catch (error) {
      console.error('Error updating post:', error);
      res.status(500).json({ error: 'Failed to update post' });
    }
  }

  // Override getAll to populate user info if not already present
  async getAll(req: Request, res: Response): Promise<void> {
    try {
      // Check for various user-related query parameters
      const userId = req.query.userId as string;
      const owner = req.query.owner as string;
      const userEmail = req.query.email as string;

      console.log('Post query parameters:', { userId, owner, userEmail });

      let query = {};
      let posts = [];

      // Build query based on provided parameters
      if (userId) {
        query = {
          $or: [{ userId: userId }, { 'user._id': userId }, { owner: userId }],
        };
      } else if (owner) {
        query = {
          $or: [{ owner: owner }, { userId: owner }, { 'user._id': owner }],
        };
      } else if (userEmail) {
        // Case-insensitive email search
        query = {
          'user.email': { $regex: new RegExp('^' + userEmail.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '$', 'i') },
        };
      }

      // Log the final query for debugging
      console.log('MongoDB query:', JSON.stringify(query));

      // Execute the query
      if (Object.keys(query).length > 0) {
        posts = await this.model.find(query);
        console.log(`Found ${posts.length} posts matching query`);
      } else {
        // No specific user filter, get all posts
        posts = await this.model.find();
        console.log(`Returning all ${posts.length} posts`);
      }

      // Add a new endpoint for user-specific posts
      if (req.path.startsWith('/user/') && req.params.userId) {
        const userIdFromPath = req.params.userId;
        console.log(`Getting posts specifically for user ID: ${userIdFromPath}`);

        // Comprehensive query to find all posts by this user
        const userPosts = await this.model.find({
          $or: [{ userId: userIdFromPath }, { owner: userIdFromPath }, { 'user._id': userIdFromPath }],
        });

        console.log(`Found ${userPosts.length} posts for user ${userIdFromPath}`);
        res.status(200).json(userPosts);
        return;
      }

      // For any posts missing user info, try to fetch it
      for (const post of posts) {
        if (!post.user || !post.user.name) {
          try {
            const user = await userModel.findById(post.userId);
            if (user) {
              post.user = {
                _id: user._id.toString(),
                email: user.email,
                name: user.name || 'Anonymous',
                avatar: user.avatar,
              };
              await post.save();
            }
          } catch (err) {
            console.error(`Failed to fetch user info for post ${post._id}:`, err);
          }
        }
      }

      res.status(200).json(posts);
    } catch (error) {
      console.error('Error in getAll:', error);
      res.status(500).json({ error: 'Failed to fetch posts' });
    }
  }

  // Get posts with pagination and filtering
  async getPaginatedPosts(req: Request, res: Response) {
    try {
      // Parse pagination parameters
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const skip = (page - 1) * limit;

      // Build filter object
      const filter: any = {};

      // Add category filter if provided
      if (req.query.category) {
        filter.category = req.query.category;
      }

      // Add destination filter if provided
      if (req.query.destination) {
        // Use regex for partial match, case insensitive
        filter.destination = { $regex: req.query.destination, $options: 'i' };
      }

      // Add price range filter if provided
      if (req.query.minPrice || req.query.maxPrice) {
        filter.price = {};

        if (req.query.minPrice) {
          filter.price.$gte = parseInt(req.query.minPrice as string);
        }

        if (req.query.maxPrice) {
          filter.price.$lte = parseInt(req.query.maxPrice as string);
        }
      }

      console.log('Applying filter:', JSON.stringify(filter));

      try {
        // Execute the query with pagination
        const posts = await this.model
          .find(filter)
          .sort({ createdAt: -1 }) // Sort by newest first
          .skip(skip)
          .limit(limit);

        console.log(`Found ${posts.length} posts matching filter`);

        // For any posts missing user info, try to fetch it
        for (const post of posts) {
          if (!post.user || !post.user.name) {
            try {
              const user = await userModel.findById(post.userId);
              if (user) {
                post.user = {
                  _id: user._id.toString(),
                  email: user.email,
                  name: user.name || 'Anonymous',
                  avatar: user.avatar,
                };
                await post.save();
              }
            } catch (err) {
              console.error(`Failed to fetch user info for post ${post._id}:`, err);
            }
          }
        }

        // Get total count for pagination metadata
        const total = await this.model.countDocuments(filter);

        // Return paginated response
        res.status(200).json({
          posts,
          pagination: {
            total,
            page,
            limit,
            pages: Math.ceil(total / limit),
            hasMore: page < Math.ceil(total / limit),
          },
        });
      } catch (queryError) {
        console.error('Error executing paginated query:', queryError);

        // Fallback to simple query without pagination
        const allPosts = await this.model.find(filter).sort({ createdAt: -1 });

        // Return as paginated response format
        res.status(200).json({
          posts: allPosts,
          pagination: {
            total: allPosts.length,
            page: 1,
            limit: allPosts.length,
            pages: 1,
            hasMore: false,
          },
        });
      }
    } catch (error) {
      console.error('Error fetching paginated posts:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      res.status(500).json({ error: 'Failed to fetch posts', message: errorMessage });
    }
  }

  // Handle like functionality
  // In your postsController.ts file
  async toggleLike(req: Request, res: Response): Promise<void> {
    try {
      const postId = req.params.id;
      const userId = req.params.userId; // From auth middleware

      console.log(`Toggle like for post ${postId} by user ${userId}`);

      if (!postId || !userId) {
        console.error('Missing post ID or user ID');
        res.status(400).json({ error: 'Missing post ID or user ID' });
        return;
      }

      // Validate that both IDs are valid
      if (!mongoose.Types.ObjectId.isValid(postId) || !mongoose.Types.ObjectId.isValid(userId)) {
        console.error('Invalid post ID or user ID format');
        res.status(400).json({ error: 'Invalid ID format' });
        return;
      }

      const post = await this.model.findById(postId);
      if (!post) {
        console.error(`Post not found: ${postId}`);
        res.status(404).json({ error: 'Post not found' });
        return;
      }

      // Initialize likes array if it doesn't exist
      if (!Array.isArray(post.likes)) {
        post.likes = [];
      }

      // Log the current likes array for debugging
      console.log(`Current likes for post ${postId}:`, post.likes);

      // Check if user has already liked this post
      const isLiked = post.likes.some((id) => id.toString() === userId.toString());
      console.log(`User ${userId} has liked this post: ${isLiked}`);

      let message = '';

      if (isLiked) {
        // Remove like - make sure we compare strings for equality
        console.log(`Removing like from post ${postId} for user ${userId}`);
        post.likes = post.likes.filter((id) => id.toString() !== userId.toString());
        message = 'Like removed';
      } else {
        // Add like
        console.log(`Adding like to post ${postId} for user ${userId}`);
        post.likes.push(userId);
        message = 'Like added';
      }

      // Log the updated likes array
      console.log(`Updated likes for post ${postId}:`, post.likes);

      // Save to database
      await post.save();
      console.log(`${message} for post ${postId}. New likes count: ${post.likes.length}`);

      // Return updated post with the likes array
      res.status(200).json({
        _id: post._id,
        likes: post.likes,
        likesCount: post.likes.length,
        isLiked: post.likes.some((id) => id.toString() === userId.toString()),
        message,
      });
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

      // Get user info for the comment
      const user = await userModel.findById(userId);
      if (!user) {
        res.status(404).json({ error: 'User not found' });
        return;
      }

      // Add comment with user details
      const newComment = {
        user: {
          _id: user._id.toString(),
          email: user.email,
          name: user.name || 'Anonymous',
          avatar: user.avatar,
        },
        text,
        createdAt: new Date(),
        postId,
      };

      post.comments.push(newComment);
      await post.save();

      // Return the new comment with populated user info
      res.status(200).json(newComment);
    } catch (error) {
      console.error('Error adding comment:', error);
      res.status(500).json({ error: 'Failed to add comment' });
    }
  }

  // Get comments for a post
  async getComments(req: Request, res: Response) {
    try {
      const postId = req.params.id;

      const post = await this.model.findById(postId);
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

  async getByUserId(req: Request, res: Response) {
    try {
      const userId = req.params.userId || req.query.userId;
      console.log(`Getting posts for user ID: ${userId}`);

      // The query should check both userId and owner fields
      const posts = await this.model.find({
        $or: [{ userId: userId }, { owner: userId }],
      });

      console.log(`Found ${posts.length} posts for user ${userId}`);
      res.status(200).send(posts);
    } catch (error) {
      console.error('Error getting posts by user ID:', error);
      res.status(400).send(error);
    }
  }
}

export default new PostController();
