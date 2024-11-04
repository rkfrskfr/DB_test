/**
 * 설치
 * 1. npm init
 * 2. npm install express-generator
 * 3. npx express --view=ejs
 * 4. npm install nodemon
 */

var express = require('express');
var router = express.Router();
const pool = require("../db/db");

/**
 * 메인 페이지
 * - 책 목록 불러오기
 * - 세션
 */
router.get('/', async (req, res) => {
  const [book_data] = await pool.query("select * from book;");
  console.log(book_data);

  res.render('index', {
    books: book_data,
    user_id: req.session.user_id,
  });
})

/**
 * 검색하기
 */
router.get('/search', async (req, res) => {
  const searchTerm = req.query.searchTerm;
  const [searchData] = await pool.query(
    "select * from book where book_name like ?", [`%${searchTerm}%`]
  );
  console.log("검색어: ", searchTerm, "검색 결과: ", searchData);

  res.render('index', {
    books: searchData,
    user_id: req.session.user_id,
  });
})

/**
 * 마이페이지 이동
 * - nav에 user_id 넘겨주기
 * - cardList 조회
 * - addressList 조회
 * - orderList 조회
 */
router.get('/mypage', async (req, res) => {
  const user_id = req.session.user_id;

  const [cardList] = await pool.query(
    "select * from card where user_id = ?",
    [user_id]
  );

  const [addressList] = await pool.query(
    "select * from address where user_id = ?",
    [user_id]
  );

  const [orderList] = await pool.query(
    "select * from orderitem inner join orders on orderitem.order_id = orders.order_id where user_id = ? order by orders.order_id ASC",
    [user_id]
  );

  let ordersMap = new Map();

  for (let orderitem of orderList) {
    if (!ordersMap.has(orderitem.order_id)) {
      orderitem.order_date = new Date(orderitem.order_date).toLocaleDateString('ko-KR', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
      });
      orderitem.orderData = [];
      ordersMap.set(orderitem.order_id, orderitem);
    }

    const [bookData] = await pool.query(
      'select book.book_name from book where book_id = ?',
      [orderitem.book_id]
    );

    ordersMap.get(orderitem.order_id).orderData.push({
      book_name: bookData[0].book_name,
      quantity: orderitem.quantity
    });
  }

  const orders = Array.from(ordersMap.values());

  console.log(JSON.stringify(orders, null, 2));

  res.render('mypage', {
    cards: cardList,
    address: addressList,
    orders: orders,
    user_id: user_id,
  });
});

module.exports = router;
