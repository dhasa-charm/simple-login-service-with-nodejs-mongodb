const express = require('express');

const router = express.Router();
const { User, UnVerifiedAccount, OtpList } = require('../../models');
const { PasswordServ, OtpServ } = require('../../lib');
const {
  UserAlreadyExistError,
} = require('../../errors');

router.route('/')

  /**
         * Register New User
         */

  .post(async (req, res, next) => {
    const { body } = req;
    const {
      email,
      name,
    } = body;

    try {
      const user = await User.findOne({ email }).exec();

      // If User With Given Email ID Already Exists Send Error Response
      if (user) {
        const error = new UserAlreadyExistError();
        return next(error);
      }

      /*
      * remove the user from unverified accounts if he already tries to signup
      * but haven't succeded (so that we can create a new unverified
      *  doc and otp for new signup request with same email)
      */

      await UnVerifiedAccount.findOneAndDelete({ email });

      const password = await PasswordServ.hash(body.password);
      const newUser = new UnVerifiedAccount({
        email, password, name,
      });
      const result = await newUser.save();

      const otpDoc = new OtpList({ userId: result.id, type: 'new_account_verification' });
      const otpResult = await otpDoc.save();

      await OtpServ.sendOtp(otpResult.otp, { email });
      res.json({
        uid: otpResult.id,
        message: 'Otp Sent To Your Registered Email',
      });
    } catch (error) {
      next(error);
    }
  });

module.exports = router;
