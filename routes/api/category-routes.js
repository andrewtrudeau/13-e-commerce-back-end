const router = require('express').Router();
const { Category, Product } = require('../../models');




// The `/api/categories` endpoint

router.get('/', async (req, res) => {
  // find all categories
  // be sure to include its associated Products

  // Raw code returned by find all
  let categoriesRaw = await Category.findAll().catch(err => console.log(err));

  // Translate it into more friendly code
  let categories = categoriesRaw.map((value) => value.get({ plain: true }));

  // Add on some products to the end of the objects
  categories = await Promise.all(categories.map(async (value) => {

    // Find every product associated with the category
    let productsRaw = await Product.findAll({
      where: {
        category_id: value.id,
      },
    });

    // Translate it into more friendly code
    let products = productsRaw.map((value) => value.get({ plain: true }));

    // Add the JSON value
    value.products = products;

    // Resolve the promise associated with the value
    return value;
  }));

  res.json(categories);
});

router.get('/:id', async (req, res) => {
  // find one category by its `id` value
  // be sure to include its associated Products

  // Get category by ID
  let categoryRaw = await Category.findByPk(req.params.id).catch(err => console.log(err));

  // Translate it into more friendly code
  let category = categoryRaw.get({ plain: true });

  // Find every product associated with the category
  let productsRaw = await Product.findAll({
    where: {
      category_id: category.id,
    },
  });

  // Translate it into more friendly code
  let products = productsRaw.map((value) => value.get({ plain: true }));

  // Add the JSON value
  category.products = products;

  res.json(category);
});

router.post('/', (req, res) => {
  // create a new category

  Category.create(req.body).catch(err => { res.json({ status: "Error!" }) }).then(() => {
    res.json({ status: "Success!" });
  });
});

router.put('/:id', async (req, res) => {
  // update a category by its `id` value

  let category = await Category.findOne({
    where: {
      id: req.params.id
    }
  }).catch(err => console.log(err));

  category["category_name"] = req.body["category_name"];

  await category.save();

  res.json({ status: "Success!" });
});

router.delete('/:id', (req, res) => {
  // delete a category by its `id` valueW
  Category.destroy({
    where: {
      id: req.params.id
    }
  })
});

module.exports = router;
