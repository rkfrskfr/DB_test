var express = require('express');
var router = express.Router();
const pool = require("../db/db");

/**
 * 카드 등록 페이지로 이동
 */
router.get('/cardRegister', async(req, res) => {
    res.render('card/cardRegister', {
        user_id: req.session.user_id,
    });
});

/**
 * 카드 등록 기능
 */
router.post('/register', async(req, res) => {
    const user_id = req.session.user_id;
    const { card_num, card_valid, card_type } = req.body;

    const saveCard = await pool.query(
        "insert into card(card_num, card_valid, card_type, user_id) values (?, ?, ?, ?);",
        [card_num, card_valid, card_type, user_id]
    );

    return res.send(
        `<script>location.href = "/mypage";</script>`
    )
});

module.exports = router;