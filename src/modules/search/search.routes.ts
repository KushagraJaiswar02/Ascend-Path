import { Router } from 'express';
import { searchController } from './search.controller';

const router = Router();

// Public discovery endpoints
router.get('/guides', searchController.searchGuides);
router.get('/roadmaps', searchController.searchRoadmaps);
router.get('/posts', searchController.searchPosts);

export const searchRoutes = router;
