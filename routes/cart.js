var express = require('express');
var router = express.Router();
const pool = require('../db/db');

/**
 * 총 금액 구하기
 */
const totalPrice = (cartlist) => {
    let total = 0;

    cartlist.forEach(cartitem => {
        total += cartitem.quantity * cartitem.price
    });

    return total;
};

/**
 * 장바구니 페이지로 이동
 */
router.get('/cart', async(req, res) => {
    const user_id = req.session.user_id;

    const [cart] = await pool.query(
        'select * from cart where user_id = ?',
        [user_id]
    );

    const [cartlist] = await pool.query(
        'select * from cartitem inner join book on cartitem.book_id = book.book_id where cart_id = ?',
        [cart[0].cart_id]
    );

    totalP = await totalPrice(cartlist);

    res.render('cart/cart', {
        user_id: user_id,
        cartlist: cartlist,
        totalPrice: totalP,
    });
});

/**
 * 장바구니 수량 변경
 */
router.post('/updateItem', async(req, res) => {
    const { cartitem_id, quantity } = req.body;
    
    const updateItem = await pool.query(
        'update cartitem set quantity = ? where cartitem_id = ?',
        [quantity, cartitem_id]
    );

    return res.send(
        `<script>location.href = "/cart/cart";</script>`
    );
});

/**
 * 장바구니 담기 기능
 */
router.post('/addItem', async(req, res) => {
    const user_id = req.session.user_id;
    const { book_id, quantity } = req.body;

    const [cart] = await pool.query(
        'select cart_id from cart where user_id = ?',
        [user_id]
    );

    const [cartitembook] = await pool.query(
        "select * from cartitem where book_id = ? and cart_id = ?",
        [book_id, cart[0].cart_id]
    );

    if (cartitembook.length < 1){
        const addcartitem = await pool.query(
            "insert into cartitem(book_id, cart_id, quantity) values (?, ?, ?)",
            [book_id, cart[0].cart_id, quantity]
        );
    } else {
        const changecartitem = await pool.query(
            "update cartitem set quantity = quantity + 1 where book_id = ? and cart_id = ?",
            [book_id, cart[0].cart_id, quantity]
        );
    }

    return res.send(
        `<script>location.href = "/cart/cart";</script>`
    );
});

module.exports = router;