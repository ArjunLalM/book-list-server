import express from "express";
import { login, signUp } from "../Controller/userController.js";
import { check } from "express-validator";

const router = express.Router();

router.post("/signup",[
    check('firstName').not().isEmpty(),
    check('lastName').not().isEmpty(),
    check('dateOfBirth').not().isEmpty(),
    check('phoneNumber').not().isEmpty(),
    check('email').not().isEmpty(),
    check('password').not().isEmpty(),
    check('passwordConfirm').not().isEmpty(),
    // check('userRole').not().isEmpty(),
],signUp);

router.post("/login",[
    check('email').not().isEmpty(),
    check('password').not().isEmpty()
], login);

export default router;
