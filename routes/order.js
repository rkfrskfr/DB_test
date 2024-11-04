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
 * 장바구니 주문하기 페이지로 이동
 */
router.get('/cartOrder', async(req, res) => {
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

    const [addresslist] = await pool.query(
        'select * from address where user_id = ?',
        [user_id]
    );

    const [cardlist] = await pool.query(
        'select * from card where user_id = ?',
        [user_id]
    );

    res.render('order/cartOrder', {
        user_id: user_id,
        cartlist: cartlist,
        addresslist: addresslist,
        cardlist: cardlist,
        totalP: totalP
    });
});

/**
 * 장바구니 주문하기 기능
 */
router.post('/orderCart', async(req, res) => {
    const user_id = req.session.user_id;
    const { card_num, postal_code } = req.body;

    const [cart] = await pool.query(
        'select * from cart where user_id = ?',
        [user_id]
    );

    const [cartlist] = await pool.query(
        'select * from cartitem inner join book on cartitem.book_id = book.book_id where cart_id = ?',
        [cart[0].cart_id]
    );
    totalP = await totalPrice(cartlist);

    newOrder_id = await saveOrder(user_id, card_num, postal_code, totalP);

    for (let i = 0; i < cartlist.length; i++) {
        const cartitem = cartlist[i];
        await pool.query(
            'insert into orderitem (order_id, book_id, quantity) values (?, ?, ?)',
            [newOrder_id, cartitem.book_id, cartitem.quantity]
        );
        await pool.query(
            'update book set stock = stock - ? where book_id = ?',
            [ cartitem.quantity, cartitem.book_id ]
        );
    }

    const deleteItem = await pool.query(
        'delete from cartitem where cart_id = ?',
        [cart[0].cart_id]
    );

    return res.send(
        `<script>location.href = "/";</script>`
    )
})


/**
 * 주문하기 order 테이블에 생성 후 아이디 반환
 */
const saveOrder = async (user_id, card_num, postal_code, totalP) => {
    // const [findPay] = await pool.query(
    //     'select * from pay where user_id = ?',
    //     [user_id]
    // );
    // console.log(findPay);

    const [findCard] = await pool.query(
        'select * from card where card_num = ?',
        [card_num]
    );

    const [findAddress] = await pool.query(
        'select * from address where postal_code = ?',
        [postal_code]
    );

    const saveOrder = await pool.query(
        'insert into orders (card_num, price, card_type, card_valid, postal_code, basic_address, detail_address, order_date, user_id) values (?, ?, ?, ?, ?, ?, ?, now(), ?)',
        [card_num, totalP, findCard[0].card_type, findCard[0].card_valid, postal_code, findAddress[0].basic_address, findAddress[0].detail_address, user_id]
    )

    // const saveOrder = await pool.query(
    //     'insert into orders (card_num, price, card_type, card_valid, postal_code, basic_address, detail_address, order_date, user_id, card_price, pay_price) values (?, ?, ?, ?, ?, ?, ?, now(), ?, ?, ?)',
    //     [card_num, totalP, findCard[0].card_type, findCard[0].card_valid, postal_code, findAddress[0].basic_address, findAddress[0].detail_address, user_id, ]
    // )

    return saveOrder[0].insertId;
}

/**
 * 책 상세페이지에서 바로 주문하기
 * - 주문하기 페이지
 */
router.post('/bookOrder', async(req, res)=>{
    const user_id = req.session.user_id;
    const { book_id, quantity } = req.body;
    console.log("책 구매");
    console.log(book_id);
    console.log(user_id);

    const [bookData] = await pool.query(
        'select * from book where book_id = ?',
        [ book_id ]
    );

    const sumPrice = bookData[0].price * quantity;

    const [addresslist] = await pool.query(
        'select * from address where user_id = ?',
        [user_id]
    );

    const [cardlist] = await pool.query(
        'select * from card where user_id = ?',
        [user_id]
    );

    const changeStock = await pool.query(
        'update book set stock = stock - ? where book_id = ?',
        [ quantity, book_id ]
    );

    res.render('order/bookOrder', {
        user_id: user_id,
        quantity: quantity,
        bookData: bookData[0],
        addresslist: addresslist,
        cardlist: cardlist,
        price: sumPrice,
    });
})

/**
 * 책 바로주문하기 기능
 */
router.post('/orderBook', async(req, res) => {
    const user_id = req.session.user_id;
    const { book_id, price, card_num, postal_code, quantity } = req.body;

    newOrder_id = await saveOrder(user_id, card_num, postal_code, price);

    const saveBookOrder = await pool.query(
        'insert into orderitem (order_id, book_id, quantity) values (?, ?, ?)',
        [newOrder_id, book_id, quantity]
    )

    return res.send(
        `<script>location.href = "/";</script>`
    );
})

module.exports = router;