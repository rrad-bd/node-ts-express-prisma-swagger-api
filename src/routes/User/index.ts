import { Router } from 'express';
import { checkToken } from "../../middlewares/credentials_checker";

const router: Router = Router();

// router.use(
//     '/all',
//     checkToken,
//     require("./get_all_user")
// );
router.use(
    '/me',
    checkToken,
    require("./my_user")
);
router.use(
    '/update_fcm_token',
    checkToken,
    require("./update_fcm_token")
);
router.use(
    '/signout',
    checkToken,
    require("./signout")
);
router.use(
    '/change-password',
    checkToken,
    require("./change_password")
);

export default router;
module.exports = router;