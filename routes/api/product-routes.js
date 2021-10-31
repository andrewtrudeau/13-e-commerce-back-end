const router = require('express').Router();
const { Product, Category, Tag, ProductTag } = require('../../models');

// The `/api/products` endpoint

// get all products
router.get('/', async (req, res) => {
  // find all products
  // be sure to include its associated Category and Tag data

  // Raw code returned by find all
  let productsRaw = await Product.findAll().catch(err => console.log(err));

  // Translate it into more friendly code
  let products = productsRaw.map((value) => value.get({ plain: true }));

  // Add on some products to the end of the objects
  products = await Promise.all(products.map(async (value) => {

    console.log("CAT ID", value.category_id)
    let categoryRaw = await Category.findByPk(value.category_id);
    let category = categoryRaw.get({ plain: true });

    // Find every product associated with the product
    let productTagsRaw = await ProductTag.findAll({
      where: {
        tag_id: value.id,
      },
    });

    // Translate it into more friendly code
    let productTags = productTagsRaw.map((value) => value.get({ plain: true }));

    let tags = []

    await Promise.all(productTags.map(async e => {
      let entryRaw = await Tag.findByPk(e.tag_id);
      let entry = entryRaw.get({ plain: true });
      entry.product_tag = e;
      tags.push(entry);

    }));

    value.category = category;
    value.tags = tags;

    // Resolve the promise associated with the value
    return value;
  }));

  res.json(products);
});

// get one product
router.get('/:id', async (req, res) => {
  // find a single product by its `id`
  // be sure to include its associated Category and Tag data

  const product = await Product.findByPk(req.params.id).catch(err => console.log(err));

  res.json(product);
});

// create new product
router.post('/', (req, res) => {
  /* req.body should look like this...
    {
      product_name: "Basketball",
      price: 200.00,
      stock: 3,
      tagIds: [1, 2, 3, 4]
    }
  */
  Product.create(req.body)
    .then((product) => {
      // if there's product tags, we need to create pairings to bulk create in the ProductTag model
      if (req.body.tagIds.length) {
        const productTagIdArr = req.body.tagIds.map((tag_id) => {
          return {
            product_id: product.id,
            tag_id,
          };
        });
        return ProductTag.bulkCreate(productTagIdArr);
      }
      // if no product tags, just respond
      res.status(200).json(product);
    })
    .then((productTagIds) => res.status(200).json(productTagIds))
    .catch((err) => {
      console.log(err);
      res.status(400).json(err);
    });
});

// update product
router.put('/:id', (req, res) => {
  // update product data
  Product.update(req.body, {
    where: {
      id: req.params.id,
    },
  })
    .then((product) => {
      // find all associated tags from ProductTag
      return ProductTag.findAll({ where: { product_id: req.params.id } });
    })
    .then((productTags) => {
      // get list of current tag_ids
      const productTagIds = productTags.map(({ tag_id }) => tag_id);
      // create filtered list of new tag_ids
      const newProductTags = req.body.tagIds
        .filter((tag_id) => !productTagIds.includes(tag_id))
        .map((tag_id) => {
          return {
            product_id: req.params.id,
            tag_id,
          };
        });
      // figure out which ones to remove
      const productTagsToRemove = productTags
        .filter(({ tag_id }) => !req.body.tagIds.includes(tag_id))
        .map(({ id }) => id);

      // run both actions
      return Promise.all([
        ProductTag.destroy({ where: { id: productTagsToRemove } }),
        ProductTag.bulkCreate(newProductTags),
      ]);
    })
    .then((updatedProductTags) => res.json(updatedProductTags))
    .catch((err) => {
      // console.log(err);
      res.status(400).json(err);
    });
});

router.delete('/:id', (req, res) => {
  Product.destroy({
    where: {
      id: req.params.id
    }
  })
});

module.exports = router;
