var express = require('express');
var router = express.Router();
const pool = require("../db/db");

/**
 * 책 상세 페이지
 */
router.get('/detail/:book_id', async(req, res) => {
    const book_id = req.params.book_id;
    console.log(book_id, '번 상세페이지');

    const [bookdata] = await pool.query(
        "select * from book where book_id = ?",
        [book_id]
    );
    console.log(bookdata[0]);

    res.render('book/detail', {
        bookdata: bookdata[0],
        user_id: req.session.user_id,
    })
})

module.exports = router;