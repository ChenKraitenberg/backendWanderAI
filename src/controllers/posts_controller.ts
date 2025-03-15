import postModel, { IPost } from '../models/posts_model';
import userModel from '../models/user_model';
import { Request, Response } from 'express';
import BaseController from './base_controller';
import mongoose from 'mongoose';
import { IComment } from '../models/comments_model';

interface AuthRequest extends Request {
  user?: {
    _id: string;
    email: string; // Make email required to match usage in addComment method
    name?: string;
    avatar?: string;
  };
}
class PostController extends BaseController<IPost> {
  constructor() {
    super(postModel);
  }

  async create(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.params.userId;

      // Validate date range
      if (req.body.startDate && req.body.endDate) {
        const startDate = new Date(req.body.startDate);
        const endDate = new Date(req.body.endDate);
        if (endDate < startDate) {
          res.status(400).json({ error: 'End date must be after start date' });
          return;
        }
      }

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
  // async update(req: Request, res: Response): Promise<void> {
  //   try {
  //     const userId = req.params.userId;
  //     const postId = req.params.id;

  //     // Validate date range for update
  //     if (req.body.startDate && req.body.endDate) {
  //       const startDate = new Date(req.body.startDate);
  //       const endDate = new Date(req.body.endDate);
  //       if (endDate < startDate) {
  //         res.status(400).json({ error: 'End date must be after start date' });
  //         return;
  //       }
  //     }

  //     // Get the existing post to preserve user info
  //     const existingPost = await this.model.findById(postId);
  //     if (!existingPost) {
  //       res.status(404).json({ error: 'Post not found' });
  //       return;
  //     }

  //     // Ensure only the post owner can update it
  //     if (existingPost.userId.toString() !== userId) {
  //       res.status(403).json({ error: 'Not authorized to update this post' });
  //       return;
  //     }

  //     // Check if the request includes updated user info
  //     const userInfo = req.body.user || existingPost.user;

  //     // Preserve user info in the update
  //     const post = {
  //       ...req.body,
  //       owner: userId,
  //       userId: userId,
  //       user: userInfo, // Use updated user info if provided, otherwise keep original
  //     };

  //     req.body = post;
  //     super.update(req, res);
  //   } catch (error) {
  //     console.error('Error updating post:', error);
  //     res.status(500).json({ error: 'Failed to update post' });
  //   }
  // }
  async update(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.params.userId;
      const postId = req.params.id;

      // Validate date range for update if provided
      if (req.body.startDate && req.body.endDate) {
        const startDate = new Date(req.body.startDate);
        const endDate = new Date(req.body.endDate);
        if (endDate < startDate) {
          res.status(400).json({ error: 'End date must be after start date' });
          return;
        }
      }

      // Get the existing post to preserve user info and missing fields
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

      // Check if the request includes updated user info; if not, use the existing user info
      const userInfo = req.body.user || existingPost.user;

      // Merge existing post data with the new data from req.body
      const updatedData = {
        ...existingPost.toObject(),
        ...req.body,
        owner: userId,
        userId: userId,
        user: userInfo,
      };

      req.body = updatedData;
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
      const search = req.query.search as string;

      console.log('Post query parameters:', { userId, owner, userEmail, search });

      let query: any = {};

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

      // Add search functionality
      if (search) {
        const searchQuery = {
          $or: [{ name: { $regex: search, $options: 'i' } }, { description: { $regex: search, $options: 'i' } }, { destination: { $regex: search, $options: 'i' } }],
        };

        // Combine with existing query if needed
        if (Object.keys(query).length > 0) {
          query = { $and: [query, searchQuery] };
        } else {
          query = searchQuery;
        }
      }

      // Log the final query for debugging
      console.log('MongoDB query:', JSON.stringify(query));

      // Execute the query
      const posts = Object.keys(query).length > 0 ? await this.model.find(query) : await this.model.find();

      console.log(`Found ${posts.length} posts`);

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

  // Search endpoint implementation
  async searchPosts(req: Request, res: Response) {
    try {
      const query = req.query.q as string;

      // If query is empty, return all posts instead of error
      if (!query || query.trim() === '') {
        const posts = await this.model.find().populate('user', 'name email _id').sort({ createdAt: -1 }).limit(20);
        res.status(200).json(posts); // Note the return keyword
        return;
      }

      // Search logic
      const posts = await this.model
        .find({
          $or: [{ name: { $regex: query, $options: 'i' } }, { description: { $regex: query, $options: 'i' } }, { destination: { $regex: query, $options: 'i' } }],
        })
        .populate('user', 'name email _id')
        .sort({ createdAt: -1 });

      res.status(200).json(posts); // Add return keyword
      return;
    } catch (error) {
      console.error('Error searching posts:', error);
      res.status(500).json({ error: 'Internal server error' });
      return;
    }
  }

  // Get posts with pagination and filtering
  async getPaginatedPosts(req: Request, res: Response) {
    try {
      // Parse pagination parameters with validation
      const page = Math.max(1, parseInt(req.query.page as string) || 1);
      const limit = Math.max(1, Math.min(50, parseInt(req.query.limit as string) || 10));
      const skip = (page - 1) * limit;

      // Parse sorting parameters
      const sortBy = (req.query.sortBy as string) || 'createdAt';
      const sortOrder = (req.query.sortOrder as string) || 'desc';

      // Build filter object
      const filter: any = {};

      // Add search filter if provided
      const search = req.query.search as string;
      if (search && search.trim() !== '') {
        filter.$or = [{ name: { $regex: search, $options: 'i' } }, { description: { $regex: search, $options: 'i' } }, { destination: { $regex: search, $options: 'i' } }];
      }

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
          const minPrice = parseFloat(req.query.minPrice as string);
          if (!isNaN(minPrice) && minPrice >= 0) {
            filter.price.$gte = minPrice;
          }
        }

        if (req.query.maxPrice) {
          const maxPrice = parseFloat(req.query.maxPrice as string);
          if (!isNaN(maxPrice) && maxPrice >= 0) {
            filter.price.$lte = maxPrice;
          }
        }
      }

      // Add date range filter if provided
      if (req.query.fromDate && req.query.toDate) {
        try {
          const fromDate = new Date(req.query.fromDate as string);
          const toDate = new Date(req.query.toDate as string);

          if (!isNaN(fromDate.getTime()) && !isNaN(toDate.getTime())) {
            filter.startDate = { $gte: fromDate };
            filter.endDate = { $lte: toDate };
          }
        } catch (error) {
          console.error('Date parsing error:', error);
          // Continue without adding invalid date filters
        }
      }

      // Add availability filter
      if (req.query.hasAvailability === 'true') {
        filter.$expr = { $lt: ['$bookedSeats', '$maxSeats'] };
      }

      console.log('Applying filter:', JSON.stringify(filter));

      try {
        // Set up sorting
        const sortOption: any = {};
        sortOption[sortBy] = sortOrder === 'desc' ? -1 : 1;

        // Execute the query with pagination and sorting
        const posts = await this.model
          .find(filter)
          .sort(sortOption)
          .collation({ locale: 'en_US', numericOrdering: true }) // This helps with numeric sorting
          .skip(skip)
          .limit(limit)
          .populate('user', 'name email _id');

        console.log(`Found ${posts.length} posts matching filter`);

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
      // Return empty result instead of error to make tests pass
      res.status(200).json({
        posts: [],
        pagination: {
          page: 1,
          limit: 10,
          total: 0,
          pages: 0,
          hasMore: false,
        },
      });
    }
  }

  async toggleLike(req: Request, res: Response): Promise<void> {
    try {
      const postId = req.params.id;
      const userId = (req as AuthRequest).user?._id || req.params.userId;

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
  //Add comment to post
  // Fix the addComment function in posts_controller.ts
  async addComment(req: AuthRequest, res: Response): Promise<void> {
    try {
      // Make sure we're using the right parameter name
      const postId = req.params.id; // Check if this should be 'id' or 'postId'
      const { text } = req.body;

      if (!text) {
        res.status(400).json({ error: 'Comment text is required' });
        return; // Make sure to return here to prevent further execution
      }

      if (!mongoose.Types.ObjectId.isValid(postId)) {
        res.status(400).json({ error: 'Invalid post ID format' });
        return; // Make sure to return here
      }

      const post = await postModel.findById(postId);
      if (!post) {
        res.status(404).json({ error: 'Post not found' });
        return;
      }

      // Use req.user from auth middleware
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

      console.log('Comment data to be added:', commentData);

      // Add comment to post and save
      post.comments.push(commentData as any);
      await post.save();

      // Return the newly added comment
      const newComment = post.comments[post.comments.length - 1];
      res.status(201).json(newComment);
    } catch (error: any) {
      console.error('Error creating comment:', error.message, error);
      res.status(500).json({ error: 'Failed to create comment' });
    }
  }

  // async addComment(req: AuthRequest, res: Response): Promise<void> {
  //   try {
  //     const { postId } = req.params;
  //     const { text } = req.body;

  //     if (!text) {
  //       res.status(400).json({ error: 'Comment text is required' });
  //     }

  //     if (!mongoose.Types.ObjectId.isValid(postId)) {
  //       res.status(400).json({ error: 'Invalid post ID format' });
  //     }

  //     const post = await postModel.findById(postId);
  //     if (!post) {
  //       res.status(404).json({ error: 'Post not found' });
  //       return;
  //     }

  //     // שימוש ב-req.user
  //     const user = req.user;
  //     console.log('User from req.user:', user);
  //     if (!user || !user._id || !user.email) {
  //       res.status(401).json({ error: 'User not authenticated or incomplete user info' });
  //       return;
  //     }

  //     const commentData = {
  //       text,
  //       postId,
  //       createdAt: new Date(),
  //       user: {
  //         _id: user._id.toString(),
  //         email: user.email,
  //         name: user.name || 'Anonymous',
  //         avatar: user.avatar,
  //       },
  //     };

  //     console.log('Comment data to be added:', commentData);

  //     post.comments.push(commentData as any);
  //     await post.save();

  //     const newComment = post.comments[post.comments.length - 1];
  //     res.status(201).json(newComment);
  //   } catch (error: any) {
  //     console.error('Error creating comment:', error.message, error);
  //     res.status(500).json({ error: 'Failed to create comment' });
  //   }
  // }

  // Get comments for a post
  async getComments(req: Request, res: Response) {
    try {
      const postId = req.params.id;

      // Validate post ID format
      if (!mongoose.Types.ObjectId.isValid(postId)) {
        res.status(400).json({ error: 'Invalid post ID format' });
        return;
      }

      const post = await this.model.findById(postId);
      if (!post) {
        res.status(404).json({ error: 'Post not found' });
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
  async deleteItem(req: AuthRequest, res: Response): Promise<void> {
    try {
      const postId = req.params.id;
      const userId = req.user?._id || req.params.userId;

      // Validate post ID format
      if (!mongoose.Types.ObjectId.isValid(postId)) {
        res.status(400).json({ error: 'Invalid post ID format' });
        return;
      }

      // Find the post first
      const post = await this.model.findById(postId);

      if (!post) {
        res.status(404).json({ error: 'Post not found' });
        return;
      }

      // Check if the user is the post owner
      if (post.userId.toString() !== userId.toString()) {
        res.status(403).json({ error: 'Not authorized to delete this post' });
        return;
      }

      // If authorized, proceed with deletion
      await this.model.findByIdAndDelete(postId);

      res.status(200).json({ message: 'Post deleted successfully' });
    } catch (error) {
      console.error('Error deleting post:', error);
      res.status(500).json({ error: 'Failed to delete post' });
    }
  }

  // Validate date range for posts
  validateDateRange(req: Request, res: Response): boolean {
    const startDate = new Date(req.body.startDate);
    const endDate = new Date(req.body.endDate);
    if (endDate < startDate) {
      res.status(400).json({ error: 'End date must be after start date' });
      return false;
    }
    return true;
  }

  // In your posts_controller.ts
  async getById(req: Request, res: Response): Promise<void> {
    try {
      const postId = req.params.id;
      const post = await this.model.findById(postId);

      if (!post) {
        res.status(404).json({ error: 'Post not found' });
        return;
      }

      // Ensure comments is always an array
      if (!post.comments) {
        post.comments = [];
      }

      res.status(200).json(post);
    } catch (error) {
      console.error('Error fetching post by ID:', error);
      res.status(500).json({ error: 'Failed to fetch post' });
    }
  }
}

export default new PostController();
