const router = require('express').Router();
const { Tag, Product, ProductTag } = require('../../models');

// The `/api/tags` endpoint

router.get('/', async (req, res) => {
  // find all tags
  // be sure to include its associated Product data

  // Raw code returned by find all
  let tagsRaw = await Tag.findAll().catch(err => console.log(err));

  // Translate it into more friendly code
  let tags = tagsRaw.map((value) => value.get({ plain: true }));

  // Add on some products to the end of the objects
  tags = await Promise.all(tags.map(async (value) => {

    // Find every product associated with the product
    let productTagsRaw = await ProductTag.findAll({
      where: {
        tag_id: value.id,
      },
    });

    // Translate it into more friendly code
    let productTags = productTagsRaw.map((value) => value.get({ plain: true }));

    let productList = []
    await Promise.all(productTags.map(async e => {
      let entryRaw = await Product.findByPk(e.product_id);
      let entry = entryRaw.get({ plain: true });
      entry.product_tag = e;
      productList.push(entry);

    }));

    value.products = productList;

    // Resolve the promise associated with the value
    return value;
  }));

  res.json(tags);
});

router.get('/:id', async (req, res) => {
  // find a single tag by its `id`
  // be sure to include its associated Product data

  // Raw code returned by find all
  let tagRaw = await Tag.findByPk(req.params.id).catch(err => console.log(err));

  // Translate it into more friendly code
  let tag = tagRaw.get({ plain: true });

  // Find every product associated with the product
  let productTagsRaw = await ProductTag.findAll({
    where: {
      tag_id: tag.id,
    },
  });

  // Translate it into more friendly code
  let productTags = productTagsRaw.map((value) => value.get({ plain: true }));

  let productList = []
  await Promise.all(productTags.map(async e => {
    let entryRaw = await Product.findByPk(e.product_id);
    let entry = entryRaw.get({ plain: true });
    entry.product_tag = e;
    productList.push(entry);

  }));

  tag.products = productList;

  // Resolve the promise associated with the value

  res.json(tag);
});

router.post('/', (req, res) => {
  // create a new tag
  Category.create(req.body).catch(err => { res.json({ status: "Error!" }) }).then(() => {
    res.json({ status: "Success!" });
  });
});

router.put('/:id', async (req, res) => {
  // update a tag's name by its `id` value
  let tag = await Tags.findOne({
    where: {
      id: req.params.id
    }
  }).catch(err => console.log(err));

  tag["tag_name"] = req.body["tag_name"];

  await tag.save();

  res.json({ status: "Success!" });
});

router.delete('/:id', (req, res) => {
  // delete on tag by its `id` value
  Tag.destroy({
    where: {
      id: req.params.id
    }
  })
});

module.exports = router;
