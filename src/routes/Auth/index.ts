import { Router } from 'express';
import { checkToken } from "../../middlewares/credentials_checker";

const router: Router = Router();

// router.use(
//     '/all',
//     checkToken,
//     require("./get_all_user")
// );

router.use(
    '/login',
    require("./login")
);
router.use(
    '/register',
    require("./signup")
);
router.use(
    '/refresh-token',
    require("./refresh_token")
);

export default router;
module.exports = router;