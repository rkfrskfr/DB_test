var express = require('express');
var router = express.Router();
const pool = require("../db/db");

/**
 * 주소 등록 페이지로 이동
 */
router.get('/addressRegister', async(req, res) => {
    res.render('address/addressRegister', {
        user_id: req.session.user_id,
    });
});

/**
 * 주소 등록 기능
 */
router.post('/register', async(req, res) => {
    const user_id = req.session.user_id;
    const { postal_code, basic_address, detail_address } = req.body;

    const saveAddress = await pool.query(
        "insert into address(postal_code, basic_address, detail_address, user_id) values (?, ?, ?, ?);",
        [postal_code, basic_address, detail_address, user_id]
    );

    return res.send(
        `<script>location.href = "/mypage";</script>`
    );
});

module.exports = router;