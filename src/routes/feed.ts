import { Router } from 'express'
import { getPosts, createPost, getPost, updatePost, deletePost } from '../controllers/feed';
import { validatePost } from '../validators/feed';
import isAuth from '../middlewares/is-auth';

const router = Router();

router.get('/posts', isAuth, getPosts)

router.post('/post', isAuth, validatePost(), createPost)

router.get('/post/:id', isAuth, getPost)

router.put('/post/:id', isAuth, validatePost(), updatePost)

router.delete('/post/:id', isAuth, deletePost)

export default router;